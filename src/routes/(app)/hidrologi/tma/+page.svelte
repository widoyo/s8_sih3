<script lang="ts">
	let { data } = $props();

	let searchQuery = $state('');

	let filteredAwlr = $derived(
		data.awlrStations.filter(
			(s) =>
				s.station_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.sungai?.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);
</script>

<svelte:head>
	<title>Stasiun Duga Air | SIH3 MSBL</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-200 pb-3">
		<div>
			<h1 class="text-xl md:text-2xl font-bold flex items-center gap-2">
				<span class="text-primary">💧</span> Stasiun Duga Air 
			</h1>
			<p class="text-xs opacity-70">
				Data pemantauan tinggi muka air real-time dari API Gateway BBWS Sumatera VIII.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<span class="badge bg-[#002D62] text-[#FFCC00] border-none font-bold text-xs">
				{data.awlrStations.length} AWLR Stasiun
			</span>
			<span class="badge badge-outline text-xs">Sync: {data.lastUpdated}</span>
		</div>
	</div>

	<!-- Search & Filter Bar -->
	<div class="flex items-center gap-3">
		<input
			type="text"
			placeholder="Cari nama stasiun, sungai, lokasi..."
			bind:value={searchQuery}
			class="input input-sm input-bordered w-full max-w-md rounded-lg bg-base-100"
		/>
	</div>

	<!-- Realtime Stations Table -->
	<div class="card bg-base-100 border border-base-200 shadow-sm">
		<div class="card-body p-4">
			<div class="overflow-x-auto">
				<table class="table table-sm table-zebra w-full">
					<thead>
						<tr class="text-xs">
							<th>ID</th>
							<th>Nama Stasiun</th>
							<th>Sungai</th>
							<th>Lokasi</th>
							<th>Koordinat (Lat, Lng)</th>
							<th>Elevasi / Delta</th>
						</tr>
					</thead>
					<tbody class="text-xs">
						{#each filteredAwlr as station (station.id)}
							<tr class="hover:bg-base-200/50">
								<td class="font-mono font-bold text-primary">#{station.id}</td>
								<td class="font-extrabold text-base-content">{station.station_name}</td>
								<td class="font-medium text-info">{station.sungai || '-'}</td>
								<td class="opacity-80">{station.location || '-'}</td>
								<td class="font-mono text-[11px] opacity-75">
									{station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
								</td>
								<td class="font-mono text-[11px]">
									{station.elevasi ?? '-'} m {station.delta_mdpl ? `(Δ ${station.delta_mdpl}m)` : ''}
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="8" class="text-center py-6 text-xs opacity-60">
									Tidak ada data stasiun AWLR yang cocok.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
