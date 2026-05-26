import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import authRouter from './modules/auth/index.js'
import companyRouter from './modules/company/index.js'
import crawlerRouter from './modules/crawler/index.js'
import tenderRouter from './modules/tender/index.js'
import notificationRouter from './modules/notification/index.js'
import billingRouter from './modules/billing/index.js'
import { startCrawlerWorker } from './modules/crawler/worker.js'
import { syncCrawlerScheduler } from './modules/crawler/scheduler.js'
import { startNotificationWorker } from './modules/notification/worker.js'

const app = new Hono()

app.use('*', secureHeaders())

app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

app.onError((err, c) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  }
  console.error(JSON.stringify(errorLog))
  return c.json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  }, 500)
})

app.get('/', (c) => {
  return c.text('Tender Hunter API v1')
})

app.route('/api/auth', authRouter)
app.route('/api/company', companyRouter)
app.route('/api/crawler', crawlerRouter)
app.route('/api/tenders', tenderRouter)
app.route('/api/notification', notificationRouter)
app.route('/api/billing', billingRouter)

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

  // Inisialisasi background notification worker
  try {
    startNotificationWorker();
    console.log('[Notification] Background worker started successfully.');
  } catch (err) {
    console.error('[Notification] Failed to start background notification worker:', err);
  }
})

