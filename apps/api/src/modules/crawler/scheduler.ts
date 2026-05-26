import { crawlerQueue } from './queue.js';
import { db, sources, eq } from '@tender-hunter/shared';

/**
 * Menyinkronkan penjadwal BullMQ dengan data sources aktif di database.
 * Fungsi ini menghapus semua repeatable jobs lama dan mendaftarkan ulang jadwal cron
 * untuk semua data source yang berstatus aktif (isActive = true).
 */
export async function syncCrawlerScheduler() {
  console.log('[CrawlerScheduler] Synchronizing crawler schedule with database...');

  try {
    // 1. Ambil semua repeatable jobs yang terdaftar saat ini di BullMQ
    const repeatableJobs = await crawlerQueue.getRepeatableJobs();
    
    // 2. Hapus semua repeatable jobs lama agar bersih
    console.log(`[CrawlerScheduler] Removing ${repeatableJobs.length} existing scheduled tasks...`);
    for (const job of repeatableJobs) {
      await crawlerQueue.removeRepeatableByKey(job.key);
    }

    // 3. Ambil semua source aktif dari database
    const activeSources = await db.query.sources.findMany({
      where: eq(sources.isActive, true),
    });

    console.log(`[CrawlerScheduler] Registering ${activeSources.length} active sources for scheduled crawling...`);

    // 4. Daftarkan repeatable job untuk masing-masing source aktif
    for (const source of activeSources) {
      const cronSchedule = source.crawlSchedule || '*/30 * * * *';
      
      console.log(`[CrawlerScheduler] Scheduling source: "${source.name}" with cron: "${cronSchedule}"`);
      
      await crawlerQueue.add(
        'crawl-source',
        { sourceId: source.id },
        {
          repeat: {
            pattern: cronSchedule,
          },
          // Menyimpan metadata jobId untuk keperluan pelacakan
          jobId: `repeat-${source.id}`,
        }
      );
    }

    console.log('[CrawlerScheduler] Scheduler synchronization completed successfully.');
  } catch (error) {
    console.error('[CrawlerScheduler] Failed to synchronize scheduler:', error);
    throw error;
  }
}
