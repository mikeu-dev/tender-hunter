import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://tender_user:tender_password@localhost:5433/tender_hunter'
});

export const db = drizzle(pool, { schema });
