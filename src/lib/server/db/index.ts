import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import 'dotenv/config';

// Membaca DATABASE_URL dari .env (berfungsi di SvelteKit & CLI/tsx)
const dbUrl = process.env.DATABASE_URL || 'sqlite.db';

if (!dbUrl) {
	throw new Error('DATABASE_URL is not set');
}

const client = new Database(dbUrl);

export const db = drizzle(client, { schema });