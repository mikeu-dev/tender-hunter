import { Queue } from 'bullmq';
import { redisConnection } from '../../lib/redis.js';

export const CRAWLER_QUEUE_NAME = 'crawler-tasks';

// 1. Definisikan antrean BullMQ
export const crawlerQueue = new Queue(CRAWLER_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    // Strategi Error Retry: Coba hingga 3 kali dengan exponential backoff
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // Coba lagi setelah 5 detik, kemudian 10 detik, dst.
    },
    removeOnComplete: {
      age: 24 * 3600, // Simpan histori job sukses selama 24 jam
      count: 1000,    // Maksimal 1000 job sukses disimpan
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Simpan histori job gagal selama 7 hari untuk debugging
    },
  },
});

/**
 * Menambahkan pekerjaan crawl source ke antrean
 * @param sourceId ID dari source di database
 * @param force Apakah akan melewati pengecekan status (misal jika source tidak aktif)
 */
export async function queueCrawlJob(sourceId: string, force = false) {
  return crawlerQueue.add(
    'crawl-source',
    { sourceId, force },
    {
      jobId: `crawl-${sourceId}-${Date.now()}`, // Menghindari duplikasi job instan yang sama
    }
  );
}
