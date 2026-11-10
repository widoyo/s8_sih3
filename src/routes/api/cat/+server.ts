import { error, json, type RequestHandler } from '@sveltejs/kit';
import catZipUrl from '$lib/assets/cat.zip?url';
import shp from 'shpjs';

let catData: Promise<GeoJSON.FeatureCollection> | undefined;

async function loadCatData(customFetch: typeof fetch = fetch): Promise<GeoJSON.FeatureCollection> {
	const response = await customFetch(catZipUrl);
    const buffer = await response.arrayBuffer();
	const parsed = await shp(buffer);

	if (Array.isArray(parsed)) {
		throw new Error('Arsip CAT harus berisi satu shapefile.');
	}

	return parsed;
}

export const GET: RequestHandler = async ({fetch}) => {
	try {
		catData ??= loadCatData(fetch);
		return json(await catData, {
			headers: { 'Cache-Control': 'public, max-age=3600' }
		});
	} catch (cause) {
		catData = undefined;
		console.error('Gagal memuat data CAT dari cat.zip:', cause);
		throw error(500, 'Gagal memuat data hidrogeologi.');
	}
};
