import { error } from '@sveltejs/kit';
import { getAtabToken } from '$lib/server/api/atab';
import { parseStationTimeSeriesPayload } from '$lib/index';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const stationId = parseInt(params.id);
	
	if (isNaN(stationId)) {
		throw error(400, 'ID Stasiun tidak valid');
	}

	try {
		const token = await getAtabToken();
		
		// Fetch station metadata separately from its time-series data.
		const res = await fetch(`https://atab-api.blitztechnology.tech/station/${stationId}/`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!res.ok) {
			if (res.status === 404) throw error(404, 'Stasiun tidak ditemukan');
			throw error(502, `Gagal mengambil data stasiun: ${res.status}`);
		}

		const station = await res.json();
		const timeSeriesRes = await fetch(`https://atab-api.blitztechnology.tech/data/${stationId}/`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		let timeSeries = null;
		if (timeSeriesRes.ok) {
			try {
				timeSeries = await timeSeriesRes.json();
			} catch (err) {
				console.error(`Invalid time-series response for station ${stationId}:`, err);
			}
		} else {
			console.error(
				`Failed to fetch time-series for station ${stationId}: ${timeSeriesRes.status}`
			);
		}

		const stationData = parseStationTimeSeriesPayload(station, timeSeries);

		if (!stationData) {
			throw error(500, 'Format data dari API tidak dikenali atau rusak');
		}

		return {
			station: stationData
		};
	} catch (err) {
		console.error(`Error loading station ${stationId}:`, err);
		if (err && typeof err === 'object' && 'status' in err) throw err;
		throw error(500, 'Terjadi kesalahan internal saat memuat data stasiun');
	}
};