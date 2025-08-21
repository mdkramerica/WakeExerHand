import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Check if database should be used and if DATABASE_URL is available
const shouldUseDatabase = process.env.USE_DATABASE === 'true';
const hasDatabaseUrl = !!(process.env.DATABASE_URL || process.env.PGHOST);

// Only warn if explicitly trying to use database but no connection available
if (shouldUseDatabase && !hasDatabaseUrl) {
  console.warn('⚠️  DATABASE_URL not available, falling back to memory storage');
  console.warn('⚠️  This is not recommended for production use');
} else if (process.env.NODE_ENV === 'production' && !shouldUseDatabase) {
  console.log('📝 Production mode with USE_DATABASE=false - using memory storage');
}

// Build DATABASE_URL from Railway components if needed
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && process.env.PGHOST) {
  const pgHost = process.env.PGHOST;
  const pgPort = process.env.PGPORT || '5432';
  const pgDatabase = process.env.PGDATABASE;
  const pgUser = process.env.PGUSER;
  const pgPassword = process.env.PGPASSWORD;
  
  if (pgDatabase && pgUser && pgPassword) {
    databaseUrl = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`;
    console.log('✅ Built DATABASE_URL from Railway environment variables');
  }
}

// Only create real database connection if DATABASE_URL is available
export const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;
export const db = pool ? drizzle({ client: pool, schema }) : null;