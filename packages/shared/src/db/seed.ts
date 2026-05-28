import { db } from './index';
import { organizations, tenders, sources, crawlJobs, notificationLogs, alertRules } from './schema';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Resetting and seeding database for end-to-end crawler testing...');
  
  // 0. Clear existing data
  await db.execute(sql`TRUNCATE TABLE tenders CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE crawl_jobs CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE sources CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE notification_logs CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE alert_rules CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE organizations CASCADE;`);

  // 1. Create a mock organization for AI Match Scoring context
  const orgResult = await db.insert(organizations).values({
    name: 'PT Teknologi Inovasi Nusantara',
    slug: 'teknologi-inovasi-nusantara',
    businessSectors: ['IT/Software', 'Cybersecurity', 'Telekomunikasi'],
    certifications: ['ISO 27001', 'ISO 9001'],
    preferredRegions: ['Jakarta', 'Jawa Barat', 'Banten'],
    teamSize: 50,
    capabilities: ['Penetration Testing', 'Web Development', 'Cloud Infrastructure'],
    budgetMin: 100000000,
    budgetMax: 5000000000,
    subscriptionPlan: 'pro',
  }).returning({ id: organizations.id });

  const orgId = orgResult[0].id;
  console.log(`Created Organization: ${orgId}`);

  // 2. Create the mock source pointing to the local API
  const sourceResult = await db.insert(sources).values({
    name: 'LPSE Kementerian (Real)',
    adapterType: 'lpse',
    baseUrl: 'https://lpse.kemenkeu.go.id',
    isActive: true,
  }).returning({ id: sources.id });

  const sourceId = sourceResult[0].id;
  console.log(`Created Mock Source: ${sourceId}`);
  
  // NOTE: We do NOT create any dummy tenders here.
  // The tenders will be fetched by the CrawlerEngine when run.

  console.log('Database reset completed successfully! Ready for crawler.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
