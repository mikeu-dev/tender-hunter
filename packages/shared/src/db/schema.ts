import { pgTable, uuid, varchar, text, bigint, boolean, timestamp, jsonb, real, vector, index, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Better Auth tables
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  // Custom fields
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).default('member'),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => users.id)
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => users.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt")
});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  businessSectors: text('business_sectors').array().default(sql`'{}'`),
  certifications: text('certifications').array().default(sql`'{}'`),
  preferredRegions: text('preferred_regions').array().default(sql`'{}'`),
  teamSize: bigint('team_size', { mode: 'number' }),
  capabilities: text('capabilities').array().default(sql`'{}'`),
  budgetMin: bigint('budget_min', { mode: 'number' }),
  budgetMax: bigint('budget_max', { mode: 'number' }),
  excludedCategories: text('excluded_categories').array().default(sql`'{}'`),
  projectHistory: jsonb('project_history').default('[]'),
  subscriptionPlan: varchar('subscription_plan', { length: 50 }).default('free'),
  subscriptionStatus: varchar('subscription_status', { length: 20 }).default('active'),
  subscriptionExpiresAt: timestamp('subscription_expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  adapterType: varchar('adapter_type', { length: 50 }).notNull(),
  baseUrl: text('base_url').notNull(),
  config: jsonb('config').default('{}'),
  crawlSchedule: varchar('crawl_schedule', { length: 50 }).default('*/30 * * * *'),
  isActive: boolean('is_active').default(true),
  lastCrawledAt: timestamp('last_crawled_at', { withTimezone: true }),
  healthStatus: varchar('health_status', { length: 20 }).default('unknown'),
  errorCount: bigint('error_count', { mode: 'number' }).default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const crawlJobs = pgTable('crawl_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').references(() => sources.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('pending'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  itemsFound: bigint('items_found', { mode: 'number' }).default(0),
  itemsNew: bigint('items_new', { mode: 'number' }).default(0),
  itemsUpdated: bigint('items_updated', { mode: 'number' }).default(0),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const tenders = pgTable('tenders', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').references(() => sources.id),
  externalId: varchar('external_id', { length: 255 }),
  url: text('url'),
  title: text('title').notNull(),
  organizationName: varchar('organization_name', { length: 500 }),
  budget: bigint('budget', { mode: 'number' }),
  budgetCurrency: varchar('budget_currency', { length: 10 }).default('IDR'),
  category: varchar('category', { length: 255 }),
  subcategory: varchar('subcategory', { length: 255 }),
  procurementType: varchar('procurement_type', { length: 100 }),
  region: varchar('region', { length: 255 }),
  province: varchar('province', { length: 100 }),
  city: varchar('city', { length: 100 }),
  qualification: text('qualification'),
  eligibility: text('eligibility'),
  documentRequirements: text('document_requirements').array(),
  scoringCriteria: jsonb('scoring_criteria'),
  contactInfo: jsonb('contact_info'),
  timeline: jsonb('timeline'),
  registrationDeadline: timestamp('registration_deadline', { withTimezone: true }),
  submissionDeadline: timestamp('submission_deadline', { withTimezone: true }),
  announcementDate: timestamp('announcement_date', { withTimezone: true }),
  status: varchar('status', { length: 50 }).default('open'),
  rawData: jsonb('raw_data'),
  extractionConfidence: real('extraction_confidence').default(0),
  extractedAt: timestamp('extracted_at', { withTimezone: true }),
  aiSummary: text('ai_summary'),
  aiRiskFlags: jsonb('ai_risk_flags').default('[]'),
  aiHiddenRequirements: text('ai_hidden_requirements').array(),
  contentHash: varchar('content_hash', { length: 64 }).unique(),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  statusIdx: index('idx_tenders_status').on(table.status),
  deadlineIdx: index('idx_tenders_deadline').on(table.submissionDeadline),
  categoryIdx: index('idx_tenders_category').on(table.category),
  regionIdx: index('idx_tenders_region').on(table.region),
  budgetIdx: index('idx_tenders_budget').on(table.budget),
  sourceIdx: index('idx_tenders_source').on(table.sourceId),
  createdIdx: index('idx_tenders_created').on(table.createdAt)
}));

export const alertRules = pgTable('alert_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  keywords: text('keywords').array().default(sql`'{}'`),
  categories: varchar('categories', { length: 100 }).array().default(sql`'{}'`),
  minBudget: bigint('min_budget', { mode: 'number' }).default(0),
  minMatchScore: bigint('min_match_score', { mode: 'number' }).default(0),
  channels: varchar('channels', { length: 50 }).array().default(sql`'{}'`),
  telegramChatId: varchar('telegram_chat_id', { length: 100 }),
  emailAddress: varchar('email_address', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const notificationLogs = pgTable('notification_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  alertRuleId: uuid('alert_rule_id').references(() => alertRules.id, { onDelete: 'cascade' }),
  tenderId: uuid('tender_id').references(() => tenders.id, { onDelete: 'cascade' }),
  channel: varchar('channel', { length: 50 }).notNull(),
  recipient: varchar('recipient', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

