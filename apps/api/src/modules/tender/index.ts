import { Hono } from 'hono';
import { db, tenders, desc, eq } from '@tender-hunter/shared';

const tenderRouter = new Hono();

/**
 * GET /api/tenders
 * List tenders with pagination and basic filtering
 */
tenderRouter.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
  const offset = (page - 1) * limit;
  const status = c.req.query('status');
  const category = c.req.query('category');

  // Build a simple query — we rely on Drizzle's query builder
  const allTenders = await db.query.tenders.findMany({
    orderBy: [desc(tenders.createdAt)],
    limit,
    offset,
    ...(status ? { where: eq(tenders.status, status) } : {}),
  });

  return c.json({
    data: allTenders,
    pagination: { page, limit, offset },
  });
});

/**
 * GET /api/tenders/:id
 * Get a single tender by ID
 */
tenderRouter.get('/:id', async (c) => {
  const id = c.req.param('id');

  const tender = await db.query.tenders.findFirst({
    where: eq(tenders.id, id),
  });

  if (!tender) {
    return c.json({ error: 'Tender not found' }, 404);
  }

  return c.json(tender);
});

export default tenderRouter;
