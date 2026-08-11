<script lang="ts">
	const weatherCities = [
		{ name: 'Palembang', temp: '31°C', condition: 'Berawan / Hujan Ringan', humidity: '78%', wind: '12 km/jam SW' },
		{ name: 'Ogan Komering Ilir (Kayuagung)', temp: '30°C', condition: 'Hujan Sedang', humidity: '85%', wind: '15 km/jam W' },
		{ name: 'Muara Enim', temp: '29°C', condition: 'Hujan Petir', humidity: '90%', wind: '18 km/jam W' },
		{ name: 'Banyuasin (Pangkalan Balai)', temp: '31°C', condition: 'Berawan', humidity: '75%', wind: '10 km/jam S' },
		{ name: 'Musirawas (Muara Beliti)', temp: '28°C', condition: 'Hujan Ringan', humidity: '82%', wind: '14 km/jam SW' }
	];
</script>

<svelte:head>
	<title>Hidrometeorologi - Prakiraan Cuaca BMKG | SIH3 Portal</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between border-b border-base-200 pb-3">
		<div>
			<h1 class="text-xl md:text-2xl font-bold flex items-center gap-2">
				<span>⛅</span> Hidrometeorologi - Prakiraan Cuaca BMKG
			</h1>
			<p class="text-xs opacity-70">Data prakiraan cuaca wilayah Sumatera Selatan & sekitarnya (Scrape dari BMKG).</p>
		</div>
		<span class="badge badge-warning font-semibold">Source: BMKG</span>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each weatherCities as city (city.name)}
			<div class="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
				<div class="card-body p-4 space-y-2">
					<div class="flex justify-between items-center">
						<h3 class="font-bold text-base">{city.name}</h3>
						<span class="text-2xl font-extrabold text-primary">{city.temp}</span>
					</div>
					<div class="flex items-center gap-2 text-xs font-semibold text-warning">
						<span>🌦️</span>
						<span>{city.condition}</span>
					</div>
					<div class="grid grid-cols-2 gap-2 text-[11px] opacity-75 pt-2 border-t border-base-200">
						<div>💧 Kelembapan: <strong>{city.humidity}</strong></div>
						<div>💨 Angin: <strong>{city.wind}</strong></div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
