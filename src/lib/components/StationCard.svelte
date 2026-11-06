<script lang="ts">
	import type { ProcessedStationData } from '$lib/index';
	import { resolve } from '$app/paths';
	import Sparkline from './Sparkline.svelte';

	interface Props {
		station: ProcessedStationData;
	}

	let { station }: Props = $props();

	const STATUS_COLORS = {
		NORMAL: 'bg-success',
		WARNING: 'bg-warning',
		ANOMALI: 'bg-error',
		MAINTENANCE: 'bg-neutral'
	} as const;

	const CHART_COLORS = {
		NORMAL: '#10b981',
		WARNING: '#f59e0b',
		ANOMALI: '#ef4444',
		MAINTENANCE: '#9ca3af'
	} as const;

	const STATUS_TEXT = {
		NORMAL: 'Normal',
		WARNING: 'Waspada',
		ANOMALI: 'Anomali',
		MAINTENANCE: 'Maintenance'
	} as const;

	const statusKey = $derived((station.validation.status ?? 'NORMAL') as keyof typeof STATUS_COLORS);
	const statusColor = $derived(STATUS_COLORS[statusKey]);
	const chartColor = $derived(CHART_COLORS[statusKey]);
	const statusText = $derived(STATUS_TEXT[statusKey]);
</script>

<a
	href={resolve(`/hidrologi/pos/${station.id}/`)}
	class="card card-compact bg-base-100 shadow-sm hover:shadow-md transition-all border border-base-200 hover:border-primary/50 group"
>
	<div class="card-body p-3">
		<div class="flex items-start justify-between gap-2">
			<div class="flex-1 min-w-0">
				<h3 class="font-bold text-base-content truncate group-hover:text-primary transition-colors">
					{station.station_name}
				</h3>
				<p class="text-xs text-base-content/60 truncate">{station.location}</p>
			</div>
			<div class="flex flex-col items-end gap-1">
				<span class="w-2.5 h-2.5 rounded-full {statusColor}" title={station.validation.status}></span>
				<span class="text-[10px] text-base-content/50 font-mono">
					{station.latestReading.time?.split(' ')[1]?.slice(0, 5) || '--:--'}
				</span>
			</div>
		</div>

		<div class="flex items-baseline gap-1 my-1">
			<span class="text-2xl font-extrabold text-base-content">
				{station.latestReading.value !== null ? station.latestReading.value : '--'}
			</span>
			<span class="text-xs text-base-content/60">{station.latestReading.unit}</span>
		</div>

		<div class="h-10 w-full">
			<Sparkline data={station.chartValues} type={station.chartType} color={chartColor} height={40} />
		</div>

		<div class="flex items-center justify-between mt-1 pt-2 border-t border-base-200">
			<span class="text-[10px] text-base-content/60 uppercase tracking-wide">{station.latestReading.label}</span>
			<span class="text-[10px] font-bold {statusColor === 'bg-success' ? 'text-success' : statusColor === 'bg-error' ? 'text-error' : statusColor === 'bg-warning' ? 'text-warning' : 'text-neutral'}">
				{statusText}
			</span>
		</div>
	</div>
</a>