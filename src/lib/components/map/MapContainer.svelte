<script lang="ts">
	import { onMount } from 'svelte';
	import type { Feature, GeoJsonProperties } from 'geojson';
	import type { Layer } from 'leaflet';

	interface Props {
		height?: string;
		showFilters?: boolean;
	}

	let { height = '500px', showFilters = true }: Props = $props();

	let mapElement = $state<HTMLElement | null>(null);
	let mapInstance = $state<any>(null);
	let isMapLoaded = $state(false);
	let stationCount = $state({ awlr: 0, arr: 0, aws: 0, cctv: 0 });
	let riverNames = $state<string[]>([]);
	let selectedRiver = $state('');
	let riverLayerGroups = $state<Record<string, any>>({});
	let dasNames = $state<string[]>([]);
	let dasCount = $state(0);
	let selectedDas = $state('');
	let dasLayerGroups = $state<Record<string, any>>({});
	let activeDropdown = $state<'type' | 'river' | 'das' | null>(null);

	// Tempat menyimpan LayerGroup untuk masing-masing filter
	let layers = $state<Record<string, any>>({});

	// Overlay Layer Filter States (Svelte 5 Runes)
	let overlayFilters = $state({
		tma: true,
		curahHujan: true,
		bmkgWarning: true,
		bendungan: true,
		catEsdm: false,
		ws: true
	});

	function createWsPopup(properties: GeoJsonProperties): HTMLElement {
		const popup = document.createElement('div');
		popup.className = 'min-w-56 text-xs';

		const title = document.createElement('strong');
		title.className = 'mb-2 block text-sm';
		title.textContent =
			typeof properties?.NAMA_DAS === 'string' ? `DAS ${properties.NAMA_DAS}` : 'Wilayah Sungai';
		popup.append(title);

		const numberFormat = new Intl.NumberFormat('id-ID', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const areaProperties = [
			['LUAS_HA', properties?.LUAS_HA],
			['LUAS_KM', properties?.Luas_KM ?? properties?.LUAS_KM]
		];

		for (const [key, value] of areaProperties) {
			const row = document.createElement('div');
			row.className = 'grid grid-cols-2 gap-2 border-t border-base-200 py-1';

			const propertyName = document.createElement('span');
			propertyName.className = 'font-semibold';
			propertyName.textContent = key;

			const propertyValue = document.createElement('span');
			propertyValue.textContent =
				typeof value === 'number' && Number.isFinite(value) ? numberFormat.format(value) : '-';

			row.append(propertyName, propertyValue);
			popup.append(row);
		}

		return popup;
	}

	onMount(() => {
		let L: any;
		const closeDropdownOnOutsideClick = (event: PointerEvent) => {
			const target = event.target;
			const clickedDropdown =
				target instanceof Element
					? target.closest<HTMLElement>('[data-map-dropdown]')?.dataset.mapDropdown
					: undefined;
			if (clickedDropdown === activeDropdown) return;

			activeDropdown = null;
			const focusedElement = document.activeElement;
			if (focusedElement instanceof HTMLElement && focusedElement.closest('[data-map-dropdown]')) {
				focusedElement.blur();
			}
		};
		document.addEventListener('pointerdown', closeDropdownOnOutsideClick);

		async function initMap() {
			try {
				L = (await import('leaflet')).default;
				if (!document.getElementById('leaflet-css')) {
					const link = document.createElement('link');
					link.id = 'leaflet-css';
					link.rel = 'stylesheet';
					link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
					document.head.appendChild(link);
				}

				if (mapElement && !mapInstance) {
					// Default coords for Palembang / South Sumatra
					const defaultLat = -3.457;
					const defaultLng = 104.128;

					mapInstance = L.map(mapElement, {
						zoomControl: false
					}).setView([defaultLat, defaultLng], 7);

					// OpenStreetMap Basemap
					L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
						attribution: '&copy; OpenStreetMap | ATAB API BBWS Sumatera VIII',
						maxZoom: 18
					}).addTo(mapInstance);

					L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

					// 1. Inisialisasi LayerGroup untuk setiap kategori
					const layerGroups = {
						tma: L.layerGroup(),
						curahHujan: L.layerGroup(),
						bmkgWarning: L.layerGroup(),
						cctv: L.layerGroup(),
						catEsdm: L.layerGroup(),
						ws: L.layerGroup()
					};
					// Fetch Live Stations from ATAB API endpoint
					try {
						const res = await fetch('/api/hidrologi/stations');
						const data = await res.json();
						if (data.success && Array.isArray(data.stations)) {
							let awlr = 0,
								arr = 0,
								aws = 0,
								cctv = 0;
							const stationRiverLayers = new Map<string, any>();
							const stationRiverNames = new Set<string>();

							data.stations.forEach((stn: any) => {
								if (!stn.latitude || !stn.longitude) return;

								let iconHtml = '💧';
								let badgeColor = 'bg-primary text-white';
								let typeName = 'Pos Duga Air';
								let targetLayer = layerGroups.tma;

								if (stn.station_type === 1) {
									iconHtml = '🌧️';
									badgeColor = 'bg-info text-white';
									typeName = 'Pos Hujan';
									targetLayer = layerGroups.curahHujan;
									arr++;
								} else if (stn.station_type === 2) {
									iconHtml = '💧';
									badgeColor = 'bg-blue-600 text-white';
									typeName = 'Pos Duga Air';
									const riverName =
										typeof stn.sungai === 'string' ? stn.sungai.trim() : '';
									let riverLayer = stationRiverLayers.get(riverName);
									if (!riverLayer) {
										riverLayer = L.layerGroup();
										stationRiverLayers.set(riverName, riverLayer);
									}
									targetLayer = riverLayer;
									if (riverName) stationRiverNames.add(riverName);
									awlr++;
								} else if (stn.station_type === 3) {
									iconHtml = '⛅';
									badgeColor = 'bg-warning text-black';
									typeName = 'Pos Klimatologi';
									targetLayer = layerGroups.bmkgWarning;
									aws++;
								} else if (stn.station_type === 4) {
									iconHtml = '📷';
									badgeColor = 'bg-purple-600 text-white';
									typeName = 'CCTV / PTZ';
									targetLayer = layerGroups.cctv;
									cctv++;
								}

								const customIcon = L.divIcon({
									className: 'custom-div-icon',
									html: `<div class="w-7 h-7 rounded-full ${badgeColor} flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white transform hover:scale-125 transition-transform">${iconHtml}</div>`,
									iconSize: [28, 28],
									iconAnchor: [14, 14]
								});

								const marker = L.marker([stn.latitude, stn.longitude], {
									icon: customIcon
								}).bindPopup(`
										<div class="p-2 text-xs">
											<div class="flex items-center gap-1 mb-1">
												<span class="font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">${typeName}</span>
											</div>
											<h4 class="font-black text-sm text-gray-900 mb-1">${stn.station_name}</h4>
											<p class="text-gray-700"><strong>Sungai:</strong> ${stn.sungai || '-'}</p>
											<p class="text-gray-700"><strong>Lokasi:</strong> ${stn.location || '-'}</p>
											<p class="text-gray-600"><strong>Elevasi:</strong> ${stn.elevasi ?? '-'} m</p>
											<p class="text-[10px] text-gray-400 mt-1">ID Stasiun ATAB: #${stn.id}</p>
										</div>
									`);
								marker.addTo(targetLayer);
							});

							for (const riverLayer of stationRiverLayers.values()) {
								layerGroups.tma.addLayer(riverLayer);
							}
							riverLayerGroups = Object.fromEntries(stationRiverLayers);
							riverNames = [...stationRiverNames].sort((a, b) => a.localeCompare(b, 'id'));
							stationCount = { awlr, arr, aws, cctv };
						}
					} catch (apiErr) {
						console.warn('API station fetch note:', apiErr);
					}

					try {
						const res = await fetch('/api/map/ws');
						if (!res.ok) {
							throw new Error(`Permintaan data wilayah sungai gagal (${res.status}).`);
						}

						const data = await res.json();
						if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
							throw new Error('Format data wilayah sungai tidak valid.');
						}

						const wsLayersByDas = new Map<string, any>();
						const wsDasNames = new Set<string>();
						const wsDasAreas = new Map<string, number>();

						for (const feature of data.features as Feature[]) {
							const dasName =
								typeof feature.properties?.NAMA_DAS === 'string'
									? feature.properties.NAMA_DAS.trim()
									: '';
							let dasLayer = wsLayersByDas.get(dasName);
							if (!dasLayer) {
								dasLayer = L.layerGroup();
								wsLayersByDas.set(dasName, dasLayer);
							}

							L.geoJSON(feature, {
								style: {
									color: '#2563eb',
									weight: 2,
									fillColor: '#60a5fa',
									fillOpacity: 0.08
								},
								onEachFeature: (wsFeature: Feature, layer: Layer) => {
									layer.bindPopup(createWsPopup(wsFeature.properties));
								}
							}).addTo(dasLayer);

							if (dasName) {
								wsDasNames.add(dasName);
								const areaKm2 = feature.properties?.Luas_KM ?? feature.properties?.LUAS_KM;
								const areaHectares = feature.properties?.LUAS_HA;
								const area =
									typeof areaKm2 === 'number' && Number.isFinite(areaKm2)
										? areaKm2
										: typeof areaHectares === 'number' && Number.isFinite(areaHectares)
											? areaHectares / 100
											: 0;
								wsDasAreas.set(dasName, Math.max(wsDasAreas.get(dasName) ?? 0, area));
							}
						}

						for (const dasLayer of wsLayersByDas.values()) {
							layerGroups.ws.addLayer(dasLayer);
						}
						dasLayerGroups = Object.fromEntries(wsLayersByDas);
						dasCount = wsDasNames.size;
						dasNames = [...wsDasNames]
							.sort(
								(a, b) =>
									(wsDasAreas.get(b) ?? 0) - (wsDasAreas.get(a) ?? 0) ||
									a.localeCompare(b, 'id')
							)
							.slice(0, 10);
					} catch (apiErr) {
						console.error('Gagal memuat layer wilayah sungai:', apiErr);
					}

					layers = layerGroups;
					isMapLoaded = true;
				}
			} catch (err) {
				console.warn('Leaflet load note:', err);
				isMapLoaded = true;
			}
		}

		initMap();

		return () => {
			document.removeEventListener('pointerdown', closeDropdownOnOutsideClick);
			if (mapInstance) {
				mapInstance.remove();
			}
		};
	});

	// 3. Svelte 5 Effect untuk reaktivitas filter layer
	$effect(() => {
		if (!mapInstance) return;
		// Toggle Layer berdasarkan nilai boolean di overlayFilters
		Object.entries(overlayFilters).forEach(([key, isEnabled]) => {
			const layerGroup = layers[key];
			if (!layerGroup) return;

			if (isEnabled) {
				if (!mapInstance.hasLayer(layerGroup)) {
					mapInstance.addLayer(layerGroup);
				}
			} else {
				if (mapInstance.hasLayer(layerGroup)) {
					mapInstance.removeLayer(layerGroup);
				}
			}
		});
	});

	$effect(() => {
		const tmaLayer = layers.tma;
		if (!tmaLayer) return;

		for (const [riverName, riverLayer] of Object.entries(riverLayerGroups)) {
			const shouldShow = !selectedRiver || riverName === selectedRiver;
			const isVisible = tmaLayer.hasLayer(riverLayer);

			if (shouldShow && !isVisible) {
				tmaLayer.addLayer(riverLayer);
			} else if (!shouldShow && isVisible) {
				tmaLayer.removeLayer(riverLayer);
			}
		}
	});

	$effect(() => {
		const wsLayer = layers.ws;
		if (!wsLayer) return;

		for (const [dasName, dasLayer] of Object.entries(dasLayerGroups)) {
			const shouldShow = !selectedDas || dasName === selectedDas;
			const isVisible = wsLayer.hasLayer(dasLayer);

			if (shouldShow && !isVisible) {
				wsLayer.addLayer(dasLayer);
			} else if (!shouldShow && isVisible) {
				wsLayer.removeLayer(dasLayer);
			}
		}
	});
</script>

<div
	class="relative w-full overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-md"
>
	<!-- Top Overlay Bar: Filter Layer Controls -->
	{#if showFilters}
		<div
			class="absolute top-3 right-3 left-3 z-[400] flex flex-wrap items-center justify-end gap-2 rounded-xl border border-base-200 bg-base-100/90 p-2.5 text-xs shadow-sm backdrop-blur-md"
		>
			<div class="flex items-center gap-2 font-bold text-base-content">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4 text-primary"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
					/>
				</svg>
				<span>Layer Filter Overlay:</span>
			</div>

			<div class="dropdown dropdown-end" data-map-dropdown="type">
				<button
					type="button"
					class="btn gap-2 bg-base-100 text-base-content btn-sm"
					aria-expanded={activeDropdown === 'type'}
					onclick={(event) => {
						activeDropdown = activeDropdown === 'type' ? null : 'type';
						if (activeDropdown === null) event.currentTarget.blur();
					}}
				>
					Tipe Pos
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="m19 9-7 7-7-7"
						/>
					</svg>
				</button>
				{#if activeDropdown === 'type'}
					<div
						role="group"
						aria-label="Filter layer peta"
						class="dropdown-content z-[500] mt-2 flex w-64 flex-col gap-1 rounded-xl border border-base-200 bg-base-100 p-2 text-base-content shadow-xl"
					>
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-base-200"
					>
						<input
							type="checkbox"
							bind:checked={overlayFilters.tma}
							class="checkbox checkbox-xs checkbox-primary"
						/>
						<span class="font-medium">Pos Duga Air ({stationCount.awlr || 7})</span>
					</label>
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-base-200"
					>
						<input
							type="checkbox"
							bind:checked={overlayFilters.curahHujan}
							class="checkbox checkbox-xs checkbox-info"
						/>
						<span class="font-medium">Pos Curah Hujan ({stationCount.arr || 2})</span>
					</label>
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-base-200"
					>
						<input
							type="checkbox"
							bind:checked={overlayFilters.bmkgWarning}
							class="checkbox checkbox-xs checkbox-warning"
						/>
						<span class="font-medium">Pos Klimatologi ({stationCount.aws || 1})</span>
					</label>
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-base-200"
					>
						<input
							type="checkbox"
							bind:checked={overlayFilters.bendungan}
							class="checkbox checkbox-xs checkbox-accent"
						/>
						<span class="font-medium">CCTV ({stationCount.cctv || 1})</span>
					</label>
					</div>
				{/if}
			</div>
			
			<div class="dropdown dropdown-end" data-map-dropdown="river">
				<button
					type="button"
					class="btn gap-2 bg-base-100 text-base-content btn-sm"
					disabled={riverNames.length === 0}
					aria-expanded={activeDropdown === 'river'}
					onclick={(event) => {
						activeDropdown = activeDropdown === 'river' ? null : 'river';
						if (activeDropdown === null) event.currentTarget.blur();
					}}
				>
					<span class="max-w-40 truncate">{selectedRiver || `Sungai (${riverNames.length})`}</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="m19 9-7 7-7-7"
						/>
					</svg>
				</button>
				{#if activeDropdown === 'river'}
					<div
						role="group"
						aria-label="Pilih sungai"
						class="dropdown-content z-[500] mt-2 flex max-h-64 w-64 flex-col gap-1 overflow-y-auto rounded-xl border border-base-200 bg-base-100 p-2 text-base-content shadow-xl"
					>
					<button
						type="button"
						class="w-full rounded-lg px-3 py-2 text-left text-base-content hover:bg-base-200"
						onclick={(event) => {
							selectedRiver = '';
							activeDropdown = null;
							event.currentTarget.blur();
						}}
					>
						Semua Sungai ({riverNames.length})
					</button>
					{#each riverNames as riverName (riverName)}
						<button
							type="button"
							class="w-full rounded-lg px-3 py-2 text-left text-base-content hover:bg-base-200"
							onclick={(event) => {
								selectedRiver = riverName;
								activeDropdown = null;
								event.currentTarget.blur();
							}}
						>
							{riverName}
						</button>
					{/each}
					</div>
				{/if}
			</div>

			<div class="dropdown dropdown-end" data-map-dropdown="das">
				<button
					type="button"
					class="btn gap-2 bg-base-100 text-base-content btn-sm"
					disabled={dasNames.length === 0}
					aria-expanded={activeDropdown === 'das'}
					onclick={(event) => {
						activeDropdown = activeDropdown === 'das' ? null : 'das';
						if (activeDropdown === null) event.currentTarget.blur();
					}}
				>
					<span class="max-w-40 truncate">
						{selectedDas || `DAS (${dasCount})`}
					</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="m19 9-7 7-7-7"
						/>
					</svg>
				</button>
				{#if activeDropdown === 'das'}
					<div
						role="group"
						aria-label="Pilih DAS"
						class="dropdown-content z-[500] mt-2 flex max-h-64 w-64 flex-col gap-1 overflow-y-auto rounded-xl border border-base-200 bg-base-100 p-2 text-base-content shadow-xl"
					>
					<button
						type="button"
						class="w-full rounded-lg px-3 py-2 text-left text-base-content hover:bg-base-200"
						onclick={(event) => {
							selectedDas = '';
							activeDropdown = null;
							event.currentTarget.blur();
						}}
					>
						Semua DAS ({dasCount})
					</button>
					{#each dasNames as dasName (dasName)}
						<button
							type="button"
							class="w-full rounded-lg px-3 py-2 text-left text-base-content hover:bg-base-200"
							onclick={(event) => {
								selectedDas = dasName;
								activeDropdown = null;
								event.currentTarget.blur();
							}}
						>
							{dasName}
						</button>
					{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Map Canvas Element -->
	<div bind:this={mapElement} style="height: {height};" class="z-10 w-full">
		{#if !isMapLoaded}
			<div class="flex h-full w-full flex-col items-center justify-center gap-3 bg-base-200">
				<span class="loading loading-md loading-spinner text-primary"></span>
				<span class="text-xs opacity-70">Memuat Peta Geospasial ATAB...</span>
			</div>
		{/if}
	</div>
</div>
