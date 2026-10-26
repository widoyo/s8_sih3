<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		document.documentElement.setAttribute('data-theme', 'light');
	});
</script>

{@render children()}
