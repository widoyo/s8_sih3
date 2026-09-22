import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const isLoginPage = url.pathname === '/admin/login';

	// 1. Jika pengguna BELUM login dan mencoba mengakses rute /admin (selain /admin/login)
	if (!locals.user && !isLoginPage) {
		throw redirect(303, `/admin/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	// 2. Jika pengguna SUDAH login tetapi membuka halaman /admin/login
	if (locals.user && isLoginPage) {
		throw redirect(303, '/admin');
	}

	return {
		user: locals.user
	};
};