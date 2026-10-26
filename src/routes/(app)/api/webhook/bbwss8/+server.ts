import { json, type RequestHandler } from '@sveltejs/kit';
import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '$env/dynamic/private';

// Konfigurasi Lokasi File JSON
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'berita_bbwss8.json');

// Secret Key untuk Keamanan (Set via .env di VPS atau gunakan default fallback)
const SECRET_KEY = env.WEBHOOK_SECRET_KEY;

export interface BeritaItem {
  id?: string | number;
  title: string;
  link: string;
  image: string;
  excerpt: string;
  date?: string;
}

export interface BBWS8Cache {
  berita: BeritaItem[];
  lastUpdated: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // 1. Verifikasi Header Keamanan
    const authHeader = request.headers.get('x-api-key');
    if (authHeader !== SECRET_KEY) {
      return json(
        { success: false, error: 'Akses ditolak: API Key tidak valid' },
        { status: 401 }
      );
    }

    // 2. Ambil payload JSON yang dikirimkan
    const result = await request.json();

    // Menyesuaikan struktur JSON (Array langsung atau objek { data: [...] } / { items: [...] })
    const rawItems = Array.isArray(result) ? result : result.data || result.items || [];

    const beritaList: BeritaItem[] = [];

    rawItems.forEach((item: any) => {
      const title = item.judul || item.title || '';
      const slug = item.slug || item.id || '';
      const imagePath = item.gambar || item.img || item.foto || '';
      const rawExcerpt = item.ringkasan || item.excerpt || item.deskripsi || '';

      // Bersihkan tag HTML dari ringkasan
      const excerpt = rawExcerpt.replace(/<[^>]*>?/gm, '').trim();

      if (title) {
        beritaList.push({
          id: item.id,
          title,
          link: slug
            ? `https://sda.pu.go.id/balai/bbwssumatera8/berita/${slug}`
            : 'https://sda.pu.go.id/balai/bbwssumatera8/berita',
          image: imagePath.startsWith('http')
            ? imagePath
            : `https://sda.pu.go.id/balai/bbwssumatera8/uploads/berita/${imagePath}`,
          excerpt,
          date: item.created_at || item.tanggal || ''
        });
      }
    });

    const payload: BBWS8Cache = {
      berita: beritaList,
      lastUpdated: new Date().toISOString()
    };

    // 3. Pastikan direktori 'data/' tersedia
    await fs.mkdir(DATA_DIR, { recursive: true });

    // 4. Atomic Write (tulis ke file .tmp lalu ganti nama agar file tidak korup jika di-read bersamaan)
    const tmpFile = `${DATA_FILE}.tmp`;
    await fs.writeFile(tmpFile, JSON.stringify(payload, null, 2));
    await fs.rename(tmpFile, DATA_FILE);

    console.log(`[WEBHOOK BBWS8] Berhasil memperbarui data/berita_bbwss8.json (${beritaList.length} berita)`);

    return json({
      success: true,
      message: 'File berita_bbwss8.json berhasil diperbarui!',
      count: beritaList.length,
      lastUpdated: payload.lastUpdated
    });
  } catch (err: any) {
    console.error('[WEBHOOK BBWS8 ERROR]:', err);
    return json({ success: false, error: err.message }, { status: 400 });
  }
};