<script lang="ts">
	import { resolve } from "$app/paths";
	import MapContainer from '$lib/components/map/MapContainer.svelte';

	let { data } = $props();

	// KPI Stats derived from live ATAB API data
	let kpiStats = $derived([
		{
			title: 'Pos TMA (AWLR)',
			value: `${data.awlrCount || 0} Pos`,
			status: 'ONLINE',
			badgeColor: 'badge-success',
			subtext: `Live API ATAB (${data.lastUpdated})`,
			icon: '💧'
		},
		{
			title: 'Stasiun Curah Hujan (ARR)',
			value: `${data.arrCount || 0} Pos`,
			status: 'ONLINE',
			badgeColor: 'badge-info',
			subtext: 'Pencatat Curah Hujan Otomatis',
			icon: '🌧️'
		},
		{
			title: 'Stasiun Cuaca (AWS)',
			value: `${data.awsCount || 0} Pos`,
			status: 'ONLINE',
			badgeColor: 'badge-primary',
			subtext: 'Pencatat Cuaca Otomatis',
			icon: '⛅'
		},
		{
			title: 'Peringatan BMKG',
			value: '1 Warning',
			status: 'WASPADA',
			badgeColor: 'badge-warning',
			subtext: 'Hujan lebat & Angin Kencang',
			icon: '⛈️'
		}
	]);

	const bmkgFeeds = [
		{
			title: 'Peringatan Dini Cuaca Sumatera Selatan',
			region: 'Palembang, Banyuasin, Ogan Ilir',
			severity: 'Waspada',
			desc: 'Berpotensi terjadi hujan sedang-lebat yang dapat disertai kilat/petir dan angin kencang.',
			time: 'Berlaku s/d 21:00 WIB'
		},
		{
			title: 'Prakiraan Tinggi Gelombang Laut',
			region: 'Perairan Selat Bangka',
			severity: 'Normal',
			desc: 'Tinggi gelombang diperkirakan 0.5 - 1.25 meter (Kategori Rendah).',
			time: 'Berlaku s/d Besok'
		}
	];
</script>

<svelte:head>
	<title>SIH3 WS MSBL | Portal Sistem Informasi Hidro Meteorologi, Hidrologi, & HidroGeologi</title>
</svelte:head>

<div class="space-y-6">
	<!-- Hero Welcome Banner - Signature Ministry of PU (Kementerian PU) Deep Blue & Yellow Accent -->
	<div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#002D62] via-[#0D47A1] to-[#001D4A] text-white p-6 md:p-8 shadow-2xl border-b-4 border-[#FFCC00]">
		<div class="absolute -right-6 -bottom-8 opacity-10 text-9xl select-none pointer-events-none font-bold">
			🌊
		</div>
		<div class="absolute right-1/4 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

		<div class="relative z-10 max-w-3xl space-y-3">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFCC00] text-[#002D62] text-xs font-black uppercase tracking-wider shadow-md">
				KEMENTERIAN PEKERJAAN UMUM • BALAI BESAR WILAYAH SUNGAI SUMATERA VIII
			</div>
			
			<div class="space-y-1">
				<h1 class="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
					PORTAL SIH3 Wilayah Sungai MSBL
				</h1>
				<h2 class="text-base md:text-lg font-bold text-amber-300">
					Sistem Informasi Hidro Meteorologi, Hidrologi, & HidroGeologi
				</h2>
			</div>

			<p class="text-sm md:text-base opacity-90 leading-relaxed pt-1 text-blue-50">
				Integrasi data terpadu pemantauan cuaca BMKG, tinggi muka air pos duga air hidrologi, dan cekungan air tanah di Wilayah Sungai Musi Sugihan Banyuasin Lemau (WS MSBL).
			</p>
		</div>
	</div>

	<!-- KPI Summary Cards Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each kpiStats as stat (stat.value)}
			<div class="card card-compact bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-all duration-200">
				<div class="card-body flex-row items-center justify-between">
					<div class="space-y-1">
						<span class="text-xs font-semibold opacity-70">{stat.title}</span>
						<div class="flex items-baseline gap-2">
							<span class="text-2xl font-extrabold text-base-content">{stat.value}</span>
							<span class="badge {stat.badgeColor} badge-sm font-semibold">{stat.status}</span>
						</div>
						<span class="text-[10px] opacity-60 block">{stat.subtext}</span>
					</div>
					<div class="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-2xl shadow-inner">
						{stat.icon}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Main Interactive GIS Map Frame Section -->
	<div class="card bg-base-100 border border-base-200 shadow-md">
		<div class="card-body p-4 sm:p-6 space-y-4">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base-200 pb-3">
				<div>
					<h2 class="text-lg font-bold flex items-center gap-2">
						<span class="text-primary">🗺️</span> Peta Geospasial Monitoring Interaktif SIH3 MSBL
					</h2>
					<p class="text-xs opacity-70">Overlay sebaran pos duga air AWLR, stasiun cuaca BMKG, dan CAT ESDM.</p>
				</div>
				<a href="{resolve('/peta-gis')}" class="btn btn-outline btn-primary btn-sm rounded-xl">
					Buka Peta Layar Penuh ↗
				</a>
			</div>

			<!-- Leaflet Map Container -->
			<MapContainer height="460px" showFilters={true} />
		</div>
	</div>

	<!-- Bottom Split Section: Hydrology Table & BMKG Scraped Feeds -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Left (2 Cols): Realtime Hydrology TMA Log Table -->
		<div class="lg:col-span-2 card bg-base-100 border border-base-200 shadow-sm">
			<div class="card-body p-4 sm:p-5">
				<div class="flex items-center justify-between border-b border-base-200 pb-3 mb-2">
					<h3 class="font-bold text-base flex items-center gap-2">
						<span class="text-info">💧</span> Stasiun Pos Duga Air (AWLR) Live ATAB API
					</h3>
					<a href="{resolve('/hidrologi/tma')}" class="text-xs text-primary font-semibold hover:underline">Lihat Semua ({data.awlrCount || 0}) →</a>
				</div>

				<div class="overflow-x-auto">
					<table class="table table-sm w-full">
						<thead>
							<tr class="text-xs">
								<th>Nama Stasiun</th>
								<th>Sungai</th>
								<th>Lokasi</th>
								<th>Status Alert</th>
								<th>Sync Time</th>
							</tr>
						</thead>
						<tbody class="text-xs">
							{#each data.topAwlr as stn (stn.id)}
								<tr class="hover:bg-base-200/50">
									<td class="font-bold text-base-content">{stn.station_name}</td>
									<td class="opacity-80 text-info font-medium">{stn.sungai || '-'}</td>
									<td class="opacity-75">{stn.location || '-'}</td>
									<td>
										<span class="badge {stn.siaga === 1 ? 'badge-success' : 'badge-warning'} badge-xs font-semibold">
											{stn.siaga === 1 ? 'NORMAL' : 'WASPADA'}
										</span>
									</td>
									<td class="opacity-60 font-mono text-[11px]">{data.lastUpdated}</td>
								</tr>
							{:else}
								<tr>
									<td colspan="5" class="text-center py-4 text-xs opacity-60">
										Belum ada data stasiun AWLR yang dimuat.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Right (1 Col): BMKG Scraped Alerts Feed -->
		<div class="card bg-base-100 border border-base-200 shadow-sm">
			<div class="card-body p-4 sm:p-5">
				<div class="flex items-center justify-between border-b border-base-200 pb-3 mb-3">
					<h3 class="font-bold text-base flex items-center gap-2">
						<span class="text-warning">⚡</span> Info BMKG Terbaru
					</h3>
					<span class="badge badge-warning badge-xs">Live Feed</span>
				</div>

				<div class="space-y-3">
					{#each bmkgFeeds as feed (feed.time)}
						<div class="p-3 rounded-xl bg-base-200/60 border border-base-200 space-y-1.5 hover:border-warning/50 transition-colors">
							<div class="flex items-center justify-between">
								<span class="badge {feed.severity === 'Waspada' ? 'badge-warning' : 'badge-info'} badge-xs font-bold">
									{feed.severity}
								</span>
								<span class="text-[10px] opacity-60 font-mono">{feed.time}</span>
							</div>
							<h4 class="font-bold text-xs text-base-content">{feed.title}</h4>
							<p class="text-[11px] opacity-80 leading-relaxed">{feed.desc}</p>
							<span class="text-[10px] text-primary font-medium block">Wilayah: {feed.region}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
