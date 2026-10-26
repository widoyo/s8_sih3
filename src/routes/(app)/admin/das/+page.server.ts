import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { das, userLogs } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/admin/login');
	}

	const dasList = await db
		.select({
			id: das.id,
			nama: das.nama,
			kode: das.kode,
			luasKm2: das.luasKm2,
			geometry: das.geometry,
			createdAt: das.createdAt
		})
		.from(das)
		.orderBy(desc(das.id));

	return {
		dasList
	};
};

export const actions: Actions = {
	saveDas: async ({ request, locals, getClientAddress }) => {
		if (!locals.user) {
			return fail(401, { message: 'Tidak terotorisasi' });
		}

		const formData = await request.formData();
		const idStr = formData.get('id')?.toString();
		const nama = formData.get('nama')?.toString().trim();
		const kode = formData.get('kode')?.toString().trim() || null;
		const luasKm2Str = formData.get('luasKm2')?.toString();
		const rawGeometry = formData.get('geometry')?.toString().trim();

		// Validasi Input Dasar
		if (!nama || nama.length < 2) {
			return fail(400, {
				success: false,
				message: 'Nama DAS wajib diisi (minimal 2 karakter).'
			});
		}

		// Validasi dan Parsing GeoJSON jika diisi
		let parsedGeometry = null;
		if (rawGeometry) {
			try {
				parsedGeometry = JSON.parse(rawGeometry);
				if (!parsedGeometry.type || !['Polygon', 'MultiPolygon'].includes(parsedGeometry.type)) {
					return fail(400, {
						success: false,
						message: 'GeoJSON harus berjenis "Polygon" atau "MultiPolygon".'
					});
				}
			} catch {
				return fail(400, {
					success: false,
					message: 'Format GeoJSON tidak valid (harus berupa JSON string).'
				});
			}
		}

		const payload = {
			nama,
			kode,
			luasKm2: luasKm2Str ? parseInt(luasKm2Str, 10) : null,
			geometry: parsedGeometry
		};

		if (idStr) {
			// Update DAS
			const id = parseInt(idStr, 10);
			const updated = await db
				.update(das)
				.set(payload)
				.where(eq(das.id, id))
				.returning({ id: das.id, nama: das.nama });

			if (!updated.length) {
				return fail(404, { success: false, message: 'Data DAS tidak ditemukan.' });
			}

			await db.insert(userLogs).values({
				userId: String(locals.user.id),
				action: 'UPDATE_DAS',
				details: `Memperbarui data DAS #${id} (${nama})`,
				ipAddress: getClientAddress()
			});

			return { success: true, message: `Data DAS "${nama}" berhasil diperbarui.` };
		} else {
			// Tambah DAS Baru
			const inserted = await db.insert(das).values(payload).returning({ id: das.id });

			await db.insert(userLogs).values({
				userId: String(locals.user.id),
				action: 'CREATE_DAS',
				details: `Menambahkan DAS baru #${inserted[0].id} (${nama})`,
				ipAddress: getClientAddress()
			});

			return { success: true, message: `DAS baru "${nama}" berhasil ditambahkan.` };
		}
	}
};