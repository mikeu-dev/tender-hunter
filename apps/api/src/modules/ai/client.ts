import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

// Ekspor flag untuk mendeteksi apakah kita menggunakan mode mock
export const isMockAi = !apiKey || apiKey === 'mock' || apiKey.startsWith('YOUR_');

if (isMockAi) {
  console.warn('[AI] OPENAI_API_KEY is not configured or using a placeholder. The system will run in MOCK AI mode.');
}

// Inisialisasi klien OpenAI secara opsional
export const openai = isMockAi 
  ? null 
  : new OpenAI({ apiKey });
