import { json, type RequestHandler } from '@sveltejs/kit';
import catData from '$lib/assets/cat.json';

export const GET: RequestHandler = async () => {
	return json(catData, {
		headers: {
			'Cache-Control': 'public, max-age=3600'
		}
	});
};