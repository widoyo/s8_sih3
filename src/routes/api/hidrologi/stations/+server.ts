import { json } from '@sveltejs/kit';
import { getAtabStations } from '$lib/server/api/atab';

export async function GET() {
	try {
		const stations = await getAtabStations();
		console.log(`Fetched ${stations.length} stations from ATAB API`);
		console.log('Sample station data:', stations.slice(0, 3)); // Log first 3 stations for debugging
		return json({
			success: true,
			count: stations.length,
			stations
		});
	} catch (err: any) {
		return json(
			{
				success: false,
				error: err.message || 'Gagal mengambil stasiun hidrologi ATAB'
			},
			{ status: 500 }
		);
	}
}
