<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	// State for mobile drawer sidebar
	let isSidebarOpen = $state(false);
	let activeTheme = $state('emerald');

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	function closeSidebar() {
		isSidebarOpen = false;
	}
</script>

<svelte:head>
	<title>SIH3 WS MSBL - BBWS Sumatera VIII | Hidrometeorologi, Hidrologi, Hidrogeologi</title>
	<meta name="description" content="Portal SIH3 WS MSBL - Sistem Informasi Hidro Meteorologi, Hidrologi, dan HidroGeologi Wilayah Sungai Musi Sugihan Banyuasin Lemau" />
</svelte:head>

<div class="min-h-screen bg-base-200/50 text-base-content flex flex-col font-sans antialiased">
	<!-- Navbar Header Sticky -->
	<Navbar onToggleSidebar={toggleSidebar} bind:activeTheme />

	<!-- Main Layout Body with Sidebar Drawer -->
	<div class="flex-1 flex overflow-hidden relative">
		<!-- Desktop Aside Sidebar (Visible on LG screens) -->
		<div class="hidden lg:block z-20">
			<Sidebar currentPath={page.url.pathname} />
		</div>

		<!-- Mobile Overlay Drawer (Visible on Mobile/Tablet when toggled) -->
		{#if isSidebarOpen}
			<div class="fixed inset-0 z-50 lg:hidden flex">
				<!-- Backdrop Blur -->
				<button
					type="button"
					class="fixed inset-0 bg-neutral/60 backdrop-blur-xs transition-opacity"
					onclick={closeSidebar}
					aria-label="Close Sidebar"
				></button>

				<!-- Mobile Sidebar Drawer Content -->
				<div class="relative z-10 w-72 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
					<Sidebar currentPath={page.url.pathname} onCloseSidebar={closeSidebar} />
				</div>
			</div>
		{/if}

		<!-- Main Content Slot Container -->
		<main class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
			{@render children()}
		</main>
	</div>
</div>
