<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';
	import CatMap from '$lib/components/map/CatMap.svelte';
	import StationCard from '$lib/components/StationCard.svelte';
	import type { PrakiraanItem } from '../api/prakiraan/+server';
	import MapContainer from '$lib/components/map/MapContainer.svelte';

	interface PageData {
		prakiraanData: { updated_at: string | null; items: PrakiraanItem[] };
		beritaGabungan: any[];
		peringatanIklim: any[];
		groupedStations: { arr: any[]; awlr: any[]; aws: any[] };
		hydroStats: { total: number; normal: number; warning: number; anomali: number; maintenance: number };
	}

	let { data }: { data: PageData } = $props();

	const prakiraanItems = $derived(data.prakiraanData?.items || []);
	const berita = $derived(data.beritaGabungan || []);
	const peringatanIklim = $derived(data.peringatanIklim || []);
	const groupedStations = $derived(data.groupedStations || { arr: [], awlr: [], aws: [] });
	const hydroStats = $derived(data.hydroStats || { total: 0, normal: 0, warning: 0, anomali: 0, maintenance: 0 });

	const lastUpdated = $derived(
		data.prakiraanData?.updated_at
			? new Date(data.prakiraanData.updated_at).toLocaleString('id-ID', {
					day: 'numeric',
					month: 'short',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})
			: '-'
	);

	function formatBeritaDate(date?: string): string {
		if (!date) return '';
		const parsedDate = new Date(date);
		if (Number.isNaN(parsedDate.getTime())) return date;
		return parsedDate.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			timeZone: 'Asia/Jakarta'
		});
	}

	function scrollToMap() {
		document.getElementById('map-container')?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	}

	function scrollToTop() {
		document.getElementById('top')?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	}

	// Svelte 5 State
	let activeHydroTab = $state<'all' | 'arr' | 'awlr' | 'aws'>('all');

	const hydroSections = $derived([
		{ key: 'arr' as const, title: '🌧️ Pos Hujan (ARR)', data: groupedStations.arr },
		{ key: 'awlr' as const, title: '🌊 Pos Duga Air (AWLR)', data: groupedStations.awlr },
		{ key: 'aws' as const, title: '🌤️ Pos AWS', data: groupedStations.aws }
	]);
</script>

<svelte:head>
	<title>SIH3 MSBL</title>
</svelte:head>

<!-- Hero / Intro Section -->
<section
	id="top"
	class="relative flex min-h-[55vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center md:min-h-[60vh] md:py-32"
	style="background: linear-gradient(180deg, #0F2A56 0%, #0F2A56 45%, #fff 100%);"
>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 bg-repeat"
		style="background-image: url('/img/topographic-pattern.svg'); background-size: 600px 600px;"
	></div>

	<div class="relative z-10 mx-auto w-full max-w-screen-xl text-white drop-shadow-lg">
		<div class="mx-auto max-w-3xl">
			<h1 class="mb-5 text-4xl font-extrabold tracking-tight drop-shadow-lg md:text-6xl">SIH3 MSBL</h1>
			<p class="text-sm leading-relaxed font-medium text-white/80 drop-shadow-md md:text-lg">
				Sistem Informasi Hidrologi, Hidro Meteorologi, &amp; HidroGeologi<br />
				Wilayah Sungai Musi Sugihan Banyuasin Lemau (WS MSBL)
			</p>
			<button
				onclick={scrollToMap}
				class="btn btn-outline btn-lg mt-10 border-white text-white shadow-lg bg-[#F7A800] hover:bg-white hover:text-[#F7A800] transition-colors duration-300"
			>
				Peta Monitoring
				<svg xmlns="http://www.w3.org/2000/svg" class="size-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
				</svg>
			</button>
		</div>
	</div>
</section>

<!-- Full-screen Map -->
<section id="map-container" class="h-dvh min-h-[500px] w-full scroll-mt-0">
	<MapContainer height="100dvh" showFilters={true} />
</section>

<!-- Intro Information: Alerts and News -->
<section class="relative bg-base-100 px-4 py-12 md:py-16">
	<div class="mx-auto w-full max-w-screen-xl">
		<!-- Berita Kegiatan -->
		<div class="mt-6 w-full rounded-lg bg-base-100/90 p-5 text-left text-base-content">
			<h2 class="mb-4 text-3xl font-extrabold drop-shadow-lg md:text-4xl">Berita Kegiatan</h2>
			{#if berita?.length}
				<ol class="list-inside list-decimal space-y-3 text-sm font-medium md:text-base">
					{#each berita.slice(0, 5) as item (`${item.source}-${item.link}`)}
						<li class="leading-relaxed">
							<span class={`badge badge-xs ${item.source === 'BBWSS8' ? 'badge-primary' : 'badge-info'} font-sm mr-1`}>{item.source}</span>
							{#if item.date}
								<span class="mr-1 text-xs text-gray-500">{formatBeritaDate(item.date)}</span>
							{/if}
							<a href={item.link} target="_blank" rel="noopener noreferrer" class="link link-hover">{item.title}</a>
							{#if item.excerpt}
								<p class="mt-1 ml-6 text-xs font-normal text-base-content/70 md:text-sm">{item.excerpt}</p>
							{/if}
						</li>
					{/each}
				</ol>
			{:else}
				<p class="text-sm text-base-content/70">Berita BMKG Sumsel dan BBWS Sumatera VIII belum tersedia.</p>
			{/if}
		</div>
	</div>
</section>

<!-- Section Hidrometeorologi -->
<section id="hidrometeorologi" class="relative flex min-h-screen flex-col items-center justify-center bg-base-200/50 py-16">
	<div class="w-full max-w-screen-xl space-y-6 px-4">
		<div class="flex flex-col justify-between gap-2 border-b border-base-300 pb-4 md:flex-row md:items-end">
			<div>
				<span class="mb-1 badge text-xs font-bold badge-primary">BMKG Sumsel</span>
				<h2 class="text-3xl font-extrabold tracking-tight text-base-content md:text-4xl">Prakiraan Cuaca Kabupaten / Kota</h2>
				<p class="mt-1 text-xs text-base-content/70 md:text-sm">Wilayah Sumatera Selatan & Sekitarnya</p>
			</div>
		</div>
		<div class="self-start rounded-lg border border-base-300 bg-base-100 px-3 py-1.5 text-xs text-base-content/60 shadow-xs md:self-auto">
			Diperbarui: <span class="font-mono font-semibold text-primary">{lastUpdated} WIB</span>
		</div>


		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<figure class="overflow-hidden">
				<p class="font-bold mb-2">Potensi Hujan</p>
				<img src="https://inderaja.bmkg.go.id/IMAGE/HIMA/H08_RP_Indonesia.png" alt="Citra Himawari BMKG Indonesia" loading="lazy" class="h-full min-h-56 w-full object-contain rounded-lg border border-base-300" />
				<figcaption class="border-t border-base-200 px-4 py-2 text-sm text-base-content/70">Citra Himawari — BMKG</figcaption>
			</figure>
			<figure class="overflow-hidden">
				<p class="font-bold mb-2">Prakiraan Angin Lapisan 3000 feet</p>
				<img src="https://dataweb.bmkg.go.id/cuaca/angin/streamline-d10.jpg" alt="Peta streamline angin BMKG" loading="lazy" class="h-full min-h-56 w-full object-contain rounded-lg border border-base-300" />
				<figcaption class="border-t border-base-200 px-4 py-2 text-sm text-base-content/70">Peta streamline angin — BMKG</figcaption>
			</figure>
		</div>
		
				<!-- Daftar Prakiraan Cuaca (1 Baris per Item) -->
		<div class="self-start py-1.5 text-xs text-base-content/60 md:self-auto">
			Diperbarui: <span class="font-mono font-semibold text-primary">{lastUpdated} WIB</span>
		</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
	{#if prakiraanItems.length > 0}
		{#each prakiraanItems as item (item.lokasi)}
			<div class="flex items-center justify-between gap-3 p-3 rounded-lg border border-base-300 bg-base-100 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 h-full">
				
				<!-- Bagian Kiri: Label "Hari ini" + Nama Kabupaten -->
				<div class="flex-1 min-w-0 pr-2 flex flex-col">
					<span class="text-xs text-base-content/60 leading-tight">Hari ini</span>
					<span class="font-bold text-base-content truncate" title={item.lokasi}>
						{item.lokasi}
					</span>
				</div>
				
				<!-- Bagian Kanan: Area Klik Luas (Ikon + Teks + Chevron) -->
				{#if item.url_detail && item.url_detail !== '-'}
					<a 
						href={item.url_detail} 
						target="_blank" 
						rel="noopener noreferrer" 
						class="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors shrink-0 group"
						title="Lihat detail prakiraan {item.lokasi}"
					>
						<!-- Kolom Vertikal: Ikon di atas, Teks di bawah -->
						<div class="flex flex-col items-center gap-1">
							<div class="flex items-center justify-center [&>svg]:size-8 [&>img]:size-8 transition-transform duration-200 group-hover:scale-110">
								{@html item.hari_ini.ikon}
							</div>
							<span class="text-xs text-base-content/80 text-center leading-tight font-normal max-w-[120px]">
								{item.hari_ini.kondisi.kondisi}
							</span>
						</div>
						
						<!-- Ikon Panah dari Lucide -->
						<ChevronRight class="size-5 text-primary transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
					</a>
				{:else}
					<!-- Fallback: Tampilan tetap rapi meski tidak ada link -->
					<div class="flex items-center gap-3 p-2 shrink-0">
						<div class="flex flex-col items-center gap-1">
							<div class="flex items-center justify-center [&>svg]:size-8 [&>img]:size-8">
								{@html item.hari_ini.ikon}
							</div>
							<span class="text-xs text-base-content/80 text-center leading-tight font-normal max-w-[120px]">
								{item.hari_ini.kondisi.kondisi}
							</span>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	{:else}
		<div class="col-span-full alert alert-warning text-xs">
			Data prakiraan cuaca belum tersedia.
		</div>
	{/if}
</div>
	</div>
</section>

<!-- Section Hidrologi (Svelte 5 Micro Charts) -->
<section id="hidrologi" class="relative flex min-h-screen flex-col items-center justify-center bg-base-100 py-16">
	<div class="w-full max-w-screen-xl space-y-6 px-4">
		<div class="flex flex-col justify-between gap-2 border-b border-base-300 pb-4 md:flex-row md:items-end">
			<div>
				<span class="mb-1 badge badge-primary text-xs font-bold">Real-time Monitoring</span>
				<h2 class="text-3xl font-extrabold tracking-tight text-base-content md:text-4xl">Monitoring Hidrologi</h2>
				<p class="mt-1 text-sm text-base-content/70">Data curah hujan, tinggi muka air, dan stasiun cuaca otomatis.</p>
			</div>
			<div class="flex gap-2 text-xs flex-wrap">
				<div class="badge badge-success badge-outline gap-1"><span class="w-2 h-2 rounded-full bg-success"></span>Normal: {hydroStats.normal}</div>
				<div class="badge badge-warning badge-outline gap-1"><span class="w-2 h-2 rounded-full bg-warning"></span>Waspada: {hydroStats.warning}</div>
				<div class="badge badge-error badge-outline gap-1"><span class="w-2 h-2 rounded-full bg-error"></span>Anomali: {hydroStats.anomali}</div>
			</div>
		</div>

		<!-- Filter Tabs (Svelte 5 onclick) -->
		<div class="flex gap-2 flex-wrap">
			<button class="btn btn-sm {activeHydroTab === 'all' ? 'btn-primary' : 'btn-ghost'}" onclick={() => activeHydroTab = 'all'}>
				Semua ({hydroStats.total})
			</button>
			{#each hydroSections as section (section.key)}
				<button class="btn btn-sm {activeHydroTab === section.key ? 'btn-primary' : 'btn-ghost'}" onclick={() => activeHydroTab = section.key}>
					{section.title} ({section.data.length})
				</button>
			{/each}
		</div>

		<!-- Sections / Kelompok Pos -->
		{#each hydroSections as section (section.key)}
			{#if activeHydroTab === 'all' || activeHydroTab === section.key}
				{#if section.data.length > 0}
					<div class="space-y-3">
						<h3 class="text-lg font-bold text-base-content flex items-center gap-2">
							{section.title}
							<span class="badge badge-ghost badge-sm">{section.data.length} pos</span>
						</h3>
						
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
							{#each section.data as station}
								<StationCard station={station} />
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		{/each}

		{#if hydroStats.total === 0}
			<div class="alert alert-warning text-xs">
				<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
				<span>Belum ada data stasiun hidrologi yang tersedia atau gagal terhubung ke API.</span>
			</div>
		{/if}
	</div>
</section>

<!-- Section Hidrogeologi -->
<section id="hidrogeologi" class="relative flex min-h-screen flex-col items-center justify-center bg-base-200/50 py-16">
	<div class="w-full max-w-screen-xl space-y-6 px-4">
		<div class="border-b border-base-300 pb-4">
			<span class="mb-1 badge text-xs font-bold badge-primary">Data CAT</span>
			<h2 class="text-3xl font-extrabold tracking-tight text-base-content md:text-4xl">Cekungan Air Tanah</h2>
			<p class="mt-1 text-sm text-base-content/70">Peta wilayah Cekungan Air Tanah dari data shapefile CAT Sumatera Selatan. Pilih area pada peta untuk melihat nama CAT.</p>
		</div>
		<div class="card border border-base-300 bg-base-100 p-3 shadow-sm md:p-5">
			<CatMap />
		</div>
	</div>
</section>

<!-- Floating Back-to-Top Button -->
<button
	type="button"
	class="btn btn-circle btn-primary btn-lg fixed right-4 bottom-4 z-[1000] shadow-xl md:right-6 md:bottom-6"
	onclick={scrollToTop}
	aria-label="Kembali ke atas"
	title="Kembali ke atas"
>
	<svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 15 7-7 7 7" />
	</svg>
</button>
