<script lang="ts">
	import { Line, Bar } from 'svelte-chartjs';
	import {
		Chart as ChartJS,
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		BarElement,
		Title,
		Tooltip,
		Legend,
		Filler
	} from 'chart.js';
	import type { ProcessedStationData } from '$lib/index';

	ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

	interface Props {
		data: {
			station: ProcessedStationData & { warningLevels?: { siaga1: number | null; siaga2: number | null; siaga3: number | null } };
		};
	}

	let { data }: Props = $props();
	const station = $derived(data.station);

	// Konfigurasi Warna & Status
	const statusConfig = $derived({
		NORMAL: { bg: 'bg-success', text: 'text-success', border: 'border-success', icon: '✅', label: 'Normal' },
		WARNING: { bg: 'bg-warning', text: 'text-warning', border: 'border-warning', icon: '⚡', label: 'Waspada' },
		ANOMALI: { bg: 'bg-error', text: 'text-error', border: 'border-error', icon: '⚠️', label: 'Anomali' },
		MAINTENANCE: { bg: 'bg-neutral', text: 'text-neutral', border: 'border-neutral', icon: '🔧', label: 'Maintenance' }
	}[station.validation.status]);

	const chartColor = $derived({
		NORMAL: '#10b981',
		WARNING: '#f59e0b',
		ANOMALI: '#ef4444',
		MAINTENANCE: '#9ca3af'
	}[station.validation.status]);

	// Konfigurasi Chart.js Dinamis
	const chartData = $derived({
		labels: station.chartLabels,
		datasets: [{
			label: `${station.latestReading.label} (${station.latestReading.unit})`,
			data: station.chartValues,
			backgroundColor: station.validation.status === 'ANOMALI' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.6)',
			borderColor: chartColor,
			borderWidth: 2,
			borderRadius: station.chartType === 'bar' ? 4 : 0,
			fill: station.chartType === 'line',
			tension: 0.3,
			pointRadius: station.chartType === 'line' ? 3 : 0
		}]
	});

	const chartOptions = $derived({
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			tooltip: { 
				mode: 'index' as const, 
				intersect: false,
				callbacks: {
					label: (context: any) => `${context.dataset.label}: ${context.parsed.y} ${station.latestReading.unit}`
				}
			}
		},
		scales: {
			y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
			x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 45 } }
		}
	});
</script>

<svelte:head>
	<title>{station.station_name} - SIH3 MSBL</title>
</svelte:head>

<div class="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
	
	<!-- Tombol Kembali -->
	<a href="/#hidrologi" class="inline-flex items-center gap-2 text-sm text-base-content/70 hover:text-primary transition-colors">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
		</svg>
		Kembali ke Dashboard
	</a>

	<!-- Header Stasiun & Status -->
	<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-base-300 pb-4">
		<div>
			<h1 class="text-2xl md:text-3xl font-bold text-base-content">{station.station_name}</h1>
			<p class="text-base-content/70 mt-1">
				{station.location} • 
				Tipe: {station.station_type === 1 ? 'Pos Hujan (ARR)' : station.station_type === 2 ? 'Pos Duga Air (AWLR)' : 'Stasiun Cuaca (AWS)'}
			</p>
		</div>
		
		<div class={`px-4 py-2 rounded-lg border-2 font-bold text-sm md:text-base flex items-center gap-2 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} bg-opacity-10`}>
			<span>{statusConfig.icon}</span>
			{statusConfig.label}
		</div>
	</div>

	<!-- Pesan Peringatan Eksplisit (Hanya muncul jika tidak NORMAL) -->
	{#if station.validation.status !== 'NORMAL'}
		<div class={`p-4 rounded-lg border-l-4 flex items-start gap-3 ${station.validation.status === 'ANOMALI' ? 'bg-error/10 border-error text-error' : 'bg-warning/10 border-warning text-warning'}`}>
			<span class="text-xl">{statusConfig.icon}</span>
			<div>
				<p class="font-bold text-lg">Perhatian Sistem:</p>
				<p class="mt-1">{station.validation.message}</p>
			</div>
		</div>
	{/if}

	<!-- Grid Utama: Nilai Terkini & Level Siaga -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<!-- Kartu Nilai Terkini -->
		<div class="card bg-base-100 border border-base-200 shadow-sm md:col-span-2">
			<div class="card-body p-6">
				<p class="text-sm font-semibold text-base-content/60 uppercase tracking-wide">
					Nilai Terkini ({station.latestReading.label})
				</p>
				<div class="flex items-baseline gap-2 mt-2">
					<span class="text-5xl md:text-6xl font-extrabold text-base-content">
						{station.latestReading.value !== null ? station.latestReading.value : '--'}
					</span>
					<span class="text-xl text-base-content/60 font-medium">{station.latestReading.unit}</span>
				</div>
				<p class="text-sm text-base-content/50 mt-4 flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Diperbarui: {station.latestReading.time || 'Tidak ada data'}
				</p>
			</div>
		</div>

		<!-- Kartu Batas Peringatan (Siaga) -->
		<div class="card bg-base-200/50 border border-base-200 shadow-sm">
			<div class="card-body p-6">
				<p class="text-sm font-semibold text-base-content/60 uppercase tracking-wide mb-3">Batas Peringatan</p>
				<ul class="space-y-3 text-sm">
					<li class="flex justify-between items-center p-3 bg-error/10 rounded-lg border border-error/20">
						<span class="font-bold text-error">Siaga 3 (Bahaya)</span>
						<span class="font-mono font-bold text-error">
							{station.warningLevels?.siaga3 ?? '-'} {station.latestReading.unit}
						</span>
					</li>
					<li class="flex justify-between items-center p-3 bg-warning/10 rounded-lg border border-warning/20">
						<span class="font-semibold text-warning">Siaga 2 (Waspada)</span>
						<span class="font-mono font-semibold text-warning">
							{station.warningLevels?.siaga2 ?? '-'} {station.latestReading.unit}
						</span>
					</li>
					<li class="flex justify-between items-center p-3 bg-info/10 rounded-lg border border-info/20">
						<span class="text-info">Siaga 1 (Awas)</span>
						<span class="font-mono text-info">
							{station.warningLevels?.siaga1 ?? '-'} {station.latestReading.unit}
						</span>
					</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Grafik Tren 24 Jam -->
	<div class="card bg-base-100 border border-base-200 shadow-sm">
		<div class="card-body p-4 md:p-6">
			<h3 class="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
				📈 Grafik Tren 24 Jam Terakhir
				<span class="text-xs font-normal text-base-content/60 bg-base-200 px-2 py-1 rounded">
					{station.chartType === 'bar' ? 'Tipe: Bar Chart (Akumulasi)' : 'Tipe: Line Chart (Kontinu)'}
				</span>
			</h3>
			<div class="h-64 md:h-80 w-full">
				{#if station.chartType === 'bar'}
					<Bar data={chartData} options={chartOptions} />
				{:else}
					<Line data={chartData} options={chartOptions} />
				{/if}
			</div>
		</div>
	</div>

</div>