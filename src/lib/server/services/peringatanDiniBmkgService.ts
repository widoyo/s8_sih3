// src/lib/server/services/peringatanDiniService.ts
import { db } from '$lib/server/db';
import { peringatanDini } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';


/**
 * Mengekstrak waktu peringatan dari teks BMKG.
 * Contoh input: "UPDATE Peringatan Dini Cuaca ... tgl 16 Agustus 2026 pkl. 16:20 WIB ..."
 * Output: "2026-08-16T09:20:00.000Z" (Format ISO UTC)
 */
function extractWaktuPeringatan(text: string): string {
  // Regex case-insensitive untuk menangkap: tgl [1-2 digit] [bulan] [4 digit tahun] pkl. [jam]:[menit] WIB
  const regex = /tgl\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s+pkl\.\s+(\d{1,2}):(\d{2})\s+WIB/i;
  const match = text.match(regex);

  if (!match) {
    console.warn('[Parser] Pola waktu tidak ditemukan dalam teks peringatan. Menggunakan waktu server sebagai fallback.');
    return new Date().toISOString();
  }

  const [, dayStr, monthStr, yearStr, hourStr, minuteStr] = match;

  // Mapping bulan Indonesia ke index bulan JavaScript (0-11)
  const monthMap: Record<string, number> = {
    januari: 0, jan: 0,
    februari: 1, feb: 1,
    maret: 2, mar: 2,
    april: 3, apr: 3,
    mei: 4,
    juni: 5, jun: 5,
    juli: 6, jul: 6,
    agustus: 7, agt: 7,
    september: 8, sep: 8,
    oktober: 9, okt: 9,
    november: 10, nov: 10,
    desember: 11, des: 11
  };

  const monthIndex = monthMap[monthStr.toLowerCase()];

  if (monthIndex === undefined) {
    console.warn(`[Parser] Bulan tidak dikenali: "${monthStr}". Menggunakan waktu server.`);
    return new Date().toISOString();
  }

  // Konversi WIB (UTC+7) ke UTC untuk penyimpanan database yang standar
  // Kita kurangi 7 jam dari jam lokal WIB
  const utcHour = parseInt(hourStr, 10) - 7;

  const date = new Date(Date.UTC(
    parseInt(yearStr, 10),
    monthIndex,
    parseInt(dayStr, 10),
    utcHour,
    parseInt(minuteStr, 10)
  ));

  return date.toISOString();
}

export async function syncPeringatanDiniToDB(peringatanCuaca: {
  status: string;
  text: string;
  icon: string;
}) {
  try {
    // 1. Ambil semua peringatan yang masih berstatus AKTIF
    const activeWarnings = await db
      .select()
      .from(peringatanDini)
      .where(eq(peringatanDini.status, 'AKTIF'));

    // 2. Logika Jika ADA Peringatan Dini Aktif dari BMKG
    if (peringatanCuaca.status === 'Peringatan Dini Aktif' && peringatanCuaca.text) {
      
      // Cek apakah teks peringatan yang sama persis sudah ada dan masih AKTIF
      // Ini mencegah insert berulang setiap 15 menit jika isi peringatan belum berubah
      const isSameAsActive = activeWarnings.some((w) => w.teks === peringatanCuaca.text);

      if (!isSameAsActive) {
        // Jika ada peringatan aktif sebelumnya yang berbeda (update dari BMKG), kadaluwarsakan dulu
        if (activeWarnings.length > 0) {
          await db
            .update(peringatanDini)
            .set({ status: 'KADALUWARSA' })
            .where(eq(peringatanDini.status, 'AKTIF'));
        }

        const waktuPeringatanISO = extractWaktuPeringatan(peringatanCuaca.text);

        // Insert peringatan baru ke database
        await db.insert(peringatanDini).values({
          teks: peringatanCuaca.text,
          status: 'AKTIF',
          waktuPeringatan: waktuPeringatanISO,
        });
        
        console.log('[DB] ✅ Peringatan dini baru berhasil disimpan.');
      } else {
        console.log('[DB] ℹ️ Peringatan dini masih sama dengan yang aktif, skip insert.');
      }
    } 
    // 3. Logika Jika TIDAK ADA Peringatan (Mode Aman/Blank)
    else {
      if (activeWarnings.length > 0) {
        // Ubah semua yang AKTIF menjadi KADALUWARSA
        await db
          .update(peringatanDini)
          .set({ status: 'KADALUWARSA' })
          .where(eq(peringatanDini.status, 'AKTIF'));
          
        console.log('[DB] 🔄 Semua peringatan dini aktif diubah menjadi KADALUWARSA.');
      } else {
        console.log('[DB] ℹ️ Tidak ada peringatan aktif yang perlu dikadaluwarsakan.');
      }
    }
  } catch (error) {
    console.error('[DB] ❌ Gagal menyinkronkan peringatan dini:', error);
    // Jangan throw error di sini agar proses scraping cache tetap berjalan meski DB gagal
  }
}