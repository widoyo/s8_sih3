<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<article class="prose max-w-none prose-slate">
	<h1 class="mb-8 text-3xl font-bold md:text-4xl">Tentang SIH3 Wilayah Sungai MSBL</h1>

	<div class="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12">
		<div>
			<p class="m-0 text-lg leading-relaxed md:text-xl md:leading-loose">
				Portal SIH3 Wilayah Sungai Musi-Sugihan-Banyuasin-Lemau (MSBL) menyediakan data akurat
				mengenai Hidrologi, Hidrometeorologi, dan Hidrogeologi. Platform ini hadir untuk mempermudah
				akses informasi bagi masyarakat, sekaligus mendukung pengelolaan sumber daya air serta
				mitigasi risiko bencana secara efektif.
			</p>
			<nav
				class="mt-4 flex items-center gap-3 font-semibold whitespace-nowrap"
				aria-label="Informasi tentang SIH3 MSBL"
			>
				<a href={resolve('/about/lembaga')} class="link link-primary">Lembaga Pengelola</a>
				<span aria-hidden="true">|</span>
				<a href={resolve('/about/sekretariat')} class="link link-primary">Sekretariat</a>
			</nav>
		</div>
		<div class="flex justify-center">
			<img
				src="/img/sih3_msbl.svg"
				alt="SIH3 MSBL"
				class="my-0 h-auto w-3/4 max-w-xs md:max-w-sm"
			/>
		</div>
	</div>
</article>
