import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, userLogs } from '$lib/server/db/schema';
import { createSession } from '$lib/server/auth';
import { eq } from 'drizzle-orm';
import { scryptSync, timingSafeEqual } from 'node:crypto';

export const load: PageServerLoad = async ({ locals }) => {
	// Jika sudah login, langsung alihkan ke dashboard admin
	if (locals.user) {
		throw redirect(303, '/admin');
	}
	return {};
};

// Helper verifikasi hash password (scrypt)
function verifyPassword(password: string, storedHash: string): boolean {
	const [salt, keyHex] = storedHash.split(':');
	if (!salt || !keyHex) return false;

	const keyBuffer = Buffer.from(keyHex, 'hex');
	const derivedKey = scryptSync(password, salt, 64);

	return keyBuffer.length === derivedKey.length && timingSafeEqual(keyBuffer, derivedKey);
}

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const formData = await request.formData();
		const username = formData.get('username')?.toString().trim();
		const password = formData.get('password')?.toString();

		// 1. Validasi Input Dasar
		if (!username || !password || username.length < 3 || password.length < 4) {
			return fail(400, {
				invalid: true,
				message: 'Username (min 3 karakter) dan Password (min 4 karakter) wajib diisi.'
			});
		}

		// 2. Cari User di Database
		const user = await db.select().from(users).where(eq(users.username, username)).get();

		if (!user) {
			return fail(400, {
				invalid: true,
				message: 'Username atau password tidak cocok.'
			});
		}

		// 3. Verifikasi Password
		const isValidPassword =
			user.passwordHash !== null && verifyPassword(password, user.passwordHash);
		if (!isValidPassword) {
			return fail(400, {
				invalid: true,
				message: 'Username atau password tidak cocok.'
			});
		}

		// 4. Buat Session Baru
		const session = await createSession(user.id);

		// 5. Simpan Cookie Session
		cookies.set('session', session.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			expires: session.expiresAt
		});

		// 6. Update Timestamp `lastLogin` dan Catat Aktivitas di `userLogs`
		const now = new Date();
		await db.update(users).set({ lastLogin: now }).where(eq(users.id, user.id));

		await db.insert(userLogs).values({
			userId: String(user.id),
			action: 'LOGIN',
			details: `Login berhasil sebagai ${user.role}`,
			ipAddress: getClientAddress()
		});

		// 7. Redirect ke Dashboard Admin
		throw redirect(303, '/admin');
	}
};
