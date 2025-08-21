import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Only require DATABASE_URL if we're explicitly using database storage
if (!process.env.DATABASE_URL) {
  if (process.env.USE_DATABASE === 'true' || process.env.NODE_ENV === 'production') {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  } else {
    // Development mode without database - will use file storage
    console.log('No DATABASE_URL provided, using file-based storage for development');
  }
}

// Only create real database connection if DATABASE_URL is provided
export const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
export const db = pool ? drizzle({ client: pool, schema }) : null;