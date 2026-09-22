import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { userLogs, users } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	// Proteksi otorisasi
	if (!locals.user) {
		throw redirect(303, '/admin/login');
	}

	// Ambil 100 log terbaru beserta data username terkait
	const logs = await db
		.select({
			id: userLogs.id,
			action: userLogs.action,
			details: userLogs.details,
			ipAddress: userLogs.ipAddress,
			createdAt: userLogs.createdAt,
			username: users.username
		})
		.from(userLogs)
		.leftJoin(users, eq(userLogs.userId, users.id))
		.orderBy(desc(userLogs.createdAt))
		.limit(100);

	return {
		logs
	};
};