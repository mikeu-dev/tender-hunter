import { Worker, type Job } from 'bullmq';
import { getRedisConnection } from '../../lib/redis.js';
import { db, notificationLogs, eq } from '@tender-hunter/shared';
import { NOTIFICATION_QUEUE_NAME, type NotificationJobData } from './queue.js';
import { sendTelegramNotification } from './telegram.js';
import { sendEmailNotification } from './email.js';

let worker: Worker | null = null;

export function startNotificationWorker() {
  if (worker) {
    console.log('[NotificationWorker] Worker is already running.');
    return worker;
  }

  console.log('[NotificationWorker] Starting background notification worker...');

  const connection = getRedisConnection();

  worker = new Worker(
    NOTIFICATION_QUEUE_NAME,
    async (job: Job<NotificationJobData>) => {
      const { logId, channel, recipient, payload } = job.data;
      console.log(`[NotificationWorker] Processing job ${job.id} for recipient: ${recipient} (${channel})`);
      
      try {
        // 1. Eksekusi Pengiriman Berdasarkan Saluran
        let result: { success: boolean; error?: string } = { success: false };
        
        if (channel === 'telegram') {
          result = await sendTelegramNotification(recipient, payload.formattedMessage);
        } else if (channel === 'email') {
          const subject = `📢 Peluang Tender Baru Cocok (${payload.matchScore}% Match): ${payload.title}`;
          result = await sendEmailNotification(recipient, subject, payload.formattedMessage);
        }

        // 2. Catat dan Perbarui Status Log di Database
        if (result.success) {
          console.log(`[NotificationWorker] Job ${job.id} successfully delivered.`);
          await db.update(notificationLogs)
            .set({
              status: 'sent',
            })
            .where(eq(notificationLogs.id, logId));
            
          return { success: true };
        } else {
          throw new Error(result.error || 'Unknown delivery failure');
        }

      } catch (error: any) {
        const errMsg = error.message || String(error);
        console.error(`[NotificationWorker] Job ${job.id} delivery attempt failed:`, errMsg);
        
        // Perbarui status log menjadi failed di database
        await db.update(notificationLogs)
          .set({
            status: 'failed',
            errorMessage: errMsg,
          })
          .where(eq(notificationLogs.id, logId));

        throw error; // Lemparkan error kembali untuk mekanisme BullMQ retry
      }
    },
    {
      connection,
      concurrency: 3, // Mengizinkan 3 pengiriman paralel
      limiter: {
        max: 10,
        duration: 5000, // Batasi maksimal 10 notifikasi per 5 detik untuk mencegah diblokir oleh Telegram/SMTP
      },
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[NotificationWorker] Job ${job?.id || 'unknown'} failed completely: ${err.message}`);
  });

  return worker;
}

export async function stopNotificationWorker() {
  if (worker) {
    console.log('[NotificationWorker] Stopping worker...');
    await worker.close();
    worker = null;
    console.log('[NotificationWorker] Worker stopped.');
  }
}
