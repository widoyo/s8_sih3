import fs from 'node:fs/promises';
import path from 'node:path';

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

// In-Memory Cache
const cache = new Map<string, BBWS8Cache>();
const CACHE_KEY = 'bbws8_berita';
const UPDATE_INTERVAL_MS = 15 * 60 * 1000; // 15 menit
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'berita_bbwss8.json');

let isTimerStarted = false;

/**
 * Fetch berita dari REST API BBWS Sumatera VIII dengan parameter query
 */
export async function fetchBBWS8BeritaFromAPI(): Promise<BBWS8Cache> {
  // Tambahkan parameter ?page=0&sort=newest pada endpoint API
  const BASE_URL = 'https://sda.pu.go.id/balai/bbwssumatera8/api/berita';
  const params = new URLSearchParams({
    page: '0',
    sort: 'newest'
  });

  const API_URL = `${BASE_URL}?${params.toString()}`;

  const response = await fetch(API_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Gagal fetch API BBWS VIII: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const beritaList: BeritaItem[] = [];

  // Menyesuaikan struktur JSON dari API backend (Array biasa atau objek { data: [...] })
  const rawItems = Array.isArray(result) ? result : result.data || result.items || [];

  rawItems.forEach((item: any) => {
    const title = item.judul || item.title || '';
    const slug = item.slug || item.id || '';
    const imagePath = item.gambar || item.img || item.foto || '';
    const rawExcerpt = item.ringkasan || item.excerpt || item.deskripsi || '';

    // Sanitisasi HTML/tag jika ada
    const excerpt = rawExcerpt.replace(/<[^>]*>?/gm, '').trim();

    if (title) {
      beritaList.push({
        id: item.id,
        title,
        link: slug
          ? `https://sda.pu.go.id/balai/bbwssumatera8/berita/#detail?id=${slug}`
          : 'https://sda.pu.go.id/balai/bbwssumatera8/berita',
        image: imagePath.startsWith('http')
          ? imagePath
          : `https://sda.pu.go.id/balai/bbwssumatera8/api/uploads/berita/${imagePath}`,
        excerpt,
        date: item.created_at || item.tanggal || ''
      });
    }
  });

  return {
    berita: beritaList,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Update cache Map di memory
 */
export async function updateBBWS8Cache(): Promise<void> {
  try {
    console.log('[BBWS8 API] Fetching data terbaru (page=0&sort=newest)...');
    const data = await fetchBBWS8BeritaFromAPI();
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmpFile = `${DATA_FILE}.tmp`;
    await fs.writeFile(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmpFile, DATA_FILE);
    cache.set(CACHE_KEY, data);
    console.log(
      `[BBWS8 API] Cache dan ${DATA_FILE} diperbarui: ${data.lastUpdated} (${data.berita.length} berita)`
    );
  } catch (error: any) {
    console.error('[BBWS8 API] Error updating cache:', error.message);
  }
}

/**
 * Inisialisasi pewaktu periodik
 */
export function initBBWS8Cron(): void {
  if (isTimerStarted) return;
  isTimerStarted = true;

  updateBBWS8Cache();
  setInterval(() => {
    updateBBWS8Cache();
  }, UPDATE_INTERVAL_MS);
}

/**
 * Get data dari Memory Map
 */
export function getBBWS8DataFromCache(): BBWS8Cache | null {
  return cache.get(CACHE_KEY) || null;
}

// Testing via CLI (npm run fetch:bbws8)
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('--- Testing API Fetch BBWS VIII dengan Query Params ---');
  updateBBWS8Cache().then(() => {
    console.log('Data dari Memory Map:', JSON.stringify(getBBWS8DataFromCache(), null, 2));
  });
}