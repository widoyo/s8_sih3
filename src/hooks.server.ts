import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';
// Impor fungsi pembanding session & db Anda di sini

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session');

	if (!sessionId) {
		event.locals.user = null;
		return resolve(event);
	}

	// Ambil data user dari database berdasarkan sessionId
	const user = await validateSession(sessionId); 

	if (user) {
		event.locals.user = user;
	} else {
		event.cookies.delete('session', { path: '/' });
		event.locals.user = null;
	}

	return resolve(event);
};