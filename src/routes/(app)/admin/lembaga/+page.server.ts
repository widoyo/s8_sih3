import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { lembagas, userLogs } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

// Loader: Mengambil daftar lembaga
export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/admin/login');
	}

	const lembagaList = await db
		.select()
		.from(lembagas)
		.orderBy(desc(lembagas.id));

	return {
		lembagas: lembagaList
	};
};

export const actions: Actions = {
	// Action untuk Update / Edit Lembaga
	updateLembaga: async ({ request, locals, getClientAddress }) => {
		if (!locals.user) {
			return fail(401, { message: 'Tidak terotorisasi' });
		}

		// Hanya SUPER_ADMIN yang boleh mengubah data lembaga
		if (locals.user.role !== 'SUPER_ADMIN') {
			return fail(403, {
				success: false,
				message: 'Hanya SUPER_ADMIN yang diizinkan mengubah data lembaga.'
			});
		}

		const formData = await request.formData();
		const idStr = formData.get('id')?.toString();
		const nama = formData.get('nama')?.toString().trim();
		const deskripsi = formData.get('deskripsi')?.toString().trim() || null;

		const id = idStr ? parseInt(idStr, 10) : null;

		if (!id || !nama || nama.length < 2) {
			return fail(400, {
				success: false,
				message: 'ID Lembaga valid dan Nama Lembaga (min 2 karakter) wajib diisi.'
			});
		}

		// Update di database
		const updated = await db
			.update(lembagas)
			.set({ nama, deskripsi })
			.where(eq(lembagas.id, id))
			.returning({ id: lembagas.id, nama: lembagas.nama });

		if (!updated.length) {
			return fail(404, {
				success: false,
				message: 'Lembaga tidak ditemukan.'
			});
		}

		// Catat Log Aktivitas
		await db.insert(userLogs).values({
			userId: locals.user.id,
			action: 'UPDATE_LEMBAGA',
			details: `Memperbarui data lembaga #${id} (${updated[0].nama})`,
			ipAddress: getClientAddress()
		});

		return {
			success: true,
			message: `Data lembaga "${updated[0].nama}" berhasil diperbarui.`
		};
	}
};