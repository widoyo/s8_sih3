import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users, userLogs, lembagas } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { scryptSync, randomBytes } from 'node:crypto';

// Loader: Mengambil daftar user beserta data lembaga terkait
export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/admin/login');
	}

	const userList = await db
		.select({
			id: users.id,
			username: users.username,
			role: users.role,
			lembagaNama: lembagas.nama,
			lastLogin: users.lastLogin,
			createdAt: users.createdAt
		})
		.from(users)
		.leftJoin(lembagas, eq(users.lembagaId, lembagas.id))
		.orderBy(desc(users.createdAt));

	return {
		users: userList
	};
};

// Helper Hash Password
function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const hashedPassword = scryptSync(password, salt, 64).toString('hex');
	return `${salt}:${hashedPassword}`;
}

export const actions: Actions = {
	setPassword: async ({ request, locals, getClientAddress }) => {
		if (!locals.user) {
			return fail(401, { message: 'Tidak terotorisasi' });
		}

		const formData = await request.formData();
		const targetUserId = formData.get('userId')?.toString();
		const newPassword = formData.get('newPassword')?.toString();

		// Validasi Input
		if (!targetUserId || !newPassword || newPassword.length < 4) {
			return fail(400, {
				success: false,
				message: 'ID User valid dan password minimal 4 karakter wajib diisi.'
			});
		}

		// Batasan Akses: Hanya SUPER_ADMIN atau pemilik akun sendiri yang bisa ubah password
		if (locals.user.role !== 'SUPER_ADMIN' && locals.user.id !== targetUserId) {
			return fail(403, {
				success: false,
				message: 'Anda tidak memiliki hak akses untuk mengubah password user ini.'
			});
		}

		// Update Hash di Database
		const newHash = hashPassword(newPassword);
		const updated = await db
			.update(users)
			.set({ passwordHash: newHash })
			.where(eq(users.id, targetUserId))
			.returning({ id: users.id, username: users.username });

		if (!updated.length) {
			return fail(404, {
				success: false,
				message: 'User tidak ditemukan.'
			});
		}

		// Catat Log Aktivitas
		await db.insert(userLogs).values({
			userId: locals.user.id,
			action: 'CHANGE_PASSWORD',
			details: `Reset password untuk user #${targetUserId} (${updated[0].username}) oleh ${locals.user.username}`,
			ipAddress: getClientAddress()
		});

		return {
			success: true,
			message: `Password untuk user "${updated[0].username}" berhasil diperbarui.`
		};
	}
};