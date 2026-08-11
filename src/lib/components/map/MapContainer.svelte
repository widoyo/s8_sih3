<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		height?: string;
		showFilters?: boolean;
	}

	let { height = '500px', showFilters = true }: Props = $props();

	let mapElement = $state<HTMLElement | null>(null);
	let mapInstance = $state<any>(null);
	let isMapLoaded = $state(false);
	let stationCount = $state({ awlr: 0, arr: 0, aws: 0, cctv: 0 });

	// Overlay Layer Filter States (Svelte 5 Runes)
	let overlayFilters = $state({
		tma: true,
		curahHujan: true,
		bmkgWarning: true,
		bendungan: true,
		catEsdm: false
	});

	onMount(() => {
		let L: any;
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

					// Fetch Live Stations from ATAB API endpoint
					try {
						const res = await fetch('/api/hydrology/stations');
						const data = await res.json();
						if (data.success && Array.isArray(data.stations)) {
							let awlr = 0, arr = 0, aws = 0, cctv = 0;

							data.stations.forEach((stn: any) => {
								if (!stn.latitude || !stn.longitude) return;

								let iconHtml = '💧';
								let badgeColor = 'bg-primary text-white';
								let typeName = 'AWLR (TMA)';

								if (stn.station_type === 1) {
									iconHtml = '🌧️';
									badgeColor = 'bg-info text-white';
									typeName = 'ARR (Curah Hujan)';
									arr++;
								} else if (stn.station_type === 2) {
									iconHtml = '💧';
									badgeColor = 'bg-blue-600 text-white';
									typeName = 'AWLR (Tinggi Muka Air)';
									awlr++;
								} else if (stn.station_type === 3) {
									iconHtml = '⛅';
									badgeColor = 'bg-warning text-black';
									typeName = 'AWS (Stasiun Cuaca)';
									aws++;
								} else if (stn.station_type === 4) {
									iconHtml = '📷';
									badgeColor = 'bg-purple-600 text-white';
									typeName = 'CCTV / PTZ';
									cctv++;
								}

								const customIcon = L.divIcon({
									className: 'custom-div-icon',
									html: `<div class="w-7 h-7 rounded-full ${badgeColor} flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white transform hover:scale-125 transition-transform">${iconHtml}</div>`,
									iconSize: [28, 28],
									iconAnchor: [14, 14]
								});

								L.marker([stn.latitude, stn.longitude], { icon: customIcon })
									.addTo(mapInstance)
									.bindPopup(`
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
							});

							stationCount = { awlr, arr, aws, cctv };
						}
					} catch (apiErr) {
						console.warn('API station fetch note:', apiErr);
					}

					isMapLoaded = true;
				}
			} catch (err) {
				console.warn('Leaflet load note:', err);
				isMapLoaded = true;
			}
		}

		initMap();

		return () => {
			if (mapInstance) {
				mapInstance.remove();
			}
		};
	});
</script>

<div class="relative w-full rounded-2xl overflow-hidden border border-base-300 shadow-md bg-base-200">
	<!-- Top Overlay Bar: Filter Layer Controls -->
	{#if showFilters}
		<div class="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-base-100/90 backdrop-blur-md border border-base-200 shadow-sm text-xs">
			<div class="flex items-center gap-2 font-bold text-base-content">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
				</svg>
				<span>Layer Filter Overlay:</span>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<label class="cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-lg bg-base-200/80 hover:bg-base-200">
					<input type="checkbox" bind:checked={overlayFilters.tma} class="checkbox checkbox-xs checkbox-primary" />
					<span class="font-medium">Pos TMA ({stationCount.awlr || 7})</span>
				</label>
				<label class="cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-lg bg-base-200/80 hover:bg-base-200">
					<input type="checkbox" bind:checked={overlayFilters.curahHujan} class="checkbox checkbox-xs checkbox-info" />
					<span class="font-medium">Curah Hujan ({stationCount.arr || 2})</span>
				</label>
				<label class="cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-lg bg-base-200/80 hover:bg-base-200">
					<input type="checkbox" bind:checked={overlayFilters.bmkgWarning} class="checkbox checkbox-xs checkbox-warning" />
					<span class="font-medium">Stasiun AWS ({stationCount.aws || 1})</span>
				</label>
				<label class="cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-lg bg-base-200/80 hover:bg-base-200">
					<input type="checkbox" bind:checked={overlayFilters.bendungan} class="checkbox checkbox-xs checkbox-accent" />
					<span class="font-medium">CCTV ({stationCount.cctv || 1})</span>
				</label>
				<label class="cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-lg bg-base-200/80 hover:bg-base-200">
					<input type="checkbox" bind:checked={overlayFilters.catEsdm} class="checkbox checkbox-xs checkbox-secondary" />
					<span class="font-medium">CAT ESDM (8)</span>
				</label>
			</div>
		</div>
	{/if}

	<!-- Map Canvas Element -->
	<div bind:this={mapElement} style="height: {height};" class="w-full z-10">
		{#if !isMapLoaded}
			<div class="w-full h-full flex flex-col items-center justify-center bg-base-200 gap-3">
				<span class="loading loading-spinner loading-md text-primary"></span>
				<span class="text-xs opacity-70">Memuat Peta Geospasial ATAB...</span>
			</div>
		{/if}
	</div>
</div>
