<script lang="ts">
  import { House, Wind, Waves, Droplets, Menu, X } from '@lucide/svelte';

  // Terima data dari +page.server.ts
  let { data } = $props();

  // Ambil prakiraanData dari props
  const prakiraanData = $derived(data.prakiraanData);

  // Format tanggal update agar lebih mudah dibaca
  const lastUpdated = $derived(
    prakiraanData?.updated_at
      ? new Date(prakiraanData.updated_at).toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '-'
  );

  let mobileMenuOpen = $state(false);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>
<svelte:head>
  <title>SIH3 MSBL</title>
</svelte:head>
<!-- Sticky Navigation dengan Shadow di Bagian Bawah -->
<nav class="bg-base-100/90 backdrop-blur-md sticky top-0 z-50 w-full shadow-md transition-shadow">
  <div class="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    
    <!-- Desktop Navigation Menu (Rata Tengah) -->
    <div class="hidden md:flex items-center justify-center space-x-2 w-full text-base font-normal">
      <!-- Home Icon -->
      <a href="#top" class="btn btn-ghost btn-sm text-base gap-2 font-normal">
        <House class="size-4 text-primary" />
        <span>Home</span>
      </a>

      <!-- Hidrometeorologi (Icon Angin) -->
      <a href="#hidrometeorologi" class="btn btn-ghost btn-sm text-base gap-2 font-normal">
        <Wind class="size-4 text-info" />
        <span>Hidrometeorologi</span>
      </a>

      <!-- Hidrologi (Icon Hujan / Waves) -->
      <a href="#hidrologi" class="btn btn-ghost btn-sm text-base gap-2 font-normal">
        <Waves class="size-4 text-cyan-500" />
        <span>Hidrologi</span>
      </a>

      <!-- Hidrogeologi (Icon Air Tanah / Droplets) -->
      <a href="#hidrogeologi" class="btn btn-ghost btn-sm text-base gap-2 font-normal">
        <Droplets class="size-4 text-blue-600" />
        <span>Hidrogeologi</span>
      </a>
    </div>

    <!-- Mobile Burger Menu Button -->
    <div class="md:hidden flex items-center justify-between w-full">
      <span class="font-bold text-base text-base-content">SIH3 MSBL</span>
      <button 
        type="button"
        onclick={toggleMobileMenu}
        class="btn btn-ghost btn-square btn-sm"
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
    <div class="md:hidden border-t border-base-200 bg-base-100 px-4 py-3 space-y-2">
      <a 
        href="#top" 
        onclick={closeMobileMenu}
        class="flex items-center gap-3 px-3 py-2 text-base rounded-lg hover:bg-base-200"
      >
        <House class="size-5 text-primary" />
        <span>Home</span>
      </a>

      <a 
        href="#hidrometeorologi" 
        onclick={closeMobileMenu}
        class="flex items-center gap-3 px-3 py-2 text-base rounded-lg hover:bg-base-200"
      >
        <Wind class="size-5 text-info" />
        <span>Hidrometeorologi</span>
      </a>

      <a 
        href="#hidrologi" 
        onclick={closeMobileMenu}
        class="flex items-center gap-3 px-3 py-2 text-base rounded-lg hover:bg-base-200"
      >
        <Waves class="size-5 text-cyan-500" />
        <span>Hidrologi</span>
      </a>

      <a 
        href="#hidrogeologi" 
        onclick={closeMobileMenu}
        class="flex items-center gap-3 px-3 py-2 text-base rounded-lg hover:bg-base-200"
      >
        <Droplets class="size-5 text-blue-600" />
        <span>Hidrogeologi</span>
      </a>
    </div>
  {/if}
</nav>

<!-- Hero Section (Full Viewport Height) -->
<section id="top" class="hero min-h-screen relative flex items-center justify-center py-12">
  <div class="hero-content drop-shadow-lg text-neutral-content text-center flex-col z-10 w-full max-w-6xl px-4 my-auto">
    
    <!-- Hero Text -->
    <div class="max-w-2xl mb-8 text-base-content text-center">
      <h1 class="mb-4 text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">
        SIH3 MSBL
      </h1>

      <p class="text-base-content/50 text-sm md:text-base leading-relaxed font-medium drop-shadow-md">
        Sistem Informasi Hidro Meteorologi, Hidrologi, & HidroGeologi Wilayah Sungai Musi Sugihan Banyuasin Lemau (WS MSBL)
      </p>

      <div class="mt-6">&nbsp;</div>
    </div>

    <!-- 2 Column Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
      <!-- Card 1: Peringatan Dini Cuaca -->
      <div class="card bg-base-100/30 text-base-content rounded-lg backdrop-blur-md border border-black/10 shadow-xl hover:bg-base-100/50 transition-all">
        <div class="card-body p-2">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2.5 bg-warning/20 text-warning rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="card-title">Peringatan Dini Cuaca</h2>
            <span class="badge badge-accent justify-end">Nihil</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Hujan & Muka Air Sungai -->
      <div class="card bg-base-100/30 text-base-content backdrop-blur-md border border-black/10 rounded-lg shadow-xl hover:bg-base-100/50 transition-all">
        <div class="card-body p-2">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2.5 bg-info/10 text-info rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h2 class="card-title text-base font-bold">Hujan & Muka Air Sungai</h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Berita Kegiatan -->
    <div class="w-full text-base-content max-w-6xl text-left p-5 bg-base-100/90 rounded-lg mt-6">
      <h2 class="drop-shadow-lg text-3xl md:text-4xl font-extrabold mb-4">
        Berita Kegiatan
      </h2>
      
      <ol class="list-decimal list-inside space-y-2 text-sm md:text-base font-medium">
        <li class="leading-relaxed">
          <span class="badge badge-primary font-bold mr-1">BBWSS8</span>
          <span class="text-gray-500 text-xs">16 Sep 2026</span>
          Sinergi Hadirkan Air Bersih Untuk Sekolah Rakyat di Kab. Empat Lawang
        </li>
        <li class="leading-relaxed">
          <span class="badge badge-primary font-bold mr-1">BBWSS8</span>
          <span class="text-gray-500 text-xs">16 Sep 2026</span>
          Respon Cepat BBWSS Sumatera VIII Peninjauan Kekeringan Sawah Kec. Kalidoni
        </li>
        <li class="leading-relaxed">
          <span class="badge badge-info font-bold mr-1">Stat Klim Sumbagsel</span>
          <span class="text-gray-500 text-xs">16 Sep 2026</span>
          BMKG Sumsel Suarakan Pentingnya Menjaga Lapisan Ozon Melalui Dialog Interaktif RRI Palembang
        </li>
        <li class="leading-relaxed">
          <span class="badge badge-info font-bold mr-1">Stat Klim Sumbagsel</span>
          <span class="text-gray-500 text-xs">16 Sep 2026</span>
          Update Kondisi Iklim Terkini Dukung Upaya Penanggulangan Karhutla Sumsel 
        </li>
      </ol>
    </div>
  </div>
</section>

<!-- Section Hidrometeorologi -->
<section id="hidrometeorologi" class="min-h-screen relative flex flex-col items-center justify-center py-16 px-4 bg-base-200/50">
  <div class="w-full max-w-6xl space-y-6">
    
    <!-- Section Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between border-b border-base-300 pb-4 gap-2">
      <div>
        <span class="badge badge-primary font-bold text-xs mb-1">BMKG Sumsel</span>
        <h2 class="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
          Prakiraan Cuaca Kabupaten / Kota
        </h2>
        <p class="text-xs md:text-sm text-base-content/70 mt-1">
          Wilayah Sumatera Selatan & Sekitarnya
        </p>
      </div>

      <!-- Badge Timestamp Update -->
      <div class="text-xs text-base-content/60 self-start md:self-auto bg-base-100 px-3 py-1.5 rounded-lg border border-base-300 shadow-xs">
        Diperbarui: <span class="font-mono font-semibold text-primary">{lastUpdated} WIB</span>
      </div>
    </div>

    <!-- Grid Card Prakiraan Cuaca -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#if prakiraanData?.items && prakiraanData.items.length > 0}
        {#each prakiraanData.items as item (item.lokasi)}
          <div class="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-200">
            <div class="card-body p-4 space-y-3">
              
              <!-- Nama Lokasi & Link Detail -->
              <div class="flex items-center justify-between border-b border-base-200 pb-2">
                <h3 class="font-bold text-base text-base-content truncate" title={item.lokasi}>
                  {item.lokasi}
                </h3>
                {#if item.url_detail && item.url_detail !== '-'}
                  <a 
                    href={item.url_detail} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="btn btn-ghost btn-xs text-primary gap-1"
                    title="Lihat detail di BMKG"
                  >
                    Detail
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                {/if}
              </div>

              <!-- Tampilan 2 Kolom: Hari Ini & Besok -->
              <div class="grid grid-cols-2 gap-2 text-xs divide-x divide-base-200">
                
                <!-- Sub-Card Hari Ini -->
                <div class="space-y-1.5 pr-1">
                  <span class="badge badge-outline badge-xs font-semibold text-[10px]">Hari Ini</span>
                  <div class="flex items-center gap-2 my-1 min-h-[40px]">
                    <div class="shrink-0 size-9 flex items-center justify-center">
                      {@html item.hari_ini.ikon}
                    </div>
                    <span class="font-bold text-xs leading-tight text-base-content/90">
                      {item.hari_ini.kondisi.kondisi}
                    </span>
                  </div>
                  <div class="font-mono text-[11px] space-y-0.5 text-base-content/70">
                    <div class="flex justify-between">
                      <span>Suhu:</span>
                      <span class="font-bold text-base-content">{item.hari_ini.kondisi.suhu}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Lembap:</span>
                      <span>{item.hari_ini.kondisi.kelembapan}</span>
                    </div>
                  </div>
                </div>

                <!-- Sub-Card Besok -->
                <div class="space-y-1.5 pl-3">
                  <span class="badge badge-ghost badge-xs font-semibold text-[10px]">Besok</span>
                  <div class="flex items-center gap-2 my-1 min-h-[40px]">
                    <div class="shrink-0 size-9 flex items-center justify-center">
                      {@html item.besok.ikon}
                    </div>
                    <span class="font-bold text-xs leading-tight text-base-content/90">
                      {item.besok.kondisi.kondisi}
                    </span>
                  </div>
                  <div class="font-mono text-[11px] space-y-0.5 text-base-content/70">
                    <div class="flex justify-between">
                      <span>Suhu:</span>
                      <span class="font-bold text-base-content">{item.besok.kondisi.suhu}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Lembap:</span>
                      <span>{item.besok.kondisi.kelembapan}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        {/each}
      {:else}
        <div class="col-span-full alert alert-warning text-xs">
          Data prakiraan cuaca belum tersedia.
        </div>
      {/if}
    </div>

  </div>
</section>

<section id="hidrologi" class="hero min-h-screen relative flex items-center justify-center py-12">
  <h1>Hidrologi</h1>
</section>

<section id="hidrogeologi" class="hero min-h-screen relative flex items-center justify-center py-12">
  <h1>Hidrogeologi</h1>
</section>