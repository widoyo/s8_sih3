// src/routes/api/atab/+server.ts
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const res = await fetch('/data/cat.geojson');

		if (!res.ok) {
			throw new Error(`HTTP ${res.status}`);
		}

		const data: GeoJSON.FeatureCollection = await res.json();

		return json(data, {
			headers: {
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (cause) {
		console.error('Gagal memuat data CAT dari /data/cat.geojson:', cause);
		throw error(500, 'Gagal memuat data hidrogeologi.');
	}
};