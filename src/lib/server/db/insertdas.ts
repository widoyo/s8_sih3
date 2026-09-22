import { readFileSync } from 'node:fs';
import { db } from '$lib/server/db';
import { das, type NewDas } from '$lib/server/db/schema';

const lines = readFileSync('das_bbws_s8.csv', 'utf-8').split(/\r?\n/);
const batchData: NewDas[] = [];

for (const line of lines.slice(1)) {
  const trimmed = line.trim();
  if (!trimmed) continue;

  // Split 3 koma pertama
  const parts = trimmed.split(',');
  const nama = parts[0].replace(/^"+|"+$/g, '');
  const kode = parts[1].replace(/^"+|"+$/g, '');
  const luasKm2 = parts[2] ? parseInt(parts[2], 10) : null;
  
  // Ambil sisa kolom sebagai raw string GeoJSON dan bersihkan quote ganda
  const rawGeoJson = parts.slice(3).join(',').replace(/^"+|"+$/g, '').replace(/""/g, '"');

  batchData.push({
    nama,
    kode,
    luasKm2,
    geometry: JSON.parse(rawGeoJson) // Otomatis dicocokkan dengan tipe geometry schema
  });
}

// Batch insert sekaligus
if (batchData.length > 0) {
  await db.insert(das).values(batchData);
}