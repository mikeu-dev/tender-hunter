import { Hono } from "hono";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { db, organizations, users, eq } from "@tender-hunter/shared";

const companyRouter = new Hono<{
  Variables: {
    user: any;
    session: any;
  }
}>();

// Apply auth middleware to all company routes
companyRouter.use("*", authMiddleware);

// GET /api/company
companyRouter.get("/", async (c) => {
  const user = c.get("user") as any;
  if (!user.orgId) {
    return c.json({ error: "User is not associated with an organization" }, 404);
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, user.orgId),
  });

  if (!org) {
    return c.json({ error: "Organization not found" }, 404);
  }

  return c.json(org);
});

// PUT /api/company
companyRouter.put("/", async (c) => {
  const user = c.get("user") as any;
  const body = await c.req.json();

  const updateData: any = {
    name: body.name,
    businessSectors: body.businessSectors,
    certifications: body.certifications,
    preferredRegions: body.preferredRegions,
    teamSize: body.teamSize ? parseInt(body.teamSize) : undefined,
    capabilities: body.capabilities,
    budgetMin: body.budgetMin ? parseInt(body.budgetMin) : undefined,
    budgetMax: body.budgetMax ? parseInt(body.budgetMax) : undefined,
    excludedCategories: body.excludedCategories,
    projectHistory: body.projectHistory,
    updatedAt: new Date(),
  };

  if (!user.orgId) {
    // If user has no organization yet, create a new one!
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    const [newOrg] = await db.insert(organizations).values({
      name: body.name,
      slug,
      ...updateData,
    }).returning();

    // Associate user with the new organization
    await db.update(users).set({
      orgId: newOrg.id,
      role: 'owner',
    }).where(eq(users.id, user.id));

    return c.json(newOrg);
  }

  // Update existing organization
  const [updatedOrg] = await db.update(organizations)
    .set(updateData)
    .where(eq(organizations.id, user.orgId))
    .returning();

  return c.json(updatedOrg);
});

export default companyRouter;
