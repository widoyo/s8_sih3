import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { lembagas, das, userLogs, posHidrologi } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/admin/login');
	}

	// Ambil daftar pos beserta relasi lembaga & DAS
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
		.orderBy(desc(posHidrologi.id));

	console.log('Pos Length: ', posList.length);
	const refLembaga = await db.select({ id: lembagas.id, nama: lembagas.nama }).from(lembagas);
	const refDas = await db.select({ id: das.id, nama: das.nama }).from(das);

	return {
		posList,
		refLembaga,
		refDas
	};
};

export const actions: Actions = {
	savePos: async ({ request, locals, getClientAddress }) => {
		if (!locals.user) {
			return fail(401, { message: 'Tidak terotorisasi' });
		}

		const formData = await request.formData();
		const idStr = formData.get('id')?.toString();
		const nama = formData.get('nama')?.toString().trim();
		const kode = formData.get('kode')?.toString().trim();
		const tipe = formData.get('tipe')?.toString();
		const latStr = formData.get('lat')?.toString();
		const lonStr = formData.get('lon')?.toString();
		const elevasiStr = formData.get('elevasi')?.toString();
		const status = formData.get('status')?.toString() || 'AKTIF';
		const lembagaIdStr = formData.get('lembagaId')?.toString();
		const dasIdStr = formData.get('dasId')?.toString();

		if (!nama || !kode || !tipe || !latStr || !lonStr) {
			return fail(400, {
				success: false,
				message: 'Nama, Kode, Tipe, Latitude, dan Longitude wajib diisi.'
			});
		}

		const payload = {
			nama,
			kode,
			tipe,
			latitude: parseFloat(latStr),
			longitude: parseFloat(lonStr),
			elevasi: elevasiStr ? parseFloat(elevasiStr) : null,
			alertStatus: status,
			lembagaId: lembagaIdStr ? parseInt(lembagaIdStr, 10) : null,
			dasId: dasIdStr || null
		};

		if (idStr) {
			// Update Pos
			const id = parseInt(idStr, 10);
			await db.update(posHidrologi).set(payload).where(eq(posHidrologi.id, id));

			await db.insert(userLogs).values({
				userId: String(locals.user.id),
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
				userId: String(locals.user.id),
				action: 'CREATE_POS',
				details: `Menambahkan pos hidrologi baru #${inserted[0].id} (${nama})`,
				ipAddress: getClientAddress()
			});

			return { success: true, message: `Pos baru "${nama}" berhasil ditambahkan.` };
		}
	}
};
