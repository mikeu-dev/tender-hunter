import { Hono } from 'hono';
import { db, alertRules, notificationLogs, desc, eq, and } from '@tender-hunter/shared';
import { checkAlertRulesLimitMiddleware } from '../billing/limits.js';

const notificationRouter = new Hono();

/**
 * GET /api/notification/rules
 * List all alert rules for an organization
 */
notificationRouter.get('/rules', async (c) => {
  const orgId = c.req.query('orgId');

  let rules;
  if (orgId) {
    rules = await db.query.alertRules.findMany({
      where: eq(alertRules.orgId, orgId),
      orderBy: [desc(alertRules.createdAt)],
    });
  } else {
    // Fallback: Tampilkan semua aturan lelang untuk kemudahan pengujian
    rules = await db.query.alertRules.findMany({
      orderBy: [desc(alertRules.createdAt)],
    });
  }

  return c.json(rules);
});

/**
 * POST /api/notification/rules
 * Create a new alert rule (protected by subscription limits middleware)
 */
notificationRouter.post('/rules', checkAlertRulesLimitMiddleware, async (c) => {
  // Gunakan body yang sudah di-parse dan divalidasi oleh middleware
  const body = (c as any).get('parsedJsonBody') || await c.req.json().catch(() => ({}));

  if (!body.name || !body.orgId) {
    return c.json({ error: 'name and orgId are required' }, 400);
  }

  const [newRule] = await db.insert(alertRules).values({
    orgId: body.orgId,
    name: body.name,
    keywords: body.keywords || [],
    categories: body.categories || [],
    minBudget: body.minBudget || 0,
    minMatchScore: body.minMatchScore || 0,
    channels: body.channels || ['email'],
    telegramChatId: body.telegramChatId || null,
    emailAddress: body.emailAddress || null,
    isActive: body.isActive !== false,
  }).returning();

  return c.json(newRule, 201);
});

/**
 * PUT /api/notification/rules/:id
 * Update an existing alert rule
 */
notificationRouter.put('/rules/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  const existing = await db.query.alertRules.findFirst({
    where: eq(alertRules.id, id),
  });

  if (!existing) {
    return c.json({ error: 'Alert rule not found' }, 404);
  }

  const [updatedRule] = await db.update(alertRules)
    .set({
      name: body.name !== undefined ? body.name : existing.name,
      keywords: body.keywords !== undefined ? body.keywords : existing.keywords,
      categories: body.categories !== undefined ? body.categories : existing.categories,
      minBudget: body.minBudget !== undefined ? body.minBudget : existing.minBudget,
      minMatchScore: body.minMatchScore !== undefined ? body.minMatchScore : existing.minMatchScore,
      channels: body.channels !== undefined ? body.channels : existing.channels,
      telegramChatId: body.telegramChatId !== undefined ? body.telegramChatId : existing.telegramChatId,
      emailAddress: body.emailAddress !== undefined ? body.emailAddress : existing.emailAddress,
      isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      updatedAt: new Date(),
    })
    .where(eq(alertRules.id, id))
    .returning();

  return c.json(updatedRule);
});

/**
 * DELETE /api/notification/rules/:id
 * Delete an alert rule
 */
notificationRouter.delete('/rules/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await db.query.alertRules.findFirst({
    where: eq(alertRules.id, id),
  });

  if (!existing) {
    return c.json({ error: 'Alert rule not found' }, 404);
  }

  await db.delete(alertRules).where(eq(alertRules.id, id));

  return c.json({ message: 'Alert rule deleted successfully' });
});

/**
 * GET /api/notification/logs
 * Get recent notification delivery logs
 */
notificationRouter.get('/logs', async (c) => {
  const logs = await db.query.notificationLogs.findMany({
    orderBy: [desc(notificationLogs.createdAt)],
    limit: 50,
  });

  return c.json(logs);
});

export default notificationRouter;
