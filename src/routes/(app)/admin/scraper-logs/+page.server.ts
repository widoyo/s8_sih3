import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { scraperLogs } from '$lib/server/db/schema';
import { desc, eq, count, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) {
    throw redirect(303, '/admin/login');
  }

  const selectedSource = url.searchParams.get('source') || '';
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = 15;
  const offset = (page - 1) * limit;

  const whereCondition = selectedSource ? eq(scraperLogs.source, selectedSource) : undefined;

  // 1. Ambil daftar log sesuai filter & pagination
  const logs = await db
    .select()
    .from(scraperLogs)
    .where(whereCondition)
    .orderBy(desc(scraperLogs.executedAt))
    .limit(limit)
    .offset(offset);

  // 2. Hitung total item untuk statistik & pagination
  const [totalCountResult] = await db
    .select({ count: count() })
    .from(scraperLogs)
    .where(whereCondition);

  const totalItems = totalCountResult?.count ?? 0;
  const totalPages = Math.ceil(totalItems / limit);

  // 3. Ambil statistik ringkas (Total Sukses, Gagal, & Daftar Source Unik)
  const statsResult = await db
    .select({
      totalSuccess: sql<number>`SUM(CASE WHEN ${scraperLogs.status} = 'SUCCESS' THEN 1 ELSE 0 END)`,
      totalFailed: sql<number>`SUM(CASE WHEN ${scraperLogs.status} = 'FAILED' THEN 1 ELSE 0 END)`
    })
    .from(scraperLogs);

  const sourcesResult = await db
    .selectDistinct({ source: scraperLogs.source })
    .from(scraperLogs);

  return {
    logs,
    sources: sourcesResult.map((s) => s.source),
    selectedSource,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit
    },
    stats: {
      totalSuccess: statsResult[0]?.totalSuccess ?? 0,
      totalFailed: statsResult[0]?.totalFailed ?? 0
    }
  };
};