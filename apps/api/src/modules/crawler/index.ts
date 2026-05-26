import { Hono } from 'hono';
import { crawlerEngine } from './engine.js';
import { db, sources, crawlJobs, eq, desc } from '@tender-hunter/shared';
import { queueCrawlJob } from './queue.js';
import { syncCrawlerScheduler } from './scheduler.js';

const crawlerRouter = new Hono();

/**
 * GET /api/crawler/sources
 * List all configured data sources
 */
crawlerRouter.get('/sources', async (c) => {
  const allSources = await db.query.sources.findMany({
    orderBy: [desc(sources.createdAt)],
  });
  return c.json(allSources);
});

/**
 * POST /api/crawler/sources
 * Create a new data source
 */
crawlerRouter.post('/sources', async (c) => {
  const body = await c.req.json();

  if (!body.name || !body.adapterType || !body.baseUrl) {
    return c.json({ error: 'name, adapterType, and baseUrl are required' }, 400);
  }

  const [newSource] = await db.insert(sources).values({
    name: body.name,
    adapterType: body.adapterType,
    baseUrl: body.baseUrl,
    config: body.config || {},
    crawlSchedule: body.crawlSchedule || '*/30 * * * *',
    isActive: body.isActive !== false,
  }).returning();

  // Sinkronisasikan penjadwal setelah source baru ditambahkan
  if (newSource.isActive) {
    await syncCrawlerScheduler().catch(err => 
      console.error('[CrawlerRouter] Failed to sync scheduler on source creation:', err)
    );
  }

  return c.json(newSource, 201);
});

/**
 * POST /api/crawler/sources/seed
 * Seed initial LPSE sources for MVP (top IT-related government institutions)
 */
crawlerRouter.post('/sources/seed', async (c) => {
  const lpseInstances = [
    { name: 'LPSE Kemenkominfo', baseUrl: 'https://lpse.kominfo.go.id' },
    { name: 'LPSE Kemenkeu', baseUrl: 'https://lpse.kemenkeu.go.id' },
    { name: 'LPSE Kemenkes', baseUrl: 'https://lpse.kemkes.go.id' },
    { name: 'LPSE Kemendikbud', baseUrl: 'https://lpse.kemdikbud.go.id' },
    { name: 'LPSE Kemenhub', baseUrl: 'https://lpse.dephub.go.id' },
    { name: 'LPSE Kemenag', baseUrl: 'https://lpse.kemenag.go.id' },
    { name: 'LPSE Kemenperin', baseUrl: 'https://lpse.kemenperin.go.id' },
    { name: 'LPSE Kementan', baseUrl: 'https://lpse.pertanian.go.id' },
    { name: 'LPSE BSSN', baseUrl: 'https://lpse.bssn.go.id' },
    { name: 'LPSE BPS', baseUrl: 'https://lpse.bps.go.id' },
  ];

  const seeded = [];
  for (const inst of lpseInstances) {
    // Skip if already exists
    const existing = await db.query.sources.findFirst({
      where: eq(sources.baseUrl, inst.baseUrl),
    });
    if (existing) continue;

    const [created] = await db.insert(sources).values({
      name: inst.name,
      adapterType: 'lpse',
      baseUrl: inst.baseUrl,
      config: { maxPages: 3, requestDelay: 2000 },
      isActive: true,
    }).returning();

    seeded.push(created);
  }

  // Sinkronisasikan penjadwal setelah seeding
  if (seeded.length > 0) {
    await syncCrawlerScheduler().catch(err => 
      console.error('[CrawlerRouter] Failed to sync scheduler after seeding:', err)
    );
  }

  return c.json({ message: `Seeded ${seeded.length} new LPSE sources`, sources: seeded });
});

/**
 * POST /api/crawler/run/:sourceId
 * Trigger a crawl for a specific source asynchronously via BullMQ Queue
 */
crawlerRouter.post('/run/:sourceId', async (c) => {
  const sourceId = c.req.param('sourceId');

  // Cek apakah source ada
  const source = await db.query.sources.findFirst({
    where: eq(sources.id, sourceId),
  });

  if (!source) {
    return c.json({ error: `Source not found: ${sourceId}` }, 404);
  }

  try {
    const job = await queueCrawlJob(sourceId);
    return c.json({
      message: `Crawl job for source "${source.name}" successfully queued`,
      jobId: job.id,
      status: 'queued',
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return c.json({ error: errMsg }, 500);
  }
});

/**
 * POST /api/crawler/run-all
 * Trigger a crawl for all active sources asynchronously via BullMQ Queue
 */
crawlerRouter.post('/run-all', async (c) => {
  try {
    const activeSources = await db.query.sources.findMany({
      where: eq(sources.isActive, true),
    });

    if (activeSources.length === 0) {
      return c.json({ message: 'No active sources found to crawl.' });
    }

    const queuedJobs = [];
    for (const source of activeSources) {
      const job = await queueCrawlJob(source.id);
      queuedJobs.push({
        sourceId: source.id,
        sourceName: source.name,
        jobId: job.id,
      });
    }

    return c.json({
      message: `Successfully queued crawl jobs for ${activeSources.length} active sources.`,
      jobs: queuedJobs,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return c.json({ error: errMsg }, 500);
  }
});

/**
 * POST /api/crawler/scheduler/sync
 * Manually synchronize crawler scheduler with active sources in database
 */
crawlerRouter.post('/scheduler/sync', async (c) => {
  try {
    await syncCrawlerScheduler();
    return c.json({ message: 'Crawler scheduler successfully synchronized with database.' });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return c.json({ error: errMsg }, 500);
  }
});

/**
 * GET /api/crawler/jobs
 * List recent crawl jobs
 */
crawlerRouter.get('/jobs', async (c) => {
  const jobs = await db.query.crawlJobs.findMany({
    orderBy: [desc(crawlJobs.createdAt)],
    limit: 50,
  });
  return c.json(jobs);
});

/**
 * GET /api/crawler/health
 * Check health status of all active sources
 */
crawlerRouter.get('/health', async (c) => {
  const activeSources = await db.query.sources.findMany({
    where: eq(sources.isActive, true),
  });

  return c.json(activeSources.map(s => ({
    id: s.id,
    name: s.name,
    healthStatus: s.healthStatus,
    lastCrawledAt: s.lastCrawledAt,
    errorCount: s.errorCount,
  })));
});

export default crawlerRouter;
