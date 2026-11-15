<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { 
		House, Wind, Waves, Droplets, Menu, X, Building2, KeyRound, 
		Boxes, Info, Map, Contact, Megaphone 
	} from '@lucide/svelte';

	let { children, data } = $props();

	let mobileMenuOpen = $state(false);
	let hasScrolled = $state(false);
	const isHomePage = $derived(page.url.pathname === resolve('/'));
	const isMangoNav = $derived(isHomePage && !hasScrolled);
	const homeNavScrollThreshold = 80;

	// Cek apakah ada peringatan aktif untuk mengubah warna & style
	const hasWarning = $derived(!!data?.peringatanCuacaAktif);

	onMount(() => {
		document.documentElement.setAttribute('data-theme', 'light');
	});

	function updateNavigationBackground() {
		hasScrolled = isHomePage && window.scrollY > homeNavScrollThreshold;
	}

	$effect(() => {
		hasScrolled = isHomePage && window.scrollY > homeNavScrollThreshold;
	});

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<svelte:window onscroll={updateNavigationBackground} />

<!-- Sticky Navigation -->
<nav
	class={`sticky top-0 z-50 w-full shadow-md backdrop-blur-md transition-colors ${
		isHomePage ? (isMangoNav ? 'bg-[#F7A800]' : 'bg-white') : 'bg-base-100/90'
	}`}
>
	<div class="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
		
		<!-- Desktop Navigation Menu -->
		<div class="hidden w-full items-center md:flex">
			
			<!-- 1. MENU UTAMA (Rata Tengah) -->
			<div class="flex flex-1 items-center justify-center space-x-2 text-base font-normal">
				<a href={resolve('/#top')} data-sveltekit-reload class={`btn gap-2 btn-ghost text-base font-normal btn-sm hover:bg-transparent ${isMangoNav ? 'text-white' : ''}`}>
					<House class="size-4 text-primary" />
					<span>Home</span>
				</a>

				<a href={resolve('/#hidrologi')} class={`btn gap-2 btn-ghost text-base font-normal btn-sm hover:bg-transparent ${isMangoNav ? 'text-white' : ''}`}>
					<Waves class="size-4 text-cyan-500" />
					<span>Hidrologi</span>
				</a>

				<a href={resolve('/#hidrometeorologi')} class={`btn gap-2 btn-ghost text-base font-normal btn-sm hover:bg-transparent ${isMangoNav ? 'text-white' : ''}`}>
					<Wind class="size-4 text-info" />
					<span>Hidrometeorologi</span>
				</a>

				<a href={resolve('/#hidrogeologi')} class={`btn gap-2 btn-ghost text-base font-normal btn-sm hover:bg-transparent ${isMangoNav ? 'text-white' : ''}`}>
					<Droplets class="size-4 text-blue-600" />
					<span>Hidrogeologi</span>
				</a>

				<div class="dropdown dropdown-hover">
					<button type="button" class={`btn gap-2 btn-ghost text-base font-normal btn-sm hover:bg-transparent ${isMangoNav ? 'text-white' : ''}`}>
						<Info class="size-4 text-primary" />
						<span>Tentang</span>
					</button>
					<ul class="menu dropdown-content z-[1] w-56 rounded-box bg-base-100 p-2 text-base shadow">
						<li class="border-b border-base-300 pb-1">
							<a href={resolve('/about')} class="gap-3 py-3 hover:bg-transparent">
								<Boxes class="size-4 text-primary" />
								<span>Portal SIH3 MSBL</span>
							</a>
						</li>
						<li class="border-b border-base-300 py-1">
							<a href={resolve('/about/lembaga')} class="gap-3 py-3 hover:bg-transparent">
								<Building2 class="size-4 text-info" />
								<span>Lembaga Pengelola</span>
							</a>
						</li>
						<li class="pt-1">
							<a href={resolve('/about/sekretariat')} class="gap-3 py-3 hover:bg-transparent">
								<Contact class="size-4 text-success" />
								<span>Sekretariat</span>
							</a>
						</li>
					</ul>
				</div>
			</div>

			<!-- 2. EWS (Paling Kanan) - Warna Dinamis -->
			<div class="dropdown dropdown-hover dropdown-bottom dropdown-end">
				<button 
					tabindex="0" 
					class={`btn gap-2 btn-ghost text-base font-normal btn-sm hover:bg-transparent transition-colors ${
						hasWarning 
							? 'text-red-600 animate-pulse' 
							: (isMangoNav ? 'text-white' : 'text-base-content')
					}`}
				>
					<Megaphone class={`size-4 ${hasWarning ? 'text-red-600' : (isMangoNav ? 'text-white' : 'text-primary')}`} />
					<span class="font-semibold">EWS</span>
					
					<!-- Badge indikator kecil hanya muncul saat ada peringatan -->
					{#if hasWarning}
						<span class="badge badge-xs badge-error text-white border-0">!</span>
					{/if}
				</button>
				
				<!-- Dropdown Content -->
				<div tabindex="0" class="dropdown-content z-[1] mt-3 w-80 sm:w-[28rem] rounded-box bg-base-100 p-4 shadow-xl border border-base-200">
					{#if hasWarning}
						<!-- Tampilan saat ADA Peringatan (Tema Merah) -->
						<div class="flex items-start gap-3">
							<Megaphone class="size-5 text-red-600 mt-1 flex-shrink-0" />
							<div class="w-full">
								<h3 class="font-bold text-red-700 text-sm mb-1 flex items-center gap-2">
									Peringatan Dini Aktif
									<span class="badge badge-sm badge-error text-white">BARU</span>
								</h3>
								<p class="text-xs text-base-content whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
									{data.peringatanCuacaAktif.teks}
								</p>
								<p class="text-[10px] text-base-content/60 mt-3 pt-2 border-t border-base-200 text-right">
									Berlaku sejak: {new Date(data.peringatanCuacaAktif.waktuPeringatan).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
								</p>
							</div>
						</div>
					{:else}
						<!-- Tampilan saat AMAN (Tema Netral) -->
						<div class="flex flex-col items-center justify-center gap-2 py-4 text-base-content/70">
							<Megaphone class="size-8 text-gray-300" />
							<span class="text-sm font-medium text-center">Tidak ada peringatan dini cuaca aktif.</span>
							<span class="text-xs text-base-content/50 text-center">Kondisi cuaca terpantau aman.</span>
						</div>
					{/if}
				</div>
			</div>
			
		</div>

		<!-- Mobile Burger Menu Button -->
		<div class="flex w-full items-center justify-between md:hidden">
			<span class={`text-base font-bold ${isMangoNav ? 'text-white' : 'text-base-content'}`}>SIH3 MSBL</span>
			<button
				type="button"
				onclick={toggleMobileMenu}
				class={`btn btn-square btn-ghost btn-sm ${isMangoNav ? 'text-white' : ''}`}
				aria-label="Toggle Menu"
			>
				{#if mobileMenuOpen}
					<X class="size-5" />
				{:else}
					<Menu class="size-5" />
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile Drawer Menu -->
	{#if mobileMenuOpen}
		<div class={`space-y-2 border-t border-base-200 px-4 py-3 transition-colors md:hidden ${isMangoNav ? 'bg-[#F7A800]' : 'bg-base-100'}`}>
			
			<!-- EWS Mobile Block - Warna Dinamis -->
			{#if hasWarning}
				<div class="rounded-lg bg-red-50 border border-red-200 p-3 my-2 animate-pulse">
					<div class="flex items-center gap-2 mb-2">
						<Megaphone class="size-5 text-red-600" />
						<span class="font-bold text-red-700 text-sm">PERINGATAN DINI AKTIF</span>
						<span class="badge badge-xs badge-error text-white">!</span>
					</div>
					<p class="text-xs text-base-content whitespace-pre-wrap leading-relaxed mb-2 max-h-40 overflow-y-auto custom-scrollbar">
						{data.peringatanCuacaAktif.teks}
					</p>
					<p class="text-[10px] text-base-content/60 text-right">
						{new Date(data.peringatanCuacaAktif.waktuPeringatan).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
					</p>
				</div>
			{:else}
				<div class="flex items-center gap-3 rounded-lg px-3 py-2 text-base text-base-content/70 my-2">
					<Megaphone class="size-5 text-gray-400" />
					<span>Tidak ada peringatan aktif</span>
				</div>
			{/if}

			<a href={resolve('/#top')} data-sveltekit-reload onclick={closeMobileMenu} class={`flex items-center gap-3 rounded-lg px-3 py-2 text-base hover:bg-transparent ${isMangoNav ? 'text-white' : ''}`}>
				<House class="size-5 text-primary" />
				<span>Home</span>
			</a>

			<a href={resolve('/#hidrologi')} onclick={closeMobileMenu} class={`flex items-center gap-3 rounded-lg px-3 py-2 text-base hover:bg-transparent ${isMangoNav ? 'text-white' : ''}`}>
				<Waves class="size-5 text-cyan-500" />
				<span>Hidrologi</span>
			</a>

			<a href={resolve('/#hidrometeorologi')} onclick={closeMobileMenu} class={`flex items-center gap-3 rounded-lg px-3 py-2 text-base hover:bg-transparent ${isMangoNav ? 'text-white' : ''}`}>
				<Wind class="size-5 text-info" />
				<span>Hidrometeorologi</span>
			</a>

			<a href={resolve('/#hidrogeologi')} onclick={closeMobileMenu} class={`flex items-center gap-3 rounded-lg px-3 py-2 text-base hover:bg-transparent ${isMangoNav ? 'text-white' : ''}`}>
				<Droplets class="size-5 text-blue-600" />
				<span>Hidrogeologi</span>
			</a>

			<div class="border-t border-base-200 pt-2">
				<p class={`flex items-center gap-3 px-3 py-2 text-sm font-semibold ${isMangoNav ? 'text-white' : 'text-base-content/70'}`}>
					<Info class="size-5 text-primary" />
					Tentang
				</p>
				<a href={resolve('/about')} onclick={closeMobileMenu} class={`flex items-center gap-3 rounded-lg px-6 py-2 text-base hover:bg-transparent ${isMangoNav ? 'text-white' : ''}`}>
					<Boxes class="size-5 text-primary" />
					<span>Portal SIH3 MSBL</span>
				</a>
				<a href={resolve('/about/lembaga')} onclick={closeMobileMenu} class={`flex items-center gap-3 rounded-lg px-6 py-2 text-base hover:bg-transparent ${isMangoNav ? 'text-white' : ''}`}>
					<Building2 class="size-5 text-info" />
					<span>Lembaga Pengelola</span>
				</a>
				<a href={resolve('/about/sekretariat')} onclick={closeMobileMenu} class={`flex items-center gap-3 rounded-lg px-6 py-2 text-base hover:bg-transparent ${isMangoNav ? 'text-white' : ''}`}>
					<Contact class="size-5 text-success" />
					<span>Sekretariat</span>
				</a>
			</div>
		</div>
	{/if}
</nav>

<main class={`mx-auto w-full flex-1 ${isHomePage ? 'max-w-none px-0 py-0' : 'max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8'}`}>
	{@render children()}
</main>

<footer class="w-full border-t border-base-200 bg-base-200/60 text-base-content">
	<div class="flex w-full flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
		<div class="flex items-center gap-2 text-sm font-medium">
			<Boxes class="size-5 text-primary" />
			<span>SIH3 MSBL &copy; {new Date().getFullYear()} — Sistem Informasi Hidrologi, Hidrometeorologi, dan Hidrogeologi</span>
		</div>
		<div class="flex items-center gap-4 text-sm font-normal text-base-content/70">
			<a href={resolve('/about')} class="hover:text-primary transition-colors">Tentang</a>
			<a href={resolve('/about/sekretariat')} class="hover:text-primary transition-colors">Sekretariat</a>
			<a href={resolve('/peta-gis')} class="hover:text-primary transition-colors">Peta GIS</a>
			<a href={resolve('/admin')} class="hover:text-primary transition-colors"><KeyRound class="size-4" /></a>
		</div>
	</div>
</footer>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: #cbd5e1;
		border-radius: 20px;
	}
</style>