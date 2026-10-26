<script lang="ts">
	import PerijinanMap from '$lib/components/map/PerijinanMap.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let searchTerm = $state('');

	const filteredItems = $derived.by(() => {
		const query = searchTerm.trim().toLocaleLowerCase('id-ID');
		return data.perijinanList
			.filter(
				(item) =>
					!query ||
					Object.values(item).some((value) => value.toLocaleLowerCase('id-ID').includes(query))
			)
			.toSorted((a, b) => a.alamat.localeCompare(b.alamat, 'id-ID'));
	});
</script>

<svelte:head>
	<title>Data Perijinan | Admin SIH3 MSBL</title>
</svelte:head>

<div class="space-y-4">
	<div
		class="flex flex-col gap-3 border-b border-base-300 pb-3 sm:flex-row sm:items-end sm:justify-between"
	>
		<div>
			<h1 class="text-xl font-bold">Data Perijinan</h1>
			<p class="text-sm text-base-content/60">
				Data perijinan pemanfaatan air dari file perijinan.csv
			</p>
		</div>
		<label class="form-control w-full sm:max-w-xs">
			<span class="label-text mb-1 text-xs">Cari data</span>
			<input
				class="input-bordered input w-full input-sm"
				type="search"
				placeholder="Alamat, provinsi, jenis izin..."
				bind:value={searchTerm}
			/>
		</label>
	</div>

	<div class="flex items-center justify-between text-xs text-base-content/60">
		<span>Menampilkan {filteredItems.length} dari {data.perijinanList.length} data</span>
	</div>

	<section class="space-y-3 rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm">
		<div>
			<h2 class="font-semibold">Peta Lokasi Perijinan</h2>
			<p class="text-xs text-base-content/60">
				Warna merah untuk usaha besar dan biru untuk usaha menengah. Peta mengikuti hasil pencarian.
			</p>
		</div>
		<PerijinanMap items={filteredItems} />
	</section>

	<div class="overflow-x-auto rounded-lg border border-base-300 bg-base-100 shadow-sm">
		<table class="table w-full table-sm">
			<thead>
				<tr class="bg-base-200/70">
					<th>No.</th>
					<th>Alamat</th>
					<th>Provinsi</th>
					<th>Skala</th>
					<th>Koordinat (X, Y)</th>
					<th>Jenis Permohonan</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredItems as item, index (item.no)}
					<tr class="hover">
						<td class="font-mono text-xs">{index + 1}</td>
						<td class="min-w-80 whitespace-normal">{item.alamat}</td>
						<td>{item.provinsi}</td>
						<td class="whitespace-nowrap">{item.skala}</td>
						<td class="font-mono text-xs whitespace-nowrap">{item.x}, {item.y}</td>
						<td class="min-w-72 whitespace-normal">{item.jenisPermohonan}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="8" class="py-8 text-center text-sm text-base-content/60">
							{searchTerm
								? 'Tidak ada data yang cocok dengan pencarian.'
								: 'Belum ada data perijinan.'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
