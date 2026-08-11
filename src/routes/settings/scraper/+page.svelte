<script lang="ts">
	const syncLogs = [
		{ source: 'BMKG_CUACA', status: 'SUCCESS', items: 15, error: '-', time: '18:45:00 WIB' },
		{ source: 'BMKG_GEMPA', status: 'SUCCESS', items: 3, error: '-', time: '18:40:00 WIB' },
		{ source: 'PUPR_API_TMA', status: 'SUCCESS', items: 12, error: '-', time: '18:35:00 WIB' },
		{ source: 'CAT_ESDM_SYNC', status: 'SUCCESS', items: 8, error: '-', time: '12:00:00 WIB' }
	];
</script>

<svelte:head>
	<title>Pengaturan Scraper & Sync | SIH3 Portal</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between border-b border-base-200 pb-3">
		<div>
			<h1 class="text-xl md:text-2xl font-bold flex items-center gap-2">
				<span>⚙️</span> BMKG Scraper & API Hydrology Sync Settings
			</h1>
			<p class="text-xs opacity-70">Konfigurasi cron sync, endpoint API, dan log aktivitas data scraping.</p>
		</div>
		<button class="btn btn-primary btn-sm rounded-xl">
			🔄 Trigger Scrape Sekarang
		</button>
	</div>

	<div class="card bg-base-100 border border-base-200 shadow-sm">
		<div class="card-body p-4 space-y-4">
			<h3 class="font-bold text-sm">Log Eksekusi Synchronizer Terakhir</h3>

			<div class="overflow-x-auto">
				<table class="table table-sm w-full">
					<thead>
						<tr class="text-xs">
							<th>Sumber Data Sync</th>
							<th>Status</th>
							<th>Jumlah Data Scraped</th>
							<th>Pesan Error</th>
							<th>Waktu Eksekusi</th>
						</tr>
					</thead>
					<tbody class="text-xs">
						{#each syncLogs as log}
							<tr>
								<td class="font-bold font-mono text-primary">{log.source}</td>
								<td>
									<span class="badge badge-success badge-xs font-bold">{log.status}</span>
								</td>
								<td class="font-semibold">{log.items} record</td>
								<td class="opacity-60">{log.error}</td>
								<td class="opacity-70 font-mono">{log.time}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
