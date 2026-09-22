import { db } from '$lib/server/db';
import { sessions, users } from '$lib/server/db/schema';
import { randomBytes } from 'node:crypto';

import { eq } from 'drizzle-orm';

export async function validateSession(sessionId: string) {
	// 1. Join tabel sessions dan users berdasarkan user_id
	const result = await db
		.select({
			user: {
				id: users.id,
				username: users.username,
				role: users.role,
				lembagaId: users.lembagaId,
				lastLogin: users.lastLogin
			},
			session: sessions
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId))
		.get(); // `.get()` mengambil 1 baris pertama pada SQLite

	// 2. Jika session tidak ditemukan di database
	if (!result) {
		return null;
	}

	const { user, session } = result;

	// 3. Cek apakah session sudah kedaluwarsa
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
		return null;
	}

	return user;
}

// Membuat Session Baru (saat Login berhasil)
export async function createSession(userId: string) {
	const sessionId = randomBytes(32).toString('hex');
	
	// Set kedaluwarsa 30 hari dari sekarang
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

	await db.insert(sessions).values({
		id: sessionId,
		userId,
		expiresAt
	});

	return { id: sessionId, expiresAt };
}

// Menghapus Session (saat Logout)
export async function invalidateSession(sessionId: string) {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}