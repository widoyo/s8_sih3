<script lang="ts">
	import MapContainer from '$lib/components/map/MapContainer.svelte';
</script>

<svelte:head>
	<title>Peta Interaktif GIS | Portal SIH3 BBWS S8</title>
</svelte:head>

<div class="space-y-4">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
		<div>
			<h1 class="text-xl md:text-2xl font-bold flex items-center gap-2">
				<span>🗺️</span> Peta Geospasial Hidro Meteorologi, Hidrologi, & Hidrogeologi
			</h1>
			<p class="text-xs opacity-70">Sistem informasi GIS terpadu Balai Besar Wilayah Sungai Sumatera VIII.</p>
		</div>
	</div>

	<!-- Dedicated Full Height GIS Map Container -->
	<div class="card bg-base-100 border border-base-200 shadow-md">
		<div class="card-body p-3 md:p-4">
			<MapContainer height="70vh" showFilters={true} />
		</div>
	</div>
</div>
