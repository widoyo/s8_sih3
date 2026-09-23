<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		const savedTheme = localStorage.getItem('sih3_theme') ?? 'emerald';
		document.documentElement.setAttribute('data-theme', savedTheme);
	});
</script>

{@render children()}
