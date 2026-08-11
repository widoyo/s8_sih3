<script lang="ts">
	import { resolve } from '$app/paths';
	interface Props {
		currentPath?: string;
		onCloseSidebar?: () => void;
	}

	let { currentPath = '/', onCloseSidebar }: Props = $props();

	function isActive(path: string) {
		if (path === '/') return currentPath === '/';
		return currentPath.startsWith(path);
	}
</script>

<aside class="w-72 h-full bg-base-100/95 backdrop-blur-md border-r border-base-200 flex flex-col justify-between select-none shadow-lg">
	<!-- Top Navigation Menu Section -->
	<div class="overflow-y-auto flex-1 p-3 space-y-4">
		<!-- Main Navigation Header Label -->
		<div class="px-3 py-1 flex items-center justify-between">
			<span class="text-[11px] font-extrabold uppercase tracking-wider text-base-content/50">
				Navigasi Utama
			</span>
			
		</div>

		<ul class="menu menu-sm w-full p-0 space-y-1">
			<!-- Dashboard Overview -->
			<li>
				<a
					href={resolve("/")}
					class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 {isActive('/')
						? 'bg-primary text-primary-content font-bold shadow-md shadow-primary/20'
						: 'hover:bg-base-200/80 text-base-content/80 hover:text-base-content'}"
					onclick={onCloseSidebar}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
					</svg>
					<span>Dashboard Overview</span>
				</a>
			</li>

			<!-- Peta Interaktif GIS -->
			<li>
				<a
					href={resolve("/peta-gis")}
					class="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 {isActive('/peta-gis')
						? 'bg-primary text-primary-content font-bold shadow-md shadow-primary/20'
						: 'hover:bg-base-200/80 text-base-content/80 hover:text-base-content'}"
					onclick={onCloseSidebar}
				>
					<div class="flex items-center gap-3">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
						</svg>
						<span>Peta Interaktif GIS</span>
					</div>
					<span class="badge badge-accent badge-xs font-semibold">GIS</span>
				</a>
			</li>

			<!-- Section Divider -->
			<!-- Kategori 1: Hidrometeorologi (BMKG) -->
			<li>
				<details open>
					<summary class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold hover:bg-base-200/60 text-base-content">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
						</svg>
						<span class="flex-1">Hidrometeorologi</span>
					</summary>
					<ul class="pl-4 mt-1 space-y-0.5 border-l-2 border-base-200 ml-5">
						<li>
							<a href="/hidrometeorologi/cuaca" class="py-2 text-xs {isActive('/hidrometeorologi/cuaca') ? 'active font-semibold' : ''}" onclick={onCloseSidebar}>
								Prakiraan Cuaca
							</a>
						</li>
						<li>
							<a href="/hidrometeorologi/peringatan-dini" class="py-2 text-xs flex justify-between {isActive('/hidrometeorologi/peringatan-dini') ? 'active font-semibold' : ''}" onclick={onCloseSidebar}>
								<span>Peringatan Dini</span>
								<span class="badge badge-error badge-xs font-mono">1 Active</span>
							</a>
						</li>
						<li>
							<a href="/hidrometeorologi/satelit" class="py-2 text-xs {isActive('/hidrometeorologi/satelit') ? 'active font-semibold' : ''}" onclick={onCloseSidebar}>
								Citra Satelit & Radar
							</a>
						</li>
						<li>
							<a href="/hidrometeorologi/gempa" class="py-2 text-xs {isActive('/hidrometeorologi/gempa') ? 'active font-semibold' : ''}" onclick={onCloseSidebar}>
								Gempa Bumi & Tsunami
							</a>
						</li>
					</ul>
				</details>
			</li>

			<!-- Kategori 2: Hidrologi (API PUPR/BWS) -->
			<li>
				<details open>
					<summary class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold hover:bg-base-200/60 text-base-content">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
						<span class="flex-1">Hidrologi</span>
					</summary>
					<ul class="pl-4 mt-1 space-y-0.5 border-l-2 border-base-200 ml-5">
						<li>
							<a href="/hidrologi/tma" class="py-2 text-xs flex justify-between {isActive('/hidrologi/tma') ? 'active font-semibold' : ''}" onclick={onCloseSidebar}>
								<span>Tinggi Muka Air (TMA)</span>
								<span class="badge badge-success badge-xs font-mono">Realtime</span>
							</a>
						</li>
						<li>
							<a href="/hidrologi/curah-hujan" class="py-2 text-xs {isActive('/hidrologi/curah-hujan') ? 'active font-semibold' : ''}" onclick={onCloseSidebar}>
								Pos Curah Hujan (CH)
							</a>
						</li>
						<li>
							<a href="/hidrologi/bendungan" class="py-2 text-xs {isActive('/hidrologi/bendungan') ? 'active font-semibold' : ''}" onclick={onCloseSidebar}>
								Status Bendungan & Waduk
							</a>
						</li>
					</ul>
				</details>
			</li>

			<!-- Kategori 3: Hidrogeologi (ESDM/CAT) -->
			<li>
				<details open>
					<summary class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold hover:bg-base-200/60 text-base-content">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
						</svg>
						<span class="flex-1">Hidrogeologi</span>
					</summary>
					<ul class="pl-4 mt-1 space-y-0.5 border-l-2 border-base-200 ml-5">
						<li>
							<a href="/hidrogeologi/cat" class="py-2 text-xs {isActive('/hidrogeologi/cat') ? 'active font-semibold' : ''}" onclick={onCloseSidebar}>
								Cekungan Air Tanah (CAT)
							</a>
						</li>
						<li>
							<a href="/hidrogeologi/sumur-pantau" class="py-2 text-xs {isActive('/hidrogeologi/sumur-pantau') ? 'active font-semibold' : ''}" onclick={onCloseSidebar}>
								Sumur Pantau Air Tanah
							</a>
						</li>
					</ul>
				</details>
			</li>

			<!-- Section Divider: System & Scraper -->
			<li class="pt-2 pb-1">
				<span class="text-[10px] font-bold uppercase tracking-widest text-base-content/40 px-3">
					Pengaturan & Data Sync
				</span>
			</li>

			<li>
				<a href="/settings/scraper" class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-base-200/80 {isActive('/settings/scraper') ? 'active font-semibold' : ''}" onclick={onCloseSidebar}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<span>BMKG Scraper & API Sync</span>
				</a>
			</li>
		</ul>
	</div>

	<!-- Bottom Agency Info Footer -->
	<div class="p-3 border-t border-base-200 bg-base-200/40">
		<div class="p-2.5 rounded-xl bg-base-100 border border-base-200/80 shadow-xs flex items-center gap-3">
			<div class="w-8 h-8 rounded-lg bg-[#002D62] text-[#FFCC00] flex items-center justify-center font-black text-xs shadow-sm">
				PU
			</div>
			<div class="flex flex-col overflow-hidden">
				<span class="text-xs font-bold truncate">BBWS Sumatera VIII</span>
				<span class="text-[10px] font-semibold text-primary truncate">WS MSBL (Sumsel & Bengkulu)</span>
			</div>
		</div>
	</div>
</aside>
