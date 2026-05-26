import { Worker, type Job } from 'bullmq';
import { getRedisConnection } from '../../lib/redis.js';
import { crawlerEngine } from './engine.js';
import { CRAWLER_QUEUE_NAME } from './queue.js';

let worker: Worker | null = null;

export function startCrawlerWorker() {
  if (worker) {
    console.log('[CrawlerWorker] Worker is already running.');
    return worker;
  }

  console.log('[CrawlerWorker] Starting background worker...');

  // Worker membutuhkan koneksi Redis terpisah karena BullMQ menggunakan fitur blocking
  const connection = getRedisConnection();

  worker = new Worker(
    CRAWLER_QUEUE_NAME,
    async (job: Job<{ sourceId: string; force?: boolean }>) => {
      const { sourceId } = job.data;
      console.log(`[CrawlerWorker] Processing job ${job.id} for sourceId: ${sourceId}`);
      
      try {
        const result = await crawlerEngine.crawlSource(sourceId);
        console.log(`[CrawlerWorker] Job ${job.id} succeeded. Stats:`, result.stats);
        return result;
      } catch (error) {
        console.error(`[CrawlerWorker] Job ${job.id} failed on attempt ${job.attemptsMade}:`, error);
        throw error; // Lemparkan error agar strategi retry BullMQ memicunya kembali jika belum mencapai batas attempts
      }
    },
    {
      connection,
      concurrency: 2, // Batasi 2 pencarian paralel agar tidak membebani network/database
      limiter: {
        max: 5,
        duration: 10000, // Batasi maksimal 5 pekerjaan per 10 detik secara global
      },
    }
  );

  worker.on('active', (job) => {
    console.log(`[CrawlerWorker] Job ${job.id} has started processing.`);
  });

  worker.on('completed', (job) => {
    console.log(`[CrawlerWorker] Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[CrawlerWorker] Job ${job?.id || 'unknown'} failed: ${err.message}`);
  });

  return worker;
}

export async function stopCrawlerWorker() {
  if (worker) {
    console.log('[CrawlerWorker] Stopping worker...');
    await worker.close();
    worker = null;
    console.log('[CrawlerWorker] Worker stopped.');
  }
}
