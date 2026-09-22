import { parseHTML } from 'linkedom';

// Storage in-memory menggunakan Map
const cache = new Map();
const CACHE_KEY = 'bmkg_data';
const UPDATE_INTERVAL_MS = 15 * 60 * 1000; // Update setiap 15 menit (sesuaikan kebutuhan)

let isTimerStarted = false;

/**
 * Fungsi utama scraper menggunakan linkedom
 */
async function scrapeBMKGSumsel() {
  const TARGET_URL = 'https://staklim-sumsel.bmkg.go.id/';

  const response = await fetch(TARGET_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Gagal fetching BMKG: ${response.statusText}`);
  }

  const htmlText = await response.text();
  const { document } = parseHTML(htmlText);

  // 1. EXTRACTION: Peringatan Dini Iklim
  const peringatanIklim = [];
  document.querySelectorAll('.bmkg-widget .item-slide').forEach((el) => {
    const title = el.querySelector('.text-content h3')?.textContent.trim() || '';
    const description = el.querySelector('.article-desc-text')?.textContent.trim() || '';
    const link = el.querySelector('a.selengkapnya')?.getAttribute('href') || '';
    const image = el.querySelector('.thumb-box img')?.getAttribute('src') || '';

    if (title) {
      peringatanIklim.push({ title, description, link, image });
    }
  });

  // 2. EXTRACTION: Peringatan Dini Cuaca
  let peringatanCuaca = { status: '', text: '', icon: '' };
  const cuacaContainer = document.querySelector('.bmkg-pdss-container');
  if (cuacaContainer) {
    const isNoWarning = cuacaContainer.classList.contains('bmkg-pdss-no-warning');
    const text = cuacaContainer.querySelector('.bmkg-pdss-text')?.textContent.trim() || '';
    const icon = cuacaContainer.querySelector('.bmkg-pdss-icon')?.getAttribute('src') || '';

    peringatanCuaca = {
      status: isNoWarning ? 'Aman / Tidak Ada Peringatan' : 'Peringatan Dini Aktif',
      text,
      icon
    };
  }

  // 3. EXTRACTION: Kegiatan Terkini
  const kegiatanTerkini = [];
  const bigThumb = document.querySelector('#bmkg-news-section-unique .news-big-thumb');
  if (bigThumb) {
    const title = bigThumb.querySelector('.news-title-text')?.textContent.trim() || '';
    const link = bigThumb.getAttribute('href') || '';
    const image = bigThumb.querySelector('img')?.getAttribute('src') || '';
    if (title) kegiatanTerkini.push({ title, link, image, isFeatured: true });
  }

  document.querySelectorAll('#bmkg-news-section-unique .news-side-grid .news-small-item').forEach((el) => {
    const title = el.querySelector('.news-title-text')?.textContent.trim() || '';
    const link = el.getAttribute('href') || '';
    const image = el.querySelector('img')?.getAttribute('src') || '';
    if (title) kegiatanTerkini.push({ title, link, image, isFeatured: false });
  });

  console.log(`[BMKG Scraper] Data berhasil diambil pada: ${new Date().toISOString()}`);
  return {
    peringatanIklim,
    peringatanCuaca,
    kegiatanTerkini,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Fungsi untuk meng-update cache secara periodik
 */
export async function updateBMKGCache() {
  try {
    console.log('[BMKG Scraper] Mengambil data terbaru...');
    const data = await scrapeBMKGSumsel();
    cache.set(CACHE_KEY, data);
    console.log(`[BMKG Scraper] Cache berhasil di-update pada: ${data.lastUpdated}`);
  } catch (error) {
    console.error('[BMKG Scraper] Gagal memperbarui cache:', error.message);
  }
}

/**
 * Memulai timer background interval (hanya berjalan sekali di server)
 */
export function initBMKGCron() {
  if (isTimerStarted) return;
  
  isTimerStarted = true;
  // Fetch pertama kali saat server siap
  updateBMKGCache();

  // Set interval periodik
  setInterval(() => {
    updateBMKGCache();
  }, UPDATE_INTERVAL_MS);
}

/**
 * Mengambil data dari Memory Map
 */
export function getBMKGDataFromCache() {
  return cache.get(CACHE_KEY) || null;
}

// Tambahkan di baris paling bawah bmkgService.ts / .js
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Jalankan scraping manual...');
  updateBMKGCache().then(() => {
    console.log('Hasil dari memory:', getBMKGDataFromCache());
  });
}