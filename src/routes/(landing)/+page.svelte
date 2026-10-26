<script lang="ts">
	import CatMap from '$lib/components/map/CatMap.svelte';
	import type { PrakiraanItem } from '../(app)/api/prakiraan/+server';

	// Terima data dari +page.server.ts
	let { data } = $props();

	// Ambil prakiraanData dari props
	const prakiraanData = $derived(data.prakiraanData);
	const prakiraanItems: PrakiraanItem[] = $derived(prakiraanData.items);
	const berita = $derived(data.beritaGabungan);
	const peringatanIklim = $derived(data.peringatanIklim);

	// Format tanggal update agar lebih mudah dibaca
	const lastUpdated = $derived(
		prakiraanData?.updated_at
			? new Date(prakiraanData.updated_at).toLocaleString('id-ID', {
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
</script>

<svelte:head>
	<title>SIH3 MSBL</title>
</svelte:head>

<!-- Hero Section (Full Viewport Height) -->
<section id="top" class="relative hero flex min-h-screen items-center justify-center py-12">
	<div
		class="hero-content z-10 my-auto w-full max-w-screen-xl flex-col text-center text-neutral-content drop-shadow-lg"
	>
		<!-- Hero Text -->
		<div class="mb-8 max-w-2xl text-center text-base-content">
			<h1 class="mb-4 text-4xl font-extrabold tracking-tight drop-shadow-lg md:text-5xl">
				SIH3 MSBL
			</h1>

			<p
				class="text-sm leading-relaxed font-medium text-base-content/50 drop-shadow-md md:text-base"
			>
				Sistem Informasi Hidro Meteorologi, Hidrologi, & HidroGeologi Wilayah Sungai Musi Sugihan
				Banyuasin Lemau (WS MSBL)
			</p>

			<div class="mt-6">&nbsp;</div>
		</div>

		<!-- 2 Column Cards -->
		<div class="grid w-full grid-cols-1 gap-4 text-left md:grid-cols-2">
			<!-- Peringatan Dini Iklim -->
			<details
				class="group card rounded-lg border border-black/10 bg-base-100/30 text-base-content shadow-xl backdrop-blur-md transition-all hover:bg-base-100/50"
			>
				<summary class="card-body cursor-pointer list-none p-2">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-warning/20 p-2.5 text-warning">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
						<h2 class="card-title">Peringatan Dini Iklim</h2>
						<span class="badge badge-accent">{peringatanIklim.length} info</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="ml-auto size-5 shrink-0 transition-transform group-open:rotate-180"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m19 9-7 7-7-7"
							/>
						</svg>
					</div>
				</summary>
				<div class="px-4 pb-4">
					{#if peringatanIklim.length}
						<ul class="space-y-3 border-t border-base-content/10 pt-3 text-left">
							{#each peringatanIklim as item (item.link || item.title)}
								<li>
									{#if item.link}
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
											class="link font-semibold link-hover"
										>
											{item.title}
										</a>
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
						<p class="border-t border-base-content/10 pt-3 text-left text-sm text-base-content/70">
							Tidak ada informasi peringatan iklim.
						</p>
					{/if}
				</div>
			</details>

			<!-- Card 2: Hujan & Muka Air Sungai -->
			<div
				class="card rounded-lg border border-black/10 bg-base-100/30 text-base-content shadow-xl backdrop-blur-md transition-all hover:bg-base-100/50"
			>
				<div class="card-body p-2">
					<div class="mb-1 flex items-center gap-3">
						<div class="rounded-lg bg-info/10 p-2.5 text-info">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
								/>
							</svg>
						</div>
						<h2 class="card-title text-base font-bold">Hujan & Muka Air Sungai</h2>
					</div>
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
							<span
								class={`badge badge-xs ${item.source === 'BBWSS8' ? 'badge-primary' : 'badge-info'} font-sm mr-1`}
							>
								{item.source}
							</span>
							{#if item.date}
								<span class="mr-1 text-xs text-gray-500">{formatBeritaDate(item.date)}</span>
							{/if}
							<a href={item.link} target="_blank" rel="noopener noreferrer" class="link link-hover">
								{item.title}
							</a>
							{#if item.excerpt}
								<p class="mt-1 ml-6 text-xs font-normal text-base-content/70 md:text-sm">
									{item.excerpt}
								</p>
							{/if}
						</li>
					{/each}
				</ol>
			{:else}
				<p class="text-sm text-base-content/70">
					Berita BMKG Sumsel dan BBWS Sumatera VIII belum tersedia.
				</p>
			{/if}
		</div>
	</div>
</section>

<!-- Section Hidrometeorologi -->
<section
	id="hidrometeorologi"
	class="relative flex min-h-screen flex-col items-center justify-center bg-base-200/50 py-16"
>
	<div class="w-full max-w-screen-xl space-y-6">
		<!-- Section Header -->
		<div
			class="flex flex-col justify-between gap-2 border-b border-base-300 pb-4 md:flex-row md:items-end"
		>
			<div>
				<span class="mb-1 badge text-xs font-bold badge-primary">BMKG Sumsel</span>
				<h2 class="text-3xl font-extrabold tracking-tight text-base-content md:text-4xl">
					Prakiraan Cuaca Kabupaten / Kota
				</h2>
				<p class="mt-1 text-xs text-base-content/70 md:text-sm">
					Wilayah Sumatera Selatan & Sekitarnya
				</p>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<figure class="overflow-hidden">
      <p class="font-bold">Potensi Hujan</p>
				<img
					src="https://inderaja.bmkg.go.id/IMAGE/HIMA/H08_RP_Indonesia.png"
					alt="Citra Himawari BMKG Indonesia"
					loading="lazy"
					class="h-full min-h-56 w-full object-contain"
				/>
				<figcaption class="border-t border-base-200 px-4 py-2 text-sm text-base-content/70">
					Citra Himawari — BMKG
				</figcaption>
			</figure>
			<figure class="overflow-hidden">
      <p class="font-bold">Prakiraan Angin Lapisan 3000 feet</p>
				<img
					src="https://dataweb.bmkg.go.id/cuaca/angin/streamline-d10.jpg"
					alt="Peta streamline angin BMKG"
					loading="lazy"
					class="h-full min-h-56 w-full object-contain"
				/>
				<figcaption class="border-t border-base-200 px-4 py-2 text-sm text-base-content/70">
					Peta streamline angin — BMKG
				</figcaption>
			</figure>
		</div>
			<!-- Badge Timestamp Update -->
			<div
				class="self-start rounded-lg border border-base-300 bg-base-100 px-3 py-1.5 text-xs text-base-content/60 shadow-xs md:self-auto"
			>
				Diperbarui: <span class="font-mono font-semibold text-primary">{lastUpdated} WIB</span>
			</div>

		<!-- Grid Card Prakiraan Cuaca -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#if prakiraanItems.length > 0}
				{#each prakiraanItems as item (item.lokasi)}
					<div
						class="card border border-base-300 bg-base-100 shadow-sm transition-all duration-200 hover:shadow-md"
					>
						<div class="card-body space-y-3 p-4">
							<!-- Nama Lokasi & Link Detail -->
							<div class="flex items-center justify-between border-b border-base-200 pb-2">
								<h3 class="truncate text-base font-bold text-base-content" title={item.lokasi}>
									{item.lokasi}
								</h3>
								{#if item.url_detail && item.url_detail !== '-'}
									<a
										href={item.url_detail}
										target="_blank"
										rel="noopener noreferrer"
										class="btn gap-1 btn-ghost text-primary btn-xs"
										title="Lihat detail di BMKG"
									>
										Detail
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="2"
											stroke="currentColor"
											class="size-3"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
											/>
										</svg>
									</a>
								{/if}
							</div>

							<!-- Tampilan 2 Kolom: Hari Ini & Besok -->
							<div class="grid grid-cols-2 gap-2 divide-x divide-base-200 text-xs">
								<!-- Sub-Card Hari Ini -->
								<div class="space-y-1.5 pr-1">
									<span class="badge badge-outline badge-xs text-[10px] font-semibold"
										>Hari Ini</span
									>
									<div class="my-1 flex min-h-[40px] items-center gap-2">
										<div class="flex size-9 shrink-0 items-center justify-center">
											{@html item.hari_ini.ikon}
										</div>
										<span class="text-xs leading-tight font-bold text-base-content/90">
											{item.hari_ini.kondisi.kondisi}
										</span>
									</div>
									<div class="space-y-0.5 font-mono text-[11px] text-base-content/70">
										<div class="flex justify-between">
											<span>Suhu:</span>
											<span class="font-bold text-base-content">{item.hari_ini.kondisi.suhu}</span>
										</div>
										<div class="flex justify-between">
											<span>Lembap:</span>
											<span>{item.hari_ini.kondisi.kelembapan}</span>
										</div>
									</div>
								</div>

								<!-- Sub-Card Besok -->
								<div class="space-y-1.5 pl-3">
									<span class="badge badge-ghost badge-xs text-[10px] font-semibold">Besok</span>
									<div class="my-1 flex min-h-[40px] items-center gap-2">
										<div class="flex size-9 shrink-0 items-center justify-center">
											{@html item.besok.ikon}
										</div>
										<span class="text-xs leading-tight font-bold text-base-content/90">
											{item.besok.kondisi.kondisi}
										</span>
									</div>
									<div class="space-y-0.5 font-mono text-[11px] text-base-content/70">
										<div class="flex justify-between">
											<span>Suhu:</span>
											<span class="font-bold text-base-content">{item.besok.kondisi.suhu}</span>
										</div>
										<div class="flex justify-between">
											<span>Lembap:</span>
											<span>{item.besok.kondisi.kelembapan}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="col-span-full alert text-xs alert-warning">
					Data prakiraan cuaca belum tersedia.
				</div>
			{/if}
		</div>
	</div>
</section>

<section id="hidrologi" class="relative hero flex min-h-screen items-center justify-center py-12">
	<div class="w-full max-w-screen-xl">
		<h1>Hidrologi</h1>
	</div>
</section>

<section
	id="hidrogeologi"
	class="relative flex min-h-screen flex-col items-center justify-center bg-base-200/50 py-16"
>
	<div class="w-full max-w-screen-xl space-y-6">
		<div class="border-b border-base-300 pb-4">
			<span class="mb-1 badge text-xs font-bold badge-primary">Data CAT</span>
			<h2 class="text-3xl font-extrabold tracking-tight text-base-content md:text-4xl">
				Cekungan Air Tanah
			</h2>
			<p class="mt-1 text-sm text-base-content/70">
				Peta wilayah Cekungan Air Tanah dari data shapefile CAT Sumatera Selatan. Pilih area pada
				peta untuk melihat nama CAT.
			</p>
		</div>

		<div class="card border border-base-300 bg-base-100 p-3 shadow-sm md:p-5">
			<CatMap />
		</div>
	</div>
</section>
