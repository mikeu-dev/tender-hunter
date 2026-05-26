import { Queue } from 'bullmq';
import { redisConnection } from '../../lib/redis.js';

export const NOTIFICATION_QUEUE_NAME = 'notification-tasks';

// 1. Definisikan antrean BullMQ khusus notifikasi
export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    // Strategi Error Retry: Coba hingga 3 kali dengan exponential backoff jika API eksternal (Telegram/SMTP) down/rate limit
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000, // Coba lagi setelah 10 detik, kemudian 20 detik, dst.
    },
    removeOnComplete: {
      age: 12 * 3600, // Simpan histori pengiriman sukses selama 12 jam
      count: 2000,
    },
    removeOnFail: {
      age: 5 * 24 * 3600, // Simpan log pengiriman gagal selama 5 hari untuk debugging
    },
  },
});

export interface NotificationJobData {
  logId: string; // ID dari log di database notification_logs untuk pencatatan status
  tenderId: string;
  channel: 'email' | 'telegram';
  recipient: string;
  payload: {
    title: string;
    orgName: string;
    matchScore: number;
    formattedMessage: string;
  };
}

/**
 * Menambahkan tugas pengiriman notifikasi ke antrean asinkron
 */
export async function queueNotificationJob(data: NotificationJobData) {
  return notificationQueue.add(
    `send-${data.channel}`,
    data,
    {
      jobId: `notif-${data.logId}`, // Menjamin id unik dan tidak redundan
    }
  );
}
