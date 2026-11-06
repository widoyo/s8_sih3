// scripts/update-pos-das.ts
import { db } from '../src/lib/server/db/index';
import { das, posHidrologi } from '../src/lib/server/db/schema';
import { eq, isNull } from 'drizzle-orm';
import * as turf from '@turf/turf';

async function updatePosHidrologiDasId() {
  console.log('🔄 Memulai proses pemetaan Pos Hidrologi ke DAS...');

  // 1. Ambil semua data DAS
  const allDas = await db.select().from(das);
  console.log(`✅ Ditemukan ${allDas.length} data DAS.`);

  // 2. Ambil pos yang dasId-nya masih NULL (belum terisi)
  const allPos = await db
    .select()
    .from(posHidrologi)
    .where(isNull(posHidrologi.dasId)); 
  
  console.log(`✅ Ditemukan ${allPos.length} pos yang perlu diproses.`);

  const updates: { id: number; dasId: number }[] = [];
  const unmappedPos: string[] = [];

  // 3. Loop setiap pos untuk dicek koordinatnya
  for (const pos of allPos) {
    if (!pos.latitude || !pos.longitude) {
      unmappedPos.push(`${pos.nama} (ID: ${pos.id}) - Koordinat kosong`);
      continue;
    }

    const point = turf.point([pos.longitude, pos.latitude]);
    let matchedDasId: number | null = null;

    for (const d of allDas) {
      if (!d.geometry) continue;

      let isInside = false;
      try {
        if (d.geometry.type === 'Polygon') {
          isInside = turf.booleanPointInPolygon(
            point, 
            turf.polygon(d.geometry.coordinates as number[][][])
          );
        } else if (d.geometry.type === 'MultiPolygon') {
          isInside = turf.booleanPointInPolygon(
            point, 
            turf.multiPolygon(d.geometry.coordinates as number[][][][])
          );
        }
      } catch (error) {
        console.error(`❌ Error geometri pada DAS ${d.nama} (ID: ${d.id}):`, error);
      }

      if (isInside) {
        matchedDasId = d.id;
        break; // Berhenti mencari jika sudah ketemu (asumsi DAS tidak overlap)
      }
    }

    if (matchedDasId !== null) {
      updates.push({ id: pos.id, dasId: matchedDasId });
    } else {
      unmappedPos.push(`${pos.nama} (ID: ${pos.id}) - Di luar semua polygon DAS`);
    }
  }

  // 4. Lakukan Batch Update
  if (updates.length > 0) {
    console.log(`\n📝 Melakukan update untuk ${updates.length} pos...`);
    
    // better-sqlite3 mendukung transaction yang sangat cepat
    db.transaction((tx) => {
      for (const update of updates) {
        tx.update(posHidrologi)
          .set({ dasId: update.dasId })
          .where(eq(posHidrologi.id, update.id))
          .run(); // .run() adalah metode optimal untuk better-sqlite3 di Drizzle
      }
    });
    
    console.log('✅ Update berhasil disimpan ke database!');
  } else {
    console.log('ℹ️ Tidak ada data yang perlu diupdate.');
  }

  // 5. Laporan Pos yang Tidak Terpetakan
  if (unmappedPos.length > 0) {
    console.log('\n⚠️ Peringatan: Pos berikut TIDAK terpetakan (cek koordinat atau polygon DAS):');
    unmappedPos.forEach(nama => console.log(`   - ${nama}`));
  }
}

updatePosHidrologiDasId().catch((err) => {
  console.error('❌ Terjadi kesalahan:', err);
  process.exit(1);
});