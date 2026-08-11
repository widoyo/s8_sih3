<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	interface Props {
		onToggleSidebar?: () => void;
		activeTheme?: string;
	}

	let { onToggleSidebar, activeTheme = $bindable('emerald') }: Props = $props();

	// Live Time Tracker using Svelte 5 Runes
	let currentTime = $state('');
	let currentDate = $state('');

	// Theme list for DaisyUI
	const themes = [
		{ name: 'Emerald (Default)', value: 'emerald' },
		{ name: 'Corporate (Professional)', value: 'corporate' },
		{ name: 'Dark Mode', value: 'dark' },
		{ name: 'Nord (Clean)', value: 'nord' },
		{ name: 'Synthwave (Vibrant)', value: 'synthwave' },
		{ name: 'Dracula', value: 'dracula' },
		{ name: 'Light', value: 'light' }
	];

	function updateTime() {
		const now = new Date();
		currentTime = now.toLocaleTimeString('id-ID', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		}) + ' WIB';
		currentDate = now.toLocaleDateString('id-ID', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function changeTheme(newTheme: string) {
		activeTheme = newTheme;
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', newTheme);
			localStorage.setItem('sih3_theme', newTheme);
		}
	}

	onMount(() => {
		updateTime();
		const interval = setInterval(updateTime, 1000);

		const savedTheme = localStorage.getItem('sih3_theme');
		if (savedTheme) {
			changeTheme(savedTheme);
		}

		return () => clearInterval(interval);
	});
</script>

<header class="navbar sticky top-0 z-40 glass-nav border-b border-base-200/60 px-3 lg:px-6 shadow-sm transition-colors duration-200">
	<!-- Left Section: Mobile Drawer Toggle & Logo -->
	<div class="flex-1 gap-3">
		<button
			type="button"
			class="btn btn-square btn-ghost lg:hidden text-base-content"
			onclick={onToggleSidebar}
			aria-label="Toggle Sidebar Navigation"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>

		<a href={resolve("/")} class="flex items-center gap-3 group">
			<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#002D62] via-[#0D47A1] to-[#FFCC00] p-0.5 shadow-md group-hover:scale-105 transition-transform duration-200">
				<div class="w-full h-full bg-[#002D62] text-[#FFCC00] rounded-[10px] flex items-center justify-center font-black text-xl shadow-inner">
					🌊
				</div>
			</div>
			<div class="flex flex-col">
				<div class="flex items-center gap-2">
					<span class="font-black text-lg tracking-tight text-[#002D62] dark:text-blue-400">
						SIH3 WS MSBL
					</span>
				</div>
				<span class="text-[10px] opacity-75 hidden sm:block font-semibold tracking-wide uppercase">
					WS Musi Sugihan Banyuasin Lemau
				</span>
			</div>
		</a>
	</div>

	<!-- Center Section: Quick Search Bar (Hidden on Mobile) -->
	<div class="hidden md:flex flex-1 max-w-xs mx-4">
		<div class="relative w-full">
			<input
				type="text"
				placeholder="Cari stasiun, sungai, peringatan..."
				class="input input-sm input-bordered w-full pl-9 pr-4 rounded-lg bg-base-200/50 focus:bg-base-100 focus:input-primary transition-all text-xs"
			/>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</div>
	</div>

	<!-- Right Section: Realtime Clock, Status Badge, Theme Switcher & Actions -->
	<div class="flex items-center gap-2 sm:gap-3">
		<!-- Real-time Clock & Date -->
		<div class="hidden xl:flex flex-col text-right pr-2 border-r border-base-300">
			<span class="font-mono text-xs font-bold text-primary tracking-wider">{currentTime}</span>
			<span class="text-[10px] opacity-70 font-medium">{currentDate}</span>
		</div>

		<!-- BMKG Status Badge -->
		<div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">
			<span class="relative flex h-2 w-2">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
			</span>
			<span>BMKG Sync: Aktif</span>
		</div>

		<!-- Notifications Dropdown -->
		<div class="dropdown dropdown-end">
			<button tabindex="0" class="btn btn-ghost btn-circle btn-sm relative" aria-label="Notifications">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>
				<span class="badge badge-warning badge-xs absolute top-1 right-1">3</span>
			</button>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div tabindex="0" role="region" aria-label="Notifications Panel" class="dropdown-content z-50 card card-compact w-72 sm:w-80 p-2 shadow-xl bg-base-100 border border-base-200 mt-2">
				<div class="card-body">
					<div class="flex items-center justify-between border-b border-base-200 pb-2">
						<span class="font-bold text-sm">Pemberitahuan Peringatan</span>
						<span class="badge badge-warning badge-sm">3 Baru</span>
					</div>
					<div class="space-y-2 py-1 text-xs">
						<div class="p-2 rounded-lg bg-warning/10 border-l-4 border-warning flex flex-col gap-1">
							<span class="font-bold text-warning">Peringatan Dini Cuaca BMKG</span>
							<span class="opacity-80">Hujan lebat disertai angin di Palembang & Ogan Komering.</span>
							<span class="text-[10px] opacity-60">10 menit yang lalu</span>
						</div>
						<div class="p-2 rounded-lg bg-info/10 border-l-4 border-info flex flex-col gap-1">
							<span class="font-bold text-info">Update Pos TMA Sungai Musi</span>
							<span class="opacity-80">Status Tinggi Muka Air: Normal (1.85 m).</span>
							<span class="text-[10px] opacity-60">30 menit yang lalu</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Theme Controller Dropdown -->
		<div class="dropdown dropdown-end">
			<button tabindex="0" class="btn btn-ghost btn-circle btn-sm" aria-label="Change Theme">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
				</svg>
			</button>
			<ul tabindex="0" role="menu" class="dropdown-content z-50 menu p-2 shadow-xl bg-base-100 rounded-box w-52 border border-base-200 mt-2">
				<li class="menu-title text-xs">Pilih Tema UI</li>
				{#each themes as theme (theme.name)}
					<li>
						<button
							type="button"
							class="flex justify-between items-center text-xs py-2 {activeTheme === theme.value ? 'active font-bold' : ''}"
							onclick={() => changeTheme(theme.value)}
						>
							<span>{theme.name}</span>
							{#if activeTheme === theme.value}
								<span class="text-primary font-bold">✓</span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</header>
