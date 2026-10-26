<script lang="ts">
	import { MapPin, Phone } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Sekretariat | SIH3 MSBL</title>
</svelte:head>

<section class="space-y-6 py-6">
	<header class="border-b border-base-300 pb-4">
		<span class="mb-2 badge badge-primary">Tentang SIH3 MSBL</span>
		<h1 class="text-3xl font-extrabold tracking-tight text-base-content">Sekretariat Pengelola</h1>
		<p class="mt-2 text-base-content/70">
			Hubungi sekretariat pengelola Sistem Informasi Hidro Meteorologi, Hidrologi, dan Hidrogeologi
			WS MSBL.
		</p>
	</header>

	<div class="grid gap-5 md:grid-cols-[minmax(0,1.3fr)_minmax(18rem,1fr)]">
		<article class="card overflow-hidden border border-primary/20 bg-base-100 shadow-sm">
			<div class="h-2 bg-primary"></div>
			<div class="card-body justify-center gap-5 p-6 md:p-8">
				<div
					class="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
				>
					<Phone class="size-7" aria-hidden="true" />
				</div>
				<div>
					<p class="text-sm font-semibold tracking-wide text-primary uppercase">
						Sekretariat Pengelola SIH3 WS MSBL
					</p>
					<h2 class="mt-2 text-2xl font-bold text-base-content">Sekretariat</h2>
					<p class="mt-2 max-w-xl leading-relaxed text-base-content/70">
						Untuk informasi terkait pengelolaan SIH3 WS MSBL, silakan hubungi sekretariat melalui
						nomor telepon berikut.
					</p>
				</div>
				<a
					href="tel:+62711352222"
					class="btn w-fit gap-2 btn-primary"
					aria-label="Telepon sekretariat di (0711) 352 222"
				>
					<Phone class="size-4" aria-hidden="true" />
					(0711) 352 222
				</a>
			</div>
		</article>

		<article class="card border border-base-300 bg-base-100 shadow-sm">
			<div class="card-body gap-5 p-6">
				<h2 class="card-title text-lg">Informasi Sekretariat</h2>
				<div class="flex gap-4 border-t border-base-200 pt-5">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info"
					>
						<MapPin class="size-5" aria-hidden="true" />
					</div>
					<div class="space-y-1">
						<h3 class="font-semibold">Alamat</h3>
						<address class="text-sm leading-relaxed text-base-content/70 not-italic">
							Jl. Kol. H. Burlian No. 1, Bukit Sangkal, Kec. Ilir Barat I, Kota Palembang, Sumatera
							Selatan 30129
						</address>
					</div>
				</div>
				<div class="flex gap-4 border-t border-base-200 pt-5">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
					>
						<Phone class="size-5" aria-hidden="true" />
					</div>
					<div class="space-y-1">
						<h3 class="font-semibold">Telepon</h3>
						<a href="tel:+62711352222" class="link text-sm text-base-content/70 link-hover">
							(0711) 352 222
						</a>
					</div>
				</div>
			</div>
		</article>
	</div>
</section>
