import fs from 'node:fs/promises';
import path from 'node:path';
import { getAtabToken } from '$lib/server/api/atab'
import type { BBWS8Cache } from '$lib/server/bbwss8Service';
import type { PageServerLoad } from './$types';
import { parseDashboardResponse } from '$lib/index';


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

	let groupedStations = { arr: [] as any[], awlr: [] as any[], aws: [] as any[] };
	let hydroStats = { total: 0, normal: 0, warning: 0, anomali: 0, maintenance: 0 };

	try {
		const token = await getAtabToken();
		
		// Single request ke endpoint dashboard yang sudah difilter oleh backend berdasarkan balai user
		const res = await fetch('https://atab-api.blitztechnology.tech/dashboard/', {
			headers: { Authorization: `Bearer ${token}` }
		});

		if (res.ok) {
			const responseData = await res.json();
			const processedStations = parseDashboardResponse(responseData);

			groupedStations = {
				arr: processedStations.filter(s => s.station_type === 1),
				awlr: processedStations.filter(s => s.station_type === 2),
				aws: processedStations.filter(s => s.station_type === 3)
			};

			hydroStats = {
				total: processedStations.length,
				normal: processedStations.filter(s => s.validation.status === 'NORMAL').length,
				warning: processedStations.filter(s => s.validation.status === 'WARNING').length,
				anomali: processedStations.filter(s => s.validation.status === 'ANOMALI').length,
				maintenance: processedStations.filter(s => s.validation.status === 'MAINTENANCE').length
			};
		}
	} catch (err) {
		console.error('Gagal memproses data dashboard ATAB:', err);
	}

	return {
		prakiraanData,
		beritaGabungan,
		peringatanIklim,
		groupedStations,
		hydroStats
	};
};
