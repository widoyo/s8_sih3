import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { lembagas, das, userLogs, posHidrologi } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/admin/login');
    }

    const user = locals.user;

    // Menentukan filter berdasarkan lembagaId milik user (jika bukan admin/superadmin)
    const userLembagaId = user.lembagaId ? Number(user.lembagaId) : null;
    const whereClause = userLembagaId ? eq(posHidrologi.lembagaId, userLembagaId) : undefined;

    // Ambil daftar pos dengan klausa where jika user terikat pada suatu lembaga
    const posList = await db
        .select({
            id: posHidrologi.id,
            nama: posHidrologi.nama,
            kode: posHidrologi.kode,
            tipe: posHidrologi.tipe,
            lat: posHidrologi.latitude,
            lon: posHidrologi.longitude,
            elevasi: posHidrologi.elevasi,
            status: posHidrologi.alertStatus,
            lembagaNama: lembagas.nama,
            dasNama: das.nama,
            lembagaId: posHidrologi.lembagaId,
            dasId: posHidrologi.dasId
        })
        .from(posHidrologi)
        .leftJoin(lembagas, eq(posHidrologi.lembagaId, lembagas.id))
        .leftJoin(das, eq(posHidrologi.dasId, das.id))
        .where(whereClause)
        .orderBy(desc(posHidrologi.id));

    // Referensi lembaga (jika user lembaga, kunci daftar opsi hanya ke lembaganya saja)
    const refLembaga = userLembagaId
        ? await db
              .select({ id: lembagas.id, nama: lembagas.nama })
              .from(lembagas)
              .where(eq(lembagas.id, userLembagaId))
        : await db.select({ id: lembagas.id, nama: lembagas.nama }).from(lembagas);

    const refDas = await db.select({ id: das.id, nama: das.nama }).from(das);

    return {
        posList,
        refLembaga,
        refDas,
        userLembagaId // Dikirim ke frontend agar dapat dikunci nilainya di form modal
    };
};

export const actions: Actions = {
    savePos: async ({ request, locals, getClientAddress }) => {
        if (!locals.user) {
            return fail(401, { message: 'Tidak terotorisasi' });
        }

        const user = locals.user;
        const userLembagaId = user.lembagaId ? Number(user.lembagaId) : null;

        const formData = await request.formData();
        const idStr = formData.get('id')?.toString();
        const nama = formData.get('nama')?.toString().trim();
        const kode = formData.get('kode')?.toString().trim();
        const tipe = formData.get('tipe')?.toString();
        const latStr = formData.get('lat')?.toString();
        const lonStr = formData.get('lon')?.toString();
        const elevasiStr = formData.get('elevasi')?.toString();
        const status = formData.get('status')?.toString() || 'AKTIF';
        const lembagaIdInput = formData.get('lembagaId')?.toString();
        const dasIdStr = formData.get('dasId')?.toString();

        if (!nama || !kode || !tipe || !latStr || !lonStr) {
            return fail(400, {
                success: false,
                message: 'Nama, Kode, Tipe, Latitude, dan Longitude wajib diisi.'
            });
        }

        // Paksa lembagaId menggunakan ID milik user jika user memiliki batasan lembaga
        const targetLembagaId = userLembagaId
            ? userLembagaId
            : lembagaIdInput
              ? parseInt(lembagaIdInput, 10)
              : null;

        const payload = {
            nama,
            kode,
            tipe,
            latitude: parseFloat(latStr),
            longitude: parseFloat(lonStr),
            elevasi: elevasiStr ? parseFloat(elevasiStr) : null,
            alertStatus: status,
            lembagaId: targetLembagaId,
            dasId: dasIdStr || null
        };

        if (idStr) {
            // Update Pos (Cek keamanan: pastikan pos tersebut memang milik lembaganya)
            const id = parseInt(idStr, 10);

            if (userLembagaId) {
                const existing = await db
                    .select({ id: posHidrologi.id })
                    .from(posHidrologi)
                    .where(and(eq(posHidrologi.id, id), eq(posHidrologi.lembagaId, userLembagaId)));

                if (existing.length === 0) {
                    return fail(403, {
                        success: false,
                        message: 'Anda tidak memiliki hak untuk mengubah pos ini.'
                    });
                }
            }

            await db.update(posHidrologi).set(payload).where(eq(posHidrologi.id, id));

            await db.insert(userLogs).values({
                userId: String(user.id),
                action: 'UPDATE_POS',
                details: `Memperbarui pos hidrologi #${id} (${nama})`,
                ipAddress: getClientAddress()
            });

            return { success: true, message: `Pos "${nama}" berhasil diperbarui.` };
        } else {
            // Create Pos Baru
            const inserted = await db
                .insert(posHidrologi)
                .values(payload)
                .returning({ id: posHidrologi.id });

            await db.insert(userLogs).values({
                userId: String(user.id),
                action: 'CREATE_POS',
                details: `Menambahkan pos hidrologi baru #${inserted[0].id} (${nama})`,
                ipAddress: getClientAddress()
            });

            return { success: true, message: `Pos baru "${nama}" berhasil ditambahkan.` };
        }
    }
};