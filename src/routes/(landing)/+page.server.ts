import fs from 'node:fs/promises';
import path from 'node:path';
import type { BBWS8Cache } from '$lib/server/bbwss8Service';
import type { PageServerLoad } from './$types';

interface CombinedNewsItem {
	source: 'BMKG Sumsel' | 'BBWSS8';
	title: string;
	link: string;
	image: string;
	excerpt: string;
	date: string;
}

interface ClimateWarning {
	title: string;
	description: string;
	link: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function toClimateWarnings(value: unknown): ClimateWarning[] {
	if (!Array.isArray(value)) return [];

	return value.flatMap((entry): ClimateWarning[] => {
		if (!isRecord(entry) || typeof entry.title !== 'string') return [];

		return [
			{
				title: entry.title,
				description: typeof entry.description === 'string' ? entry.description : '',
				link: typeof entry.link === 'string' ? entry.link : ''
			}
		];
	});
}

function getImageDate(image: string): string {
	const datedImage = image.match(/(\d{4}-\d{2}-\d{2})/);
	if (datedImage) return datedImage[1];

	const timestampedImage = image.match(/(?:^|\/)(\d{13})(?=[-.])/);
	if (timestampedImage) {
		const date = new Date(Number(timestampedImage[1]));
		if (!Number.isNaN(date.getTime())) return date.toISOString();
	}

	return '';
}

function toCombinedNews(value: unknown, source: CombinedNewsItem['source']): CombinedNewsItem[] {
	if (!Array.isArray(value)) return [];

	return value.flatMap((entry): CombinedNewsItem[] => {
		if (!isRecord(entry)) return [];

		const title = typeof entry.title === 'string' ? entry.title : '';
		const link = typeof entry.link === 'string' ? entry.link : '';
		const image = typeof entry.image === 'string' ? entry.image : '';
		const excerpt =
			typeof entry.excerpt === 'string'
				? entry.excerpt
				: typeof entry.description === 'string'
					? entry.description
					: '';
		const date =
			typeof entry.date === 'string' && !Number.isNaN(Date.parse(entry.date))
				? entry.date
				: getImageDate(image);

		if (!title || !link) return [];
		return [{ source, title, link, image, excerpt, date }];
	});
}

export const load: PageServerLoad = async () => {
	const DATA_DIR = path.resolve(process.cwd(), 'data');
	const DATA_FILE = path.join(DATA_DIR, 'prakiraan.json');

	let prakiraanData = { updated_at: null, items: [] };
	let beritaBbwss8Data: BBWS8Cache = { berita: [], lastUpdated: '' };
	let staklimData: unknown = {};

	try {
		const raw = await fs.readFile(DATA_FILE, 'utf-8');
		prakiraanData = JSON.parse(raw);
	} catch (err) {
		console.error('Gagal membaca file data/prakiraan.json:', err);
	}

	try {
		const raw = await fs.readFile(path.join(DATA_DIR, 'berita_bbwss8.json'), 'utf-8');
		beritaBbwss8Data = JSON.parse(raw);
	} catch (err) {
		console.error('Gagal membaca file data/berita_bbwss8.json:', err);
	}

	try {
		const raw = await fs.readFile(path.join(DATA_DIR, 'staklimsumsel.json'), 'utf-8');
		staklimData = JSON.parse(raw);
	} catch (err) {
		console.error('Gagal membaca file data/staklimsumsel.json:', err);
	}

	const bmkgNews = isRecord(staklimData)
		? toCombinedNews(staklimData.kegiatanTerkini, 'BMKG Sumsel')
		: [];
	const peringatanIklim = isRecord(staklimData)
		? toClimateWarnings(staklimData.peringatanIklim)
		: [];
	const bbwsNews = toCombinedNews(beritaBbwss8Data.berita, 'BBWSS8');
	const beritaGabungan = [...bmkgNews, ...bbwsNews].sort((a, b) => {
		const dateA = Date.parse(a.date);
		const dateB = Date.parse(b.date);
		if (Number.isNaN(dateA)) return Number.isNaN(dateB) ? 0 : 1;
		if (Number.isNaN(dateB)) return -1;
		return dateB - dateA;
	});

	return {
		prakiraanData,
		beritaGabungan,
		peringatanIklim
	};
};
