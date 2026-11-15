// src/routes/+layout.server.ts
import { db } from '$lib/server/db';
import { peringatanDini } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
  let peringatanCuacaAktif = null;

  try {
    // Ambil 1 peringatan terbaru yang berstatus AKTIF
    const rows = await db
      .select()
      .from(peringatanDini)
      .where(eq(peringatanDini.status, 'AKTIF'))
      .orderBy(desc(peringatanDini.waktuPeringatan))
      .limit(1);
    
    peringatanCuacaAktif = rows[0] || null;
  } catch (err) {
    console.error('[Layout] Gagal mengambil data peringatan aktif:', err);
  }

  return {
    peringatanCuacaAktif
  };
};