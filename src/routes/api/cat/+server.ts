import { error, json, type RequestHandler } from '@sveltejs/kit';
import fs from 'node:fs/promises';
import path from 'node:path';
import shp from 'shpjs';

let catData: Promise<GeoJSON.FeatureCollection> | undefined;

async function loadCatData(): Promise<GeoJSON.FeatureCollection> {
	const archivePath = path.resolve(process.cwd(), 'cat.zip');
	const parsed = await shp(await fs.readFile(archivePath));

	if (Array.isArray(parsed)) {
		throw new Error('Arsip CAT harus berisi satu shapefile.');
	}

	return parsed;
}

export const GET: RequestHandler = async () => {
	try {
		catData ??= loadCatData();
		return json(await catData, {
			headers: { 'Cache-Control': 'public, max-age=3600' }
		});
	} catch (cause) {
		catData = undefined;
		console.error('Gagal memuat data CAT dari cat.zip:', cause);
		throw error(500, 'Gagal memuat data hidrogeologi.');
	}
};
