<script lang="ts">
	interface Props {
		data: number[];
		type?: 'line' | 'bar';
		color?: string;
		height?: number;
	}

	let { data, type = 'line', color = '#3b82f6', height = 40 }: Props = $props();

	const validData = $derived(data.filter(v => v !== null && !isNaN(v as number)));
	const max = $derived(Math.max(...validData, 0));
	const min = $derived(Math.min(...validData, 0));
	const range = $derived(max - min || 1);

	const points = $derived(validData.map((v, i) => {
		const x = (i / (validData.length - 1 || 1)) * 100;
		const y = height - ((v - min) / range) * (height - 4) - 2;
		return { x, y };
	}));

	const pathD = $derived(points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '));
	const areaD = $derived(`${pathD} L 100 ${height} L 0 ${height} Z`);
</script>

<svg viewBox="0 0 100 {height}" preserveAspectRatio="none" class="w-full h-full">
	{#if type === 'bar'}
		<!-- PERBAIKAN: Tambahkan (i) sebagai key -->
		{#each validData as v, i (i)}
			{@const barHeight = ((v - min) / range) * (height - 2)}
			{@const barWidth = 100 / validData.length - 0.5}
			{@const x = (i / validData.length) * 100}
			<rect x={x} y={height - barHeight} width={barWidth} height={barHeight} fill={color} opacity="0.7" rx="0.5" />
		{/each}
	{:else}
		{#if points.length > 0}
			<path d={areaD} fill={color} opacity="0.15" />
			<path d={pathD} fill="none" stroke={color} stroke-width="1.5" vector-effect="non-scaling-stroke" />
			<circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="1.5" fill={color} />
		{/if}
	{/if}
</svg>