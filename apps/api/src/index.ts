import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRouter from './modules/auth/index.js'
import companyRouter from './modules/company/index.js'
import crawlerRouter from './modules/crawler/index.js'
import tenderRouter from './modules/tender/index.js'
import { startCrawlerWorker } from './modules/crawler/worker.js'
import { syncCrawlerScheduler } from './modules/crawler/scheduler.js'

const app = new Hono()

app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

app.get('/', (c) => {
  return c.text('Tender Hunter API v1')
})

app.route('/api/auth', authRouter)
app.route('/api/company', companyRouter)
app.route('/api/crawler', crawlerRouter)
app.route('/api/tenders', tenderRouter)

const port = 3000
serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
  
  // Inisialisasi background crawler worker dan scheduler
  try {
    startCrawlerWorker();
    syncCrawlerScheduler()
      .then(() => console.log('[Crawler] Scheduler initialized successfully.'))
      .catch((err) => console.error('[Crawler] Failed to initialize scheduler:', err));
  } catch (err) {
    console.error('[Crawler] Error starting crawler infrastructure:', err);
  }
})

