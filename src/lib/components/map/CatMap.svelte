<script lang="ts">
	import { onMount } from 'svelte';
	import type { FeatureCollection, GeoJsonProperties } from 'geojson';

	let mapElement = $state<HTMLDivElement | null>(null);
	let mapError = $state('');
	let loading = $state(true);
	let featureCount = $state(0);

	function calculateRingAreaKm2(ring: GeoJSON.Position[]): number {
		const earthRadiusKm = 6371.0088;
		let area = 0;

		for (let index = 0; index < ring.length; index += 1) {
			const current = ring[index];
			const next = ring[(index + 1) % ring.length];
			if (current.length < 2 || next.length < 2) continue;

			const [longitude1, latitude1] = current;
			const [longitude2, latitude2] = next;
			if (
				!Number.isFinite(longitude1) ||
				!Number.isFinite(latitude1) ||
				!Number.isFinite(longitude2) ||
				!Number.isFinite(latitude2)
			) {
				continue;
			}

			const deltaLongitude = ((longitude2 - longitude1) * Math.PI) / 180;
			const latitude1Radians = (latitude1 * Math.PI) / 180;
			const latitude2Radians = (latitude2 * Math.PI) / 180;
			area += deltaLongitude * (2 + Math.sin(latitude1Radians) + Math.sin(latitude2Radians));
		}

		return Math.abs((area * earthRadiusKm * earthRadiusKm) / 2);
	}

	function calculateAreaKm2(geometry: GeoJSON.Geometry): number | null {
		let polygons: GeoJSON.Position[][][];
		if (geometry.type === 'Polygon') {
			polygons = [geometry.coordinates];
		} else if (geometry.type === 'MultiPolygon') {
			polygons = geometry.coordinates;
		} else {
			return null;
		}

		return polygons.reduce((total, rings) => {
			const [outerRing, ...holes] = rings;
			if (!outerRing) return total;

			const polygonArea =
				calculateRingAreaKm2(outerRing) -
				holes.reduce((holeArea, ring) => holeArea + calculateRingAreaKm2(ring), 0);
			return total + Math.max(polygonArea, 0);
		}, 0);
	}

	function createPopup(properties: GeoJsonProperties, areaKm2: number | null): HTMLElement {
		const popup = document.createElement('div');
		popup.className = 'space-y-1';

		const title = document.createElement('strong');
		title.textContent =
			typeof properties?.Name === 'string' ? properties.Name : 'Cekungan Air Tanah';
		popup.append(title);

		const description = document.createElement('p');
		description.textContent = 'Cekungan Air Tanah (CAT)';
		popup.append(description);

		if (areaKm2 !== null) {
			const area = document.createElement('p');
			area.textContent = `Luas: ${new Intl.NumberFormat('id-ID', {
				maximumFractionDigits: 2
			}).format(areaKm2)} km²`;
			popup.append(area);
		}

		return popup;
	}

	onMount(() => {
		let disposed = false;
		let map: import('leaflet').Map | undefined;

		async function loadMap() {
			try {
				const [L, response] = await Promise.all([import('leaflet'), fetch('/api/cat')]);

				if (!response.ok) {
					throw new Error(`Permintaan data CAT gagal (${response.status}).`);
				}

				const data: FeatureCollection = await response.json();
				if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
					throw new Error('Format data CAT tidak valid.');
				}

				if (disposed || !mapElement) return;

				if (!document.getElementById('leaflet-css')) {
					const link = document.createElement('link');
					link.id = 'leaflet-css';
					link.rel = 'stylesheet';
					link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
					document.head.appendChild(link);
				}

				map = L.map(mapElement, { zoomControl: false });
				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; OpenStreetMap contributors',
					maxZoom: 18
				}).addTo(map);
				L.control.zoom({ position: 'bottomright' }).addTo(map);

				const defaultStyle = {
					color: '#0e7490',
					weight: 1,
					fillColor: '#22d3ee',
					fillOpacity: 0.15
				};
				const selectedStyle = {
					color: '#f59e0b',
					weight: 3,
					fillColor: '#facc15',
					fillOpacity: 0.4
				};
				let selectedLayer: import('leaflet').Path | null = null;
				const catLayer = L.geoJSON(data, {
					style: defaultStyle,
					onEachFeature: (feature, layer) => {
						layer.bindPopup(createPopup(feature.properties, calculateAreaKm2(feature.geometry)));
						if (layer instanceof L.Path) {
							layer.on('click', () => {
								selectedLayer?.setStyle(defaultStyle);
								selectedLayer = layer;
								selectedLayer.setStyle(selectedStyle);
								selectedLayer.bringToFront();
							});
						}
					}
				}).addTo(map);

				const bounds = catLayer.getBounds();
				if (bounds.isValid()) {
					map.fitBounds(bounds, { padding: [24, 24] });
				} else {
					map.setView([-3.2, 104.5], 7);
				}

				featureCount = data.features.length;
				loading = false;
			} catch (cause) {
				console.error('Gagal menampilkan peta hidrogeologi:', cause);
				map?.remove();
				mapError = 'Peta hidrogeologi gagal dimuat. Silakan muat ulang halaman.';
				loading = false;
			}
		}

		void loadMap();

		return () => {
			disposed = true;
			map?.remove();
		};
	});
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center justify-between gap-3 text-sm">
		<p class="text-base-content/70">{featureCount} wilayah Cekungan Air Tanah</p>
		<span class="inline-flex items-center gap-2">
			<span class="size-3 rounded-sm border border-cyan-700 bg-cyan-400/50"></span>
			Cekungan Air Tanah
		</span>
	</div>

	{#if mapError}
		<div class="alert text-sm alert-error">{mapError}</div>
	{:else}
		<div class="relative">
			<div
				bind:this={mapElement}
				class="h-[65vh] min-h-96 w-full rounded-lg bg-base-200"
				aria-label="Peta Cekungan Air Tanah wilayah Sumatera Selatan"
			></div>
			{#if loading}
				<div
					class="absolute inset-0 flex h-[65vh] min-h-96 items-center justify-center rounded-lg bg-base-200/80"
				>
					<span class="loading loading-lg loading-spinner text-primary" aria-label="Memuat peta"
					></span>
				</div>
			{/if}
		</div>
	{/if}
</div>
