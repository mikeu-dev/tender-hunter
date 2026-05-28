import { crawlerEngine } from '../modules/crawler/engine.js';
import { db, sources, eq } from '@tender-hunter/shared';

async function main() {
  console.log('[Trigger] Starting manual crawler trigger...');
  
  const activeSources = await db.query.sources.findMany({
    where: eq(sources.isActive, true),
  });

  if (activeSources.length === 0) {
    console.log('No active sources found in database. Exiting.');
    process.exit(0);
  }

  for (const source of activeSources) {
    console.log(`[Trigger] Initiating crawl for source: ${source.name}`);
    try {
      const result = await crawlerEngine.crawlSource(source.id);
      console.log(`[Trigger] Successfully crawled ${source.name}. Stats:`, result.stats);
    } catch (err) {
      console.error(`[Trigger] Failed to crawl ${source.name}:`, err);
    }
  }

  console.log('[Trigger] Manual crawler trigger completed. Wait a few seconds for background AI enrichment to finish.');
  // Wait a few seconds for AI enrichment jobs (promises) to finish
  await new Promise(res => setTimeout(res, 5000));
  process.exit(0);
}

main().catch(err => {
  console.error('[Trigger] Error:', err);
  process.exit(1);
});
