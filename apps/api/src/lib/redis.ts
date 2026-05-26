import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const getRedisConnection = () => {
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Diperlukan oleh BullMQ
    showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
  });
};

export const redisConnection = getRedisConnection();
