import fs from 'node:fs/promises';
import path from 'node:path';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const DATA_DIR = path.resolve(process.cwd(), 'data');
  const DATA_FILE = path.join(DATA_DIR, 'prakiraan.json');

  let prakiraanData = { updated_at: null, items: [] };
  let beritaBbwss8Data = { berita: [], lastUpdated: null };

  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    prakiraanData = JSON.parse(raw);
  } catch (err) {
    console.error('Gagal membaca file data/prakiraan.json:', err);
  }

  try {
    const raw = await fs.readFile(path.join(DATA_DIR, 'berita_bbwss8.json'), 'utf-8');
    beritaBbwss8Data = JSON.parse(raw);
  } catch (err) {
    console.error('Gagal membaca file data/berita_bbwss8.json:', err);
  }

  return {
    prakiraanData,
    beritaBbwss8Data
  };
};