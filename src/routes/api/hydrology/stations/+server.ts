import { json } from '@sveltejs/kit';
import { getAtabStations } from '$lib/server/api/atab';

export async function GET() {
	try {
		const stations = await getAtabStations();
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
