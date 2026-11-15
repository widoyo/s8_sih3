<script lang="ts">
	import { onMount } from 'svelte';

	interface KlasterStation {
		id: number;
		nama: string;
		sungai: string;
		elevasi: number | null;
		latitude: number;
		longitude: number;
		flowDirectionDegrees: number | null;
	}

	interface NearbyStation extends KlasterStation {
		station_type: number;
	}

	interface Props {
		stations: KlasterStation[];
		nearbyStations: NearbyStation[];
	}

	let { stations, nearbyStations }: Props = $props();
	let mapElement = $state<HTMLDivElement | null>(null);
	let leaflet = $state<typeof import('leaflet') | null>(null);
	let mapInstance = $state<import('leaflet').Map | null>(null);
	let markersLayer = $state<import('leaflet').FeatureGroup | null>(null);
	let type1MarkersLayer = $state<import('leaflet').FeatureGroup | null>(null);
	let nearbyMarkersLayer = $state<import('leaflet').FeatureGroup | null>(null);
	let loading = $state(true);
	let mapError = $state('');
	let selectedRiver = $state<string | null>(null);
	let selectedStationId = $state<number | null>(null);
	let showType1Markers = $state(true);
	let stationMarkers = new Map<number, import('leaflet').CircleMarker>();
	const nearbyRadiusKm = 25;
	const type1MarkerColor = '#38bdf8';
	const type3MarkerColor = '#7c3aed';

	function getRiverColor(index: number, count: number): string {
		const hue = Math.round((index * 360) / Math.max(count, 1));
		return `hsl(${hue} 70% 40%)`;
	}

	const uniqueRivers = $derived([...new Set(stations.map((station) => station.sungai))]);
	const riverLegend = $derived(
		uniqueRivers.map((sungai, index) => ({
			sungai,
			color: getRiverColor(index, uniqueRivers.length),
			stationCount: stations.filter((station) => station.sungai === sungai).length
		}))
	);
	const visibleStations = $derived(
		selectedRiver === null
			? stations
			: stations.filter((station) => station.sungai === selectedRiver)
	);
	const type1Stations = $derived(nearbyStations.filter((station) => station.station_type === 1));
	const selectedStation = $derived(
		visibleStations.find((station) => station.id === selectedStationId) ?? null
	);
	const nearbyStationsWithDistance = $derived(
		selectedStation === null
			? []
			: nearbyStations
					.filter((station) => hasValidCoordinates(station))
					.map((station) => ({
						...station,
						distanceKm: calculateDistanceKm(selectedStation, station)
					}))
					.filter((station) => station.distanceKm <= nearbyRadiusKm)
	);

	function hasValidCoordinates(station: KlasterStation): boolean {
		return (
			Number.isFinite(station.latitude) &&
			Number.isFinite(station.longitude) &&
			station.latitude >= -90 &&
			station.latitude <= 90 &&
			station.longitude >= -180 &&
			station.longitude <= 180
		);
	}

	function calculateDistanceKm(
		first: Pick<KlasterStation, 'latitude' | 'longitude'>,
		second: Pick<KlasterStation, 'latitude' | 'longitude'>
	): number {
		const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
		const latitudeDelta = toRadians(second.latitude - first.latitude);
		const longitudeDelta = toRadians(second.longitude - first.longitude);
		const haversine =
			Math.sin(latitudeDelta / 2) ** 2 +
			Math.cos(toRadians(first.latitude)) *
				Math.cos(toRadians(second.latitude)) *
				Math.sin(longitudeDelta / 2) ** 2;

		return 2 * 6371.0088 * Math.asin(Math.sqrt(Math.min(haversine, 1)));
	}

	function selectRiver(sungai: string | null) {
		selectedRiver = sungai;
		selectedStationId = null;
	}

	function createPopup(station: KlasterStation): HTMLElement {
		const popup = document.createElement('div');
		popup.className = 'space-y-1 text-sm';

		const title = document.createElement('strong');
		title.textContent = station.nama;
		popup.append(title);

		for (const [label, value] of [
			['ID', String(station.id)],
			['Sungai', station.sungai],
			['Elevasi', station.elevasi === null ? '-' : `${station.elevasi} m`],
			...(station.flowDirectionDegrees === null
				? []
				: [['Arah aliran', `${station.flowDirectionDegrees}° dari utara`]])
		]) {
			const row = document.createElement('p');
			row.textContent = `${label}: ${value}`;
			popup.append(row);
		}

		return popup;
	}

	function createNearbyPopup(station: NearbyStation, distanceKm?: number): HTMLElement {
		const popup = createPopup(station);
		const typeName = station.station_type === 1 ? 'Pos tipe 1' : 'Pos tipe 3';
		const type = document.createElement('p');
		type.textContent = `Tipe: ${typeName}`;
		popup.append(type);

		if (distanceKm !== undefined) {
			const distance = document.createElement('p');
			distance.textContent = `Jarak: ${new Intl.NumberFormat('id-ID', {
				maximumFractionDigits: 2
			}).format(distanceKm)} km`;
			popup.append(distance);
		}

		return popup;
	}

	onMount(() => {
		let disposed = false;
		let map: import('leaflet').Map | undefined;

		async function initializeMap() {
			try {
				const L = await import('leaflet');
				if (disposed || !mapElement) return;
				leaflet = L;

				if (!document.getElementById('leaflet-css')) {
					const link = document.createElement('link');
					link.id = 'leaflet-css';
					link.rel = 'stylesheet';
					link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
					document.head.appendChild(link);
				}

				map = L.map(mapElement, { zoomControl: false }).setView([-3.4, 104.1], 7);
				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; OpenStreetMap contributors',
					maxZoom: 18
				}).addTo(map);
				L.control.zoom({ position: 'bottomright' }).addTo(map);

				mapInstance = map;
				markersLayer = L.featureGroup().addTo(map);
				type1MarkersLayer = L.featureGroup().addTo(map);
				nearbyMarkersLayer = L.featureGroup().addTo(map);
				loading = false;
			} catch (error) {
				console.error('Gagal memuat peta klaster Pos Duga Air:', error);
				mapError = 'Peta gagal dimuat. Silakan muat ulang halaman.';
				loading = false;
			}
		}

		void initializeMap();

		return () => {
			disposed = true;
			map?.remove();
			mapInstance = null;
			markersLayer = null;
			type1MarkersLayer = null;
			nearbyMarkersLayer = null;
		};
	});

	$effect(() => {
		const map = mapInstance;
		const layer = markersLayer;
		const L = leaflet;
		const currentStations = visibleStations;
		if (!map || !layer || !L) return;

		layer.clearLayers();
		const colorByRiver = new Map(
			uniqueRivers.map((sungai, index) => [
				sungai,
				getRiverColor(index, uniqueRivers.length)
			])
		);
		const coordinates: [number, number][] = [];
		const nextStationMarkers = new Map<number, import('leaflet').CircleMarker>();

		for (const station of currentStations) {
			const { latitude, longitude } = station;
			if (!hasValidCoordinates(station)) continue;

			const position: [number, number] = [latitude, longitude];
			const color = colorByRiver.get(station.sungai) ?? getRiverColor(0, 1);
			const marker = L.circleMarker(position, {
				radius: 7,
				color: '#ffffff',
				weight: 2,
				fillColor: color,
				fillOpacity: 0.9
			})
				.bindPopup(createPopup(station));
			marker.on('click', () => {
				selectedStationId = selectedStationId === station.id ? null : station.id;
			});
			marker.addTo(layer);
			if (station.flowDirectionDegrees !== null) {
				const angle = station.flowDirectionDegrees;
				const arrowIcon = L.divIcon({
					className: 'klaster-flow-arrow-icon',
					html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="transform: rotate(${angle}deg); filter: drop-shadow(0 0 1px white)"><path d="M12 2 20 22 12 17 4 22Z" fill="#111827" stroke="#fff" stroke-width="1"/></svg>`,
					iconSize: [18, 18],
					iconAnchor: [9, 9]
				});
				L.marker(position, {
					icon: arrowIcon,
					interactive: false,
					keyboard: false,
					zIndexOffset: 1000
				}).addTo(layer);
			}
			nextStationMarkers.set(station.id, marker);
			coordinates.push(position);
		}

		stationMarkers = nextStationMarkers;
		if (coordinates.length) {
			map.fitBounds(coordinates, { padding: [24, 24], maxZoom: 12 });
		}
	});

	$effect(() => {
		const selectedId = selectedStationId;
		for (const [stationId, marker] of stationMarkers) {
			const isSelected = stationId === selectedId;
			marker.setRadius(isSelected ? 10 : 7);
			marker.setStyle({
				weight: isSelected ? 4 : 2,
				fillOpacity: isSelected ? 1 : 0.9
			});
		}
	});

	$effect(() => {
		const map = mapInstance;
		const layer = type1MarkersLayer;
		const awlrLayer = markersLayer;
		const L = leaflet;
		const currentStations = type1Stations;
		const shouldShow = showType1Markers;
		const selected = selectedStation;
		if (!map || !layer || !awlrLayer || !L) return;

		layer.clearLayers();
		if (shouldShow) {
			for (const station of currentStations) {
				if (!hasValidCoordinates(station)) continue;

				L.circleMarker([station.latitude, station.longitude], {
					radius: 7,
					color: '#ffffff',
					weight: 2,
					fillColor: type1MarkerColor,
					fillOpacity: 0.95
				})
					.bindPopup(createNearbyPopup(station))
					.addTo(layer);
			}
		}

		if (!selected) {
			const bounds = L.featureGroup([awlrLayer, layer]).getBounds();
			if (bounds.isValid()) {
				map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 });
			}
		}
	});

	$effect(() => {
		const map = mapInstance;
		const layer = nearbyMarkersLayer;
		const L = leaflet;
		const selected = selectedStation;
		const nearby = nearbyStationsWithDistance;
		if (!map || !layer || !L) return;

		layer.clearLayers();
		if (!selected || !hasValidCoordinates(selected)) return;

		const bounds: [number, number][] = [[selected.latitude, selected.longitude]];
		for (const station of nearby) {
			if (station.station_type !== 3) continue;
			if (!hasValidCoordinates(station)) continue;
			const position: [number, number] = [station.latitude, station.longitude];
			L.circleMarker(position, {
				radius: 8,
				color: '#ffffff',
				weight: 2,
				fillColor: type3MarkerColor,
				fillOpacity: 0.95
			})
				.bindPopup(createNearbyPopup(station, station.distanceKm))
				.addTo(layer);
			bounds.push(position);
		}

		if (bounds.length > 1) {
			map.fitBounds(bounds, { padding: [32, 32], maxZoom: 12 });
		} else {
			map.setView(bounds[0], 10);
		}
	});
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
		<button
			type="button"
			class={`inline-flex items-center rounded-full border px-3 py-1 transition-colors ${
				selectedRiver === null
					? 'border-primary bg-primary/10 font-semibold text-primary'
					: 'border-base-300 hover:bg-base-200'
			}`}
			aria-pressed={selectedRiver === null}
			onclick={() => selectRiver(null)}
		>
			Semua Sungai ({stations.length})
		</button>
		<label class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-base-300 px-3 py-1">
			<input
				type="checkbox"
				class="checkbox checkbox-primary checkbox-xs"
				bind:checked={showType1Markers}
			/>
			<span class="size-3 rounded-full" style={`background-color: ${type1MarkerColor}`}></span>
			<span>Pos tipe 1 ({type1Stations.length})</span>
		</label>
		<span class="inline-flex items-center gap-2">
			<span class="size-3 rounded-full bg-[#7c3aed]"></span>
			Pos tipe 3
		</span>
		<span class="text-base-content/60">
			▲ Arah aliran tersimpan pada data Pos
		</span>
		{#each riverLegend as item (item.sungai)}
			<button
				type="button"
				class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 transition-colors ${
					selectedRiver === item.sungai
						? 'border-current bg-base-200 font-semibold'
						: 'border-transparent hover:bg-base-200'
				}`}
				aria-pressed={selectedRiver === item.sungai}
				title={`Tampilkan pos di Sungai ${item.sungai}`}
				onclick={() => selectRiver(selectedRiver === item.sungai ? null : item.sungai)}
			>
				<span class="size-3 rounded-full" style={`background-color: ${item.color}`}></span>
				{item.sungai} ({item.stationCount})
			</button>
		{/each}
	</div>
	<p class="text-xs text-base-content/60">
		Menampilkan {visibleStations.length} dari {stations.length} Pos
		{#if selectedRiver}
			di Sungai {selectedRiver}
		{/if}
	</p>
	{#if selectedStation}
		<p class="text-xs text-base-content/70">
			Pos #{selectedStation.id} dipilih — {nearbyStationsWithDistance.length} Pos tipe 1/3 dalam
			radius {nearbyRadiusKm} km.
		</p>
	{:else}
		<p class="text-xs text-base-content/60">
			Klik marker Pos tipe 2 untuk menampilkan Pos tipe 1 dan 3 dalam radius {nearbyRadiusKm} km.
		</p>
	{/if}

	{#if mapError}
		<div class="alert text-sm alert-error">{mapError}</div>
	{:else}
		<div class="relative">
			<div
				bind:this={mapElement}
				class="h-[60vh] min-h-96 w-full rounded-lg bg-base-200"
				aria-label={selectedRiver
					? `Peta Pos Duga Air Sungai ${selectedRiver}`
					: 'Peta klaster Pos Duga Air berdasarkan sungai'}
			></div>
			{#if loading}
				<div
					class="absolute inset-0 flex h-[60vh] min-h-96 items-center justify-center rounded-lg bg-base-200/80"
				>
					<span
						class="loading loading-lg loading-spinner text-primary"
						aria-label="Memuat peta"
					></span>
				</div>
			{/if}
		</div>

		<style>
			:global(.klaster-flow-arrow-icon) {
				background: transparent;
				border: 0;
			}
		</style>
	{/if}
</div>
