
// server/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

// .env laden (optional, falls bereits woanders geladen, kannst du das weglassen)
dotenv.config();

/**
 * Empfohlen: DATABASE_URL im Format:
 *  postgres://user:password@host:port/database
 *
 * Alternativ: Einzelwerte aus PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT
 */
const connectionString = process.env.DATABASE_URL;

export const pool =
  connectionString
    ? new Pool({ connectionString })
    : new Pool({
        host: process.env.PGHOST ?? 'localhost',
        user: process.env.PGUSER ?? 'postgres',
        password: process.env.PGPASSWORD ?? '',
        database: process.env.PGDATABASE ?? 'postgres',
        port: Number(process.env.PGPORT ?? 5432),
        ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
      });

// einfacher Health-Check (optional)
export async function dbHealthCheck(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
