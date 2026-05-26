import crypto from 'crypto';
import { db, tenders, sources, crawlJobs, eq } from '@tender-hunter/shared';
import type { CrawlResult } from '../../adapters/base.adapter.js';
import { LpseAdapter } from '../../adapters/lpse.adapter.js';
import type { AdapterConfig } from '../../adapters/base.adapter.js';

/**
 * Crawler Engine
 * 
 * Orchestrates the crawling pipeline:
 * 1. Load active sources from DB
 * 2. Instantiate the correct adapter for each source
 * 3. Execute crawl and collect results
 * 4. Deduplicate using content_hash (SHA-256)
 * 5. Store new/updated tenders in DB
 * 6. Record crawl job stats
 */

export class CrawlerEngine {
  
  /**
   * Run a crawl for a specific source by ID
   */
  async crawlSource(sourceId: string): Promise<{ jobId: string; stats: { itemsFound: number; itemsNew: number; itemsUpdated: number } }> {
    // 1. Get source from DB
    const source = await db.query.sources.findFirst({
      where: eq(sources.id, sourceId),
    });

    if (!source) {
      throw new Error(`Source not found: ${sourceId}`);
    }

    if (!source.isActive) {
      throw new Error(`Source is inactive: ${source.name}`);
    }

    // 2. Create crawl job record
    const [job] = await db.insert(crawlJobs).values({
      sourceId: source.id,
      status: 'running',
      startedAt: new Date(),
    }).returning();

    const stats = { itemsFound: 0, itemsNew: 0, itemsUpdated: 0 };

    try {
      // 3. Instantiate the adapter
      const adapter = this.createAdapter(source.adapterType, source.name, {
        baseUrl: source.baseUrl,
        config: (source.config as Record<string, unknown>) || {},
        maxPages: ((source.config as any)?.maxPages) || 5,
        requestDelay: ((source.config as any)?.requestDelay) || 2000,
      });

      // 4. Execute crawl
      console.log(`[CrawlerEngine] Starting crawl for source: ${source.name} (${source.adapterType})`);
      const results = await adapter.crawl();
      stats.itemsFound = results.length;

      // 5. Process results with deduplication
      for (const item of results) {
        const contentHash = this.generateContentHash(item);
        
        // Check if tender already exists (by content hash)
        const existing = await db.query.tenders.findFirst({
          where: eq(tenders.contentHash, contentHash),
        });

        if (existing) {
          // Update existing tender if data changed
          await db.update(tenders)
            .set({
              title: item.title,
              organizationName: item.organizationName,
              budget: item.budget,
              category: item.category,
              procurementType: item.procurementType,
              qualification: item.qualification,
              status: item.status || 'open',
              rawData: item.rawData as any,
              updatedAt: new Date(),
            })
            .where(eq(tenders.id, existing.id));
          stats.itemsUpdated++;
        } else {
          // Insert new tender
          await db.insert(tenders).values({
            sourceId: source.id,
            externalId: item.externalId,
            url: item.url,
            title: item.title,
            organizationName: item.organizationName,
            budget: item.budget,
            budgetCurrency: 'IDR',
            category: item.category,
            subcategory: item.subcategory,
            procurementType: item.procurementType,
            region: item.region,
            province: item.province,
            city: item.city,
            qualification: item.qualification,
            eligibility: item.eligibility,
            registrationDeadline: item.registrationDeadline,
            submissionDeadline: item.submissionDeadline,
            status: item.status || 'open',
            rawData: item.rawData as any,
            contentHash,
          });
          stats.itemsNew++;
        }
      }

      // 6. Update source last crawled timestamp
      await db.update(sources)
        .set({
          lastCrawledAt: new Date(),
          healthStatus: 'healthy',
          errorCount: 0,
          updatedAt: new Date(),
        })
        .where(eq(sources.id, source.id));

      // 7. Mark job as completed
      await db.update(crawlJobs)
        .set({
          status: 'completed',
          completedAt: new Date(),
          itemsFound: stats.itemsFound,
          itemsNew: stats.itemsNew,
          itemsUpdated: stats.itemsUpdated,
        })
        .where(eq(crawlJobs.id, job.id));

      console.log(`[CrawlerEngine] Completed: ${source.name} — Found: ${stats.itemsFound}, New: ${stats.itemsNew}, Updated: ${stats.itemsUpdated}`);

    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      
      // Update source health
      await db.update(sources)
        .set({
          healthStatus: 'degraded',
          errorCount: (source.errorCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(sources.id, source.id));

      // Mark job as failed
      await db.update(crawlJobs)
        .set({
          status: 'failed',
          completedAt: new Date(),
          itemsFound: stats.itemsFound,
          itemsNew: stats.itemsNew,
          itemsUpdated: stats.itemsUpdated,
          errorMessage: errMsg,
        })
        .where(eq(crawlJobs.id, job.id));

      console.error(`[CrawlerEngine] Failed: ${source.name} — ${errMsg}`);
      throw error;
    }

    return { jobId: job.id, stats };
  }

  /**
   * Run crawl for ALL active sources
   */
  async crawlAll(): Promise<Array<{ sourceId: string; sourceName: string; stats: { itemsFound: number; itemsNew: number; itemsUpdated: number } }>> {
    const activeSources = await db.query.sources.findMany({
      where: eq(sources.isActive, true),
    });

    console.log(`[CrawlerEngine] Starting crawl for ${activeSources.length} active sources`);

    const results = [];

    for (const source of activeSources) {
      try {
        const { stats } = await this.crawlSource(source.id);
        results.push({ sourceId: source.id, sourceName: source.name, stats });
      } catch (error) {
        console.error(`[CrawlerEngine] Source ${source.name} failed, continuing to next...`);
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          stats: { itemsFound: 0, itemsNew: 0, itemsUpdated: 0 },
        });
      }

      // Delay between sources to be respectful
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    return results;
  }

  /**
   * Factory method to create the right adapter based on type
   */
  private createAdapter(adapterType: string, name: string, config: AdapterConfig) {
    switch (adapterType) {
      case 'lpse':
        return new LpseAdapter(name, config);
      default:
        throw new Error(`Unknown adapter type: ${adapterType}`);
    }
  }

  /**
   * Generate SHA-256 hash for content deduplication
   */
  private generateContentHash(item: CrawlResult): string {
    const content = `${item.externalId}|${item.title}|${item.organizationName || ''}|${item.budget || ''}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

export const crawlerEngine = new CrawlerEngine();
