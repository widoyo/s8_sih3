<script lang="ts">
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

<!-- Hero Section -->
<section id="top" class="relative hero flex min-h-screen items-center justify-center py-12">
	<div class="hero-content z-10 my-auto w-full max-w-screen-xl flex-col text-center text-neutral-content drop-shadow-lg">
		<div class="mb-8 max-w-2xl text-center text-base-content">
			<h1 class="mb-4 text-4xl font-extrabold tracking-tight drop-shadow-lg md:text-5xl">SIH3 MSBL</h1>
			<p class="text-sm leading-relaxed font-medium text-base-content/50 drop-shadow-md md:text-base">
				Sistem Informasi Hidro Meteorologi, Hidrologi, & HidroGeologi<br /> Wilayah Sungai Musi Sugihan Banyuasin Lemau (WS MSBL)
			</p>
			<div class="mt-6">&nbsp;</div>
		</div>
<MapContainer height="70vh" showFilters={true} />
		<div class="grid w-full grid-cols-1 gap-4 text-left md:grid-cols-2">
			<!-- Peringatan Dini Iklim -->
			<details class="group card rounded-lg border border-black/10 bg-base-100/30 text-base-content shadow-xl backdrop-blur-md transition-all hover:bg-base-100/50">
				<summary class="card-body cursor-pointer list-none p-2">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-warning/20 p-2.5 text-warning">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<h2 class="card-title">Peringatan Dini Iklim</h2>
						<span class="badge badge-accent">{peringatanIklim.length} info</span>
						<svg xmlns="http://www.w3.org/2000/svg" class="ml-auto size-5 shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
						</svg>
					</div>
				</summary>
				<div class="px-4 pb-4">
					{#if peringatanIklim.length}
						<ul class="space-y-3 border-t border-base-content/10 pt-3 text-left">
							{#each peringatanIklim as item (item.link || item.title)}
								<li>
									{#if item.link}
										<a href={item.link} target="_blank" rel="noopener noreferrer" class="link font-semibold link-hover">{item.title}</a>
									{:else}
										<h3 class="font-semibold">{item.title}</h3>
									{/if}
									{#if item.description}
										<p class="mt-1 text-sm text-base-content/70">{item.description}</p>
									{/if}
								</li>
							{/each}
						</ul>
					{:else}
						<p class="border-t border-base-content/10 pt-3 text-left text-sm text-base-content/70">Tidak ada informasi peringatan iklim.</p>
					{/if}
				</div>
			</details>

			<!-- Card 2: Hujan & Muka Air Sungai -->
			<div class="card rounded-lg border border-black/10 bg-base-100/30 text-base-content shadow-xl backdrop-blur-md transition-all hover:bg-base-100/50">
				<div class="card-body p-2">
					<div class="mb-1 flex items-center gap-3">
						<div class="rounded-lg bg-info/10 p-2.5 text-info">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
							</svg>
						</div>
						<h2 class="card-title text-base font-bold">Hujan & Muka Air Sungai</h2>
					</div>
					<p class="text-sm text-base-content/70 px-2">
						Lihat monitoring real-time {hydroStats.total} pos di bagian <a href="#hidrologi" class="link link-primary font-bold">Hidrologi</a> di bawah.
					</p>
				</div>
			</div>
		</div>

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
		
		<div class="self-start rounded-lg border border-base-300 bg-base-100 px-3 py-1.5 text-xs text-base-content/60 shadow-xs md:self-auto">
			Diperbarui: <span class="font-mono font-semibold text-primary">{lastUpdated} WIB</span>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#if prakiraanItems.length > 0}
				{#each prakiraanItems as item (item.lokasi)}
					<div class="card border border-base-300 bg-base-100 shadow-sm transition-all duration-200 hover:shadow-md">
						<div class="card-body space-y-3 p-4">
							<div class="flex items-center justify-between border-b border-base-200 pb-2">
								<h3 class="truncate text-base font-bold text-base-content" title={item.lokasi}>{item.lokasi}</h3>
								{#if item.url_detail && item.url_detail !== '-'}
									<a href={item.url_detail} target="_blank" rel="noopener noreferrer" class="btn gap-1 btn-ghost text-primary btn-xs" title="Lihat detail di BMKG">
										Detail
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-3">
											<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
										</svg>
									</a>
								{/if}
							</div>
							<div class="grid grid-cols-2 gap-2 divide-x divide-base-200 text-xs">
								<div class="space-y-1.5 pr-1">
									<span class="badge badge-outline badge-xs text-[10px] font-semibold">Hari Ini</span>
									<div class="my-1 flex min-h-[40px] items-center gap-2">
										<div class="flex size-9 shrink-0 items-center justify-center">{@html item.hari_ini.ikon}</div>
										<span class="text-xs leading-tight font-bold text-base-content/90">{item.hari_ini.kondisi.kondisi}</span>
									</div>
									<div class="space-y-0.5 font-mono text-[11px] text-base-content/70">
										<div class="flex justify-between"><span>Suhu:</span><span class="font-bold text-base-content">{item.hari_ini.kondisi.suhu}</span></div>
										<div class="flex justify-between"><span>Lembap:</span><span>{item.hari_ini.kondisi.kelembapan}</span></div>
									</div>
								</div>
								<div class="space-y-1.5 pl-3">
									<span class="badge badge-ghost badge-xs text-[10px] font-semibold">Besok</span>
									<div class="my-1 flex min-h-[40px] items-center gap-2">
										<div class="flex size-9 shrink-0 items-center justify-center">{@html item.besok.ikon}</div>
										<span class="text-xs leading-tight font-bold text-base-content/90">{item.besok.kondisi.kondisi}</span>
									</div>
									<div class="space-y-0.5 font-mono text-[11px] text-base-content/70">
										<div class="flex justify-between"><span>Suhu:</span><span class="font-bold text-base-content">{item.besok.kondisi.suhu}</span></div>
										<div class="flex justify-between"><span>Lembap:</span><span>{item.besok.kondisi.kelembapan}</span></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="col-span-full alert text-xs alert-warning">Data prakiraan cuaca belum tersedia.</div>
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