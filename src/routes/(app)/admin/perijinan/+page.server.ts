import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_FILE = path.resolve(process.cwd(), 'src/lib/server/db/perijinan.csv');
const EXPECTED_HEADERS = [
	'No',
	'Alamat',
	'Provinsi',
	'Skala',
	'X',
	'Y',
	'Jenis Permohonan',
	'Nama_WS',
	'Kode_WS'
] as const;

export interface PerijinanItem {
	no: string;
	alamat: string;
	provinsi: string;
	skala: string;
	x: string;
	y: string;
	jenisPermohonan: string;
	namaWs: string;
	kodeWs: string;
}

function parsePerijinanFile(contents: string): PerijinanItem[] {
	const rows = contents
		.replace(/^\uFEFF/, '')
		.split(/\r?\n/)
		.filter((row) => row.trim());
	const headers = rows.shift()?.split('\t');

	if (!headers || headers.some((header, index) => header !== EXPECTED_HEADERS[index])) {
		throw new Error('Header file perijinan.csv tidak sesuai format yang diharapkan.');
	}

	return rows.map((row, index) => {
		const columns = row.split('\t');
		if (columns.length !== EXPECTED_HEADERS.length) {
			throw new Error(`Jumlah kolom tidak valid pada baris ${index + 2} file perijinan.csv.`);
		}

		const [no, alamat, provinsi, skala, x, y, jenisPermohonan, namaWs, kodeWs] = columns;

		return { no, alamat, provinsi, skala, x, y, jenisPermohonan, namaWs, kodeWs };
	});
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/admin/login');
	}

	try {
		const contents = await fs.readFile(DATA_FILE, 'utf-8');
		return { perijinanList: parsePerijinanFile(contents) };
	} catch (cause) {
		console.error('Gagal membaca data perijinan:', cause);
		throw error(500, 'Data perijinan gagal dimuat.');
	}
};
