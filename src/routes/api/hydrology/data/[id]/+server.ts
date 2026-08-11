import { json } from '@sveltejs/kit';
import { getAtabTimeSeries } from '$lib/server/api/atab';

export async function GET({ params, url }) {
	const stationId = parseInt(params.id, 10);
	if (isNaN(stationId)) {
		return json({ success: false, error: 'Station ID tidak valid' }, { status: 400 });
	}

	const firstDate = url.searchParams.get('first_date') || undefined;
	const lastDate = url.searchParams.get('last_date') || undefined;

	try {
		const timeSeries = await getAtabTimeSeries(stationId, firstDate, lastDate);
		return json({
			success: true,
			stationId,
			data: timeSeries
		});
	} catch (err: any) {
		return json(
			{
				success: false,
				error: err.message || 'Gagal mengambil data time-series stasiun'
			},
			{ status: 500 }
		);
	}
}
