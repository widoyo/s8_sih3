import fs from 'node:fs/promises';
import path from 'node:path';

const API_URL = 'https://sda.pu.go.id/balai/bbwssumatera8/api/berita?page=0&sort=newest';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'berita_bbwss8.json');

export interface BeritaItem {
  id?: string | number;
  title: string;
  link: string;
  image: string;
  excerpt: string;
  date?: string;
}

export interface BBWS8Payload {
  berita: BeritaItem[];
  lastUpdated: string;
}

async function fetchAndSaveBerita(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Mengambil data dari sda.pu.go.id...`);

  try {
    const response = await fetch(API_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error! status: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const rawItems = Array.isArray(result) ? result : result.data || result.items || [];

    const beritaList: BeritaItem[] = [];

    rawItems.forEach((item: any) => {
      const title = item.judul || item.title || '';
      const slug = item.slug || item.id || '';
      const imagePath = item.gambar || item.image || item.foto || '';
      const rawExcerpt = item.ringkasan || item.excerpt || item.deskripsi || '';

      // Clean HTML tags[cite: 1]
      const excerpt = rawExcerpt.replace(/<[^>]*>?/gm, '').trim();

      if (title) {
        beritaList.push({
          id: item.id,
          title,
          link: slug
            ? `https://sda.pu.go.id/balai/bbwssumatera8/berita?id=${slug}#detail`
            : 'https://sda.pu.go.id/balai/bbwssumatera8/berita',
          image: imagePath.startsWith('http')
            ? imagePath
            : imagePath
            ? `https://sda.pu.go.id/balai/bbwssumatera8/uploads/berita/${imagePath}`
            : '',
          excerpt,
          date: item.created_at || item.tanggal || ''
        });
      }
    });

    const payload: BBWS8Payload = {
      berita: beritaList,
      lastUpdated: new Date().toISOString()
    };

    // Pastikan folder data/ ada[cite: 1]
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Atomic file writing[cite: 1]
    const tmpFile = `${DATA_FILE}.tmp`;
    await fs.writeFile(tmpFile, JSON.stringify(payload, null, 2), 'utf-8');
    await fs.rename(tmpFile, DATA_FILE);

    console.log(`✅ Berhasil memperbarui ${DATA_FILE} (${beritaList.length} berita)`);
  } catch (err: any) {
    console.error(`❌ Gagal fetching data berita:`, err.message);
  }
}

fetchAndSaveBerita();