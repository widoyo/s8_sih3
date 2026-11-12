import { db } from '$lib/server/db';
import { scraperLogs } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export interface RecordScraperLogParams {
  source: string; // Misal: 'BMKG_SUMSEL', 'PETA_GIS', 'RIVER_DATA'
  status: 'SUCCESS' | 'FAILED';
  itemsScraped?: number;
  errorMessage?: string;
}

/**
 * Menyimpan riwayat log eksekusi scraper ke database.
 */
export async function logScraperExecution(params: RecordScraperLogParams) {
  try {
    const inserted = await db
      .insert(scraperLogs)
      .values({
        source: params.source,
        status: params.status,
        itemsScraped: params.itemsScraped ?? 0,
        errorMessage: params.errorMessage || null,
        executedAt: new Date().toISOString()
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error(`[ScraperLogService] Gagal mencatat log untuk ${params.source}:`, error);
  }
}

/**
 * Mengambil daftar riwayat eksekusi log terakhir.
 */
export async function getRecentScraperLogs(source?: string, limit = 20) {
  const whereCondition = source ? eq(scraperLogs.source, source) : undefined;

  return await db
    .select()
    .from(scraperLogs)
    .where(whereCondition)
    .orderBy(desc(scraperLogs.executedAt))
    .limit(limit);
}