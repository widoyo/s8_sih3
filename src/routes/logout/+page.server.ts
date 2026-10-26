import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { invalidateSession } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { userLogs } from '$lib/server/db/schema';

export const actions: Actions = {
	logout: async ({ cookies, locals, getClientAddress }) => {
		const sessionId = cookies.get('session');

		if (sessionId) {
			// 1. Catat log logout jika user terautentikasi
			if (locals.user) {
				await db.insert(userLogs).values({
					userId: String(locals.user.id),
					action: 'LOGOUT',
					details: 'User melakukan logout',
					ipAddress: getClientAddress()
				});
			}

			// 2. Hapus session di DB dan bersihkan cookie
			await invalidateSession(sessionId);
			cookies.delete('session', { path: '/' });
		}

		throw redirect(303, '/admin/login');
	}
};