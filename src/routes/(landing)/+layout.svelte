<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { House, Wind, Waves, Droplets, Menu, X, Info, Building2, Contact } from '@lucide/svelte';

	let { children } = $props();

	let mobileMenuOpen = $state(false);

	onMount(() => {
		document.documentElement.setAttribute('data-theme', 'light');
	});

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<!-- Sticky Navigation dengan Shadow di Bagian Bawah -->
<nav class="sticky top-0 z-50 w-full bg-base-100/90 shadow-md backdrop-blur-md transition-shadow">
	<div class="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
		<!-- Desktop Navigation Menu (Rata Tengah) -->
		<div class="hidden w-full items-center justify-center space-x-2 text-base font-normal md:flex">
			<!-- Home Icon -->
			<a
				href={resolve('/#top')}
				data-sveltekit-reload
				class="btn gap-2 btn-ghost text-base font-normal btn-sm"
			>
				<House class="size-4 text-primary" />
				<span>Home</span>
			</a>

			<!-- Hidrometeorologi (Icon Angin) -->
			<a
				href={resolve('/#hidrometeorologi')}
				class="btn gap-2 btn-ghost text-base font-normal btn-sm"
			>
				<Wind class="size-4 text-info" />
				<span>Hidrometeorologi</span>
			</a>

			<!-- Hidrologi (Icon Hujan / Waves) -->
			<a
				href={resolve('/#hidrologi')}
				class="btn gap-2 btn-ghost text-base font-normal btn-sm"
			>
				<Waves class="size-4 text-cyan-500" />
				<span>Hidrologi</span>
			</a>

			<!-- Hidrogeologi (Icon Air Tanah / Droplets) -->
			<a
				href={resolve('/#hidrogeologi')}
				class="btn gap-2 btn-ghost text-base font-normal btn-sm"
			>
				<Droplets class="size-4 text-blue-600" />
				<span>Hidrogeologi</span>
			</a>

			<!-- About page, dropdown  -->
			<div class="dropdown dropdown-hover">
				<button type="button" class="btn gap-2 btn-ghost text-base font-normal btn-sm">
					<Info class="size-4 text-primary" />
					<span>Tentang</span>
				</button>
				<ul class="menu dropdown-content z-[1] w-56 rounded-box bg-base-100 p-2 text-base shadow">
					<li class="border-b border-base-300 pb-1">
						<a href={resolve('/about')} class="gap-3 py-3">
							<Info class="size-4 text-primary" />
							<span>Kami</span>
						</a>
					</li>
					<li class="border-b border-base-300 py-1">
						<a href={resolve('/about/lembaga')} class="gap-3 py-3">
							<Building2 class="size-4 text-info" />
							<span>Lembaga Pengelola</span>
						</a>
					</li>
					<li class="pt-1">
						<a href={resolve('/about/sekretariat')} class="gap-3 py-3">
							<Contact class="size-4 text-success" />
							<span>Sekretariat</span>
						</a>
					</li>
				</ul>
			</div>
		</div>

		<!-- Mobile Burger Menu Button -->
		<div class="flex w-full items-center justify-between md:hidden">
			<span class="text-base font-bold text-base-content">SIH3 MSBL</span>
			<button
				type="button"
				onclick={toggleMobileMenu}
				class="btn btn-square btn-ghost btn-sm"
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
		<div class="space-y-2 border-t border-base-200 bg-base-100 px-4 py-3 md:hidden">
			<a
				href={resolve('/#top')}
				data-sveltekit-reload
				onclick={closeMobileMenu}
				class="flex items-center gap-3 rounded-lg px-3 py-2 text-base hover:bg-base-200"
			>
				<House class="size-5 text-primary" />
				<span>Home</span>
			</a>

			<a
				href={resolve('/#hidrometeorologi')}
				onclick={closeMobileMenu}
				class="flex items-center gap-3 rounded-lg px-3 py-2 text-base hover:bg-base-200"
			>
				<Wind class="size-5 text-info" />
				<span>Hidrometeorologi</span>
			</a>

			<a
				href={resolve('/#hidrologi')}
				onclick={closeMobileMenu}
				class="flex items-center gap-3 rounded-lg px-3 py-2 text-base hover:bg-base-200"
			>
				<Waves class="size-5 text-cyan-500" />
				<span>Hidrologi</span>
			</a>

			<a
				href={resolve('/#hidrogeologi')}
				onclick={closeMobileMenu}
				class="flex items-center gap-3 rounded-lg px-3 py-2 text-base hover:bg-base-200"
			>
				<Droplets class="size-5 text-blue-600" />
				<span>Hidrogeologi</span>
			</a>

			<div class="border-t border-base-200 pt-2">
				<p class="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-base-content/70">
					<Info class="size-5 text-primary" />
					Tentang
				</p>
				<a
					href={resolve('/about')}
					onclick={closeMobileMenu}
					class="flex items-center gap-3 rounded-lg px-6 py-2 text-base hover:bg-base-200"
				>
					<Info class="size-5 text-primary" />
					<span>Kami</span>
				</a>
				<a
					href={resolve('/about/lembaga')}
					onclick={closeMobileMenu}
					class="flex items-center gap-3 rounded-lg px-6 py-2 text-base hover:bg-base-200"
				>
					<Building2 class="size-5 text-info" />
					<span>Lembaga Pengelola</span>
				</a>
				<a
					href={resolve('/about/sekretariat')}
					onclick={closeMobileMenu}
					class="flex items-center gap-3 rounded-lg px-6 py-2 text-base hover:bg-base-200"
				>
					<Contact class="size-5 text-success" />
					<span>Nara Hubung</span>
				</a>
			</div>
		</div>
	{/if}
</nav>
<main class="mx-auto w-full max-w-screen-xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
	{@render children()}
</main>
