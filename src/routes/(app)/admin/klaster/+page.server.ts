import { db } from '$lib/server/db';
import { getAtabStations } from '$lib/server/api/atab';
import { posHidrologi } from '$lib/server/db/schema';
import { isNotNull } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const stations = await getAtabStations();
	const localStations = await db
		.select({
			atabStationId: posHidrologi.atabStationId,
			flowDirectionDegrees: posHidrologi.flowDirectionDegrees
		})
		.from(posHidrologi)
		.where(isNotNull(posHidrologi.atabStationId));
	const flowDirectionByAtabId = new Map<number, number>();
	for (const station of localStations) {
		const { atabStationId, flowDirectionDegrees } = station;
		if (
			atabStationId === null ||
			flowDirectionDegrees === null ||
			!Number.isFinite(flowDirectionDegrees) ||
			flowDirectionDegrees < 0 ||
			flowDirectionDegrees >= 360
		) {
			continue;
		}

		flowDirectionByAtabId.set(atabStationId, flowDirectionDegrees);
	}
	const mapStations = stations
		.filter(
			(station) =>
				station.station_type === 1 ||
				station.station_type === 2 ||
				station.station_type === 3
		)
		.map((station) => ({
			id: station.id,
			nama: station.station_name,
			sungai:
				typeof station.sungai === 'string' && station.sungai.trim()
					? station.sungai.trim()
					: 'Tidak diketahui',
			elevasi:
				typeof station.elevasi === 'number' && Number.isFinite(station.elevasi)
					? station.elevasi
					: null,
			latitude: station.latitude,
			longitude: station.longitude,
			station_type: station.station_type,
			flowDirectionDegrees:
				station.station_type === 2
					? (flowDirectionByAtabId.get(station.id) ?? null)
					: null
		}));
	const awlrStations = mapStations.filter((station) => station.station_type === 2);
	const nearbyStations = mapStations.filter(
		(station) => station.station_type === 1 || station.station_type === 3
	);
	const groupsByRiver = new Map<
		string,
		{
			sungai: string;
			stations: {
				id: number;
				nama: string;
				sungai: string;
				elevasi: number | null;
				latitude: number;
				longitude: number;
				flowDirectionDegrees: number | null;
			}[];
		}
	>();

	for (const station of awlrStations) {
		const sungai = station.sungai;
		const riverKey = sungai.toLocaleLowerCase('id-ID');
		let group = groupsByRiver.get(riverKey);
		if (!group) {
			group = { sungai, stations: [] };
			groupsByRiver.set(riverKey, group);
		}

		group.stations.push({
			id: station.id,
			nama: station.nama,
			sungai,
			elevasi: station.elevasi,
			latitude: station.latitude,
			longitude: station.longitude,
			flowDirectionDegrees: station.flowDirectionDegrees
		});
	}

	const riverGroups = [...groupsByRiver.values()]
		.map((group) => ({
			...group,
			stations: group.stations.sort((a, b) => {
				if (a.elevasi === null) return b.elevasi === null ? a.id - b.id : 1;
				if (b.elevasi === null) return -1;
				return b.elevasi - a.elevasi || a.id - b.id;
			})
		}))
		.sort(
			(a, b) =>
				b.stations.length - a.stations.length || a.sungai.localeCompare(b.sungai, 'id-ID')
		);

	return {
		riverGroups,
		stations: awlrStations,
		nearbyStations,
		stationCount: riverGroups.reduce((total, group) => total + group.stations.length, 0)
	};
};
