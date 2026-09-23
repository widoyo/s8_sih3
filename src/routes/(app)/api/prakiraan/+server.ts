import { json, type RequestHandler } from '@sveltejs/kit';
import { parseHTML } from 'linkedom';
import fs from 'node:fs/promises';
import path from 'node:path';

// SIMPAN DI DILUAR FOLDER src/ (misal: ./data/prakiraan.json)
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'prakiraan.json');
const BMKG_URL = 'https://www.bmkg.go.id/cuaca/prakiraan-cuaca/16';

// Helper untuk memastikan folder & file ada
const ensureFile = async () => {
  try {
    // Pastikan folder 'data/' sudah dibuat
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ updated_at: null, items: [] }));
  }
};

const cleanWeatherData = (rawText: string) => {
  const regex = /^(.+?)(\d+–\d+ °C)(\d+–\d+%)$/;
  const match = rawText.match(regex);

  if (match) {
    return {
      kondisi: match[1].trim(),
      suhu: match[2].trim(),
      kelembapan: match[3].trim(),
    };
  }
  return { kondisi: rawText, suhu: '-', kelembapan: '-' };
};

export interface CuacaItem {
  kondisi: ReturnType<typeof cleanWeatherData>;
  ikon: string;
}

export interface PrakiraanItem {
  lokasi: string;
  url_detail: string;
  hari_ini: CuacaItem;
  besok: CuacaItem;
}

export interface PrakiraanPayload {
  updated_at: string;
  items: PrakiraanItem[];
}

const fetchPrakiraanBmkg = async (): Promise<PrakiraanPayload> => {
  try {
    const response = await fetch(BMKG_URL);
    const html = await response.text();

    const { document } = parseHTML(html);
    const rows = document.querySelectorAll('table tr');

    const items: PrakiraanItem[] = Array.from(rows).slice(1).map((row) => {
      const cols = row.querySelectorAll('td');
      const baseUrl = 'https://www.bmkg.go.id';

      const cityLink = cols[0]?.querySelector('a');
      let relativeUrl = cityLink?.getAttribute('href') || '';

      if (relativeUrl && !relativeUrl.startsWith('/')) {
        relativeUrl = '/' + relativeUrl;
      }
      const fullUrl = relativeUrl ? new URL(relativeUrl, baseUrl).href : '-';

      const getIcon = (col: Element | null): string => {
        const svgElement = col?.querySelector('svg');
        if (!svgElement) return '-';
        return svgElement.toString();
      };

      return {
        lokasi: cols[0]?.textContent?.trim() || 'Unknown',
        url_detail: fullUrl,
        hari_ini: {
          kondisi: cleanWeatherData(cols[1]?.textContent || '-'),
          ikon: getIcon(cols[1])
        },
        besok: {
          kondisi: cleanWeatherData(cols[2]?.textContent || '-'),
          ikon: getIcon(cols[2])
        }
      };
    });

    const payload: PrakiraanPayload = {
      updated_at: new Date().toISOString(),
      items
    };

    // Pastikan folder penyimpan data ada
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Atomic write ke folder ./data/
    const tmpFile = `${DATA_FILE}.tmp`;
    await fs.writeFile(tmpFile, JSON.stringify(payload, null, 2));
    await fs.rename(tmpFile, DATA_FILE);

    return payload;
  } catch (error) {
    console.error('Scraping Error:', error);
    throw error;
  }
};

export const GET: RequestHandler = async ({ url }) => {
  const isFetch = url.searchParams.get('fetch') === 'true';

  if (isFetch) {
    try {
      const payload = await fetchPrakiraanBmkg();
      return json({ success: true, data: payload });
    } catch {
      return json(
        { success: false, error: 'Gagal mengambil data terbaru dari BMKG' },
        { status: 500 }
      );
    }
  }

  try {
    await ensureFile();
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return json({ success: true, data: JSON.parse(raw) });
  } catch {
    return json({ success: false, error: 'Data tidak ditemukan' }, { status: 404 });
  }
};