<script lang="ts">
	import { onMount } from 'svelte';

	interface PerijinanMapItem {
		no: string;
		alamat: string;
		skala: string;
		x: string;
		y: string;
	}

	interface Props {
		items: PerijinanMapItem[];
	}

	let { items }: Props = $props();
	let mapElement = $state<HTMLDivElement | null>(null);
	let leaflet = $state<typeof import('leaflet') | null>(null);
	let mapInstance = $state<import('leaflet').Map | null>(null);
	let markersLayer = $state<import('leaflet').FeatureGroup | null>(null);
	let mapError = $state('');

	const markerColors = {
		besar: '#dc2626',
		menengah: '#2563eb',
		lainnya: '#6b7280'
	};

	function getMarkerColor(skala: string): string {
		const normalizedScale = skala.toLocaleLowerCase('id-ID');
		if (normalizedScale.includes('besar')) return markerColors.besar;
		if (normalizedScale.includes('menengah')) return markerColors.menengah;
		return markerColors.lainnya;
	}

	function createPopup(item: PerijinanMapItem): HTMLElement {
		const popup = document.createElement('div');
		popup.className = 'space-y-1';

		const title = document.createElement('strong');
		title.textContent = `Permohonan #${item.no}`;
		popup.append(title);

		const scale = document.createElement('p');
		scale.textContent = `Skala: ${item.skala}`;
		popup.append(scale);

		const address = document.createElement('p');
		address.textContent = item.alamat;
		popup.append(address);

		return popup;
	}

	onMount(() => {
		let disposed = false;

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

				const map = L.map(mapElement, { zoomControl: false }).setView([-3.457, 104.128], 7);
				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; OpenStreetMap contributors',
					maxZoom: 18
				}).addTo(map);
				L.control.zoom({ position: 'bottomright' }).addTo(map);

				const layer = L.featureGroup().addTo(map);
				mapInstance = map;
				markersLayer = layer;
			} catch (error) {
				console.error('Gagal memuat peta perijinan:', error);
				mapError = 'Peta gagal dimuat. Silakan muat ulang halaman.';
			}
		}

		void initializeMap();

		return () => {
			disposed = true;
			mapInstance?.remove();
			mapInstance = null;
			markersLayer = null;
		};
	});

	$effect(() => {
		const map = mapInstance;
		const layer = markersLayer;
		const L = leaflet;
		const currentItems = items;
		if (!map || !layer || !L) return;

		layer.clearLayers();
		const validCoordinates: [number, number][] = [];

		for (const item of currentItems) {
			const longitude = Number(item.x);
			const latitude = Number(item.y);
			if (
				!Number.isFinite(latitude) ||
				!Number.isFinite(longitude) ||
				latitude < -90 ||
				latitude > 90 ||
				longitude < -180 ||
				longitude > 180
			) {
				continue;
			}

			const position: [number, number] = [latitude, longitude];
			const color = getMarkerColor(item.skala);
			L.circleMarker(position, {
				radius: 8,
				color,
				weight: 2,
				fillColor: color,
				fillOpacity: 0.8
			})
				.bindPopup(createPopup(item))
				.addTo(layer);
			validCoordinates.push(position);
		}

		if (validCoordinates.length) {
			map.fitBounds(validCoordinates, { padding: [24, 24], maxZoom: 12 });
		}
	});
</script>

<div class="space-y-3">
	<div class="flex flex-wrap gap-x-4 gap-y-2 text-xs">
		<span class="inline-flex items-center gap-2">
			<span class="size-3 rounded-full bg-red-600"></span>
			Usaha Besar
		</span>
		<span class="inline-flex items-center gap-2">
			<span class="size-3 rounded-full bg-blue-600"></span>
			Usaha Menengah
		</span>
		<span class="inline-flex items-center gap-2">
			<span class="size-3 rounded-full bg-gray-500"></span>
			Skala lainnya
		</span>
	</div>

	{#if mapError}
		<div class="alert text-sm alert-error">{mapError}</div>
	{:else}
		<div
			bind:this={mapElement}
			class="h-[60vh] min-h-96 w-full rounded-lg bg-base-200"
			aria-label="Peta lokasi data perijinan"
		></div>
	{/if}
</div>
