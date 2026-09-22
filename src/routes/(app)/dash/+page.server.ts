import { getAtabStations } from '$lib/server/api/atab';
import type { PageServerLoad } from '../../$types';

export const load: PageServerLoad = async () => {
	try {
		const stations = await getAtabStations();

		const awlrCount = stations.filter((s) => s.station_type === 2).length;
		const arrCount = stations.filter((s) => s.station_type === 1).length;
		const awsCount = stations.filter((s) => s.station_type === 3).length;
		const cctvCount = stations.filter((s) => s.station_type === 4).length;

		// Top 5 AWLR stations for the dashboard table
		const topAwlr = stations.filter((s) => s.station_type === 2).slice(0, 5);

		return {
			totalStations: stations.length,
			awlrCount,
			arrCount,
			awsCount,
			cctvCount,
			topAwlr,
			allStations: stations,
			lastUpdated: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
		};
	} catch (err) {
		console.error('Failed to load Dashboard data from ATAB API:', err);
		return {
			totalStations: 0,
			awlrCount: 0,
			arrCount: 0,
			awsCount: 0,
			cctvCount: 0,
			topAwlr: [],
			allStations: [],
			lastUpdated: 'Offline'
		};
	}
};
