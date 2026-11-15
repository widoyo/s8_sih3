<script lang="ts">
	import type { PageData } from './$types';
	import KlasterMap from '$lib/components/map/KlasterMap.svelte';

	let { data }: { data: PageData } = $props();
	const elevationFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
</script>

<svelte:head>
	<title>Klaster Pos Duga Air | SIH3 MSBL</title>
</svelte:head>

<div class="space-y-5">
	<div
		class="flex flex-col justify-between gap-2 border-b border-base-300 pb-3 sm:flex-row sm:items-center"
	>
		<div>
			<h1 class="text-xl font-bold">Klaster Pos Duga Air</h1>
			<p class="text-xs text-base-content/60">
				Sebaran dan pengelompokan Pos tipe 2 berdasarkan sungai dan elevasi.
			</p>
		</div>
		<span class="badge badge-primary badge-sm">{data.stationCount} Pos</span>
	</div>

	<section class="card border border-base-300 bg-base-100 shadow-sm">
		<div class="card-body gap-3 p-3 sm:p-4">
			<h2 class="text-sm font-semibold">Peta Pos Duga Air</h2>
			<KlasterMap stations={data.stations} nearbyStations={data.nearbyStations} />
		</div>
	</section>

	<section class="card border border-base-300 bg-base-100 shadow-sm">
		<div class="card-body gap-3 p-3 sm:p-4">
			<div class="flex items-center justify-between gap-3">
				<h2 class="text-sm font-semibold">Daftar Pos per Sungai</h2>
				<span class="text-xs text-base-content/60">{data.riverGroups.length} sungai</span>
			</div>

			<div class="overflow-x-auto rounded-lg border border-base-300">
				<table class="table table-sm w-full">
					<thead>
						<tr class="bg-base-200/50">
							<th>ID</th>
							<th>Nama Pos</th>
							<th>Sungai</th>
							<th class="text-right">Elevasi</th>
						</tr>
					</thead>
					<tbody>
						{#each data.riverGroups as group (group.sungai)}
							<tr class="bg-base-200/40">
								<th colspan="4">
									{group.sungai}
									<span class="ml-1 font-normal text-base-content/60"
										>({group.stations.length} pos)</span
									>
								</th>
							</tr>
							{#each group.stations as station (station.id)}
								<tr>
									<td class="font-mono text-xs font-semibold">{station.id}</td>
									<td class="font-medium">{station.nama}</td>
									<td>{station.sungai}</td>
									<td class="text-right font-mono text-xs">
										{station.elevasi === null ? '-' : `${elevationFormat.format(station.elevasi)} m`}
									</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="4" class="py-6 text-center text-sm text-base-content/60">
									Tidak ada data Pos tipe 2.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>
</div>
