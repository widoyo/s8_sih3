import { getAtabStations } from '$lib/server/api/atab';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const stations = await getAtabStations();

		// Filter AWLR (station_type = 2) & ARR (station_type = 1)
		const awlrStations = stations.filter((s) => s.station_type === 2);
		const arrStations = stations.filter((s) => s.station_type === 1);
		const awsStations = stations.filter((s) => s.station_type === 3);

		return {
			stations,
			awlrStations,
			arrStations,
			awsStations,
			lastUpdated: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
		};
	} catch (err) {
		console.error('Failed to load TMA page data from ATAB API:', err);
		return {
			stations: [],
			awlrStations: [],
			arrStations: [],
			awsStations: [],
			lastUpdated: 'Gagal sync'
		};
	}
};
