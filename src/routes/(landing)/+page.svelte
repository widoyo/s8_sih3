<script lang="ts">
import { resolve } from '$app/paths';
</script>

<!-- Hero Section (Full Viewport Height) -->
<div
  class="hero min-h-screen relative flex items-center justify-center py-12"
  style="background-image: url(ampera_dark.webp);"
>
  <!-- Background Overlay -->

  <!-- Hero Content + Cards Container -->
  <div class="hero-content drop-shadow-lg text-neutral-content text-center flex-col z-10 w-full max-w-6xl px-4 my-auto">
    
    <!-- Hero Text -->
    <div class="max-w-2xl mb-8">
      <h1 class="mb-4 text-4xl md:text-5xl font-extrabold tracking-tight">SIH3 MSBL</h1>
      <p class="text-sm md:text-base text-gray-200 leading-relaxed">
        Sistem Informasi Hidro Meteorologi, Hidrologi, & HidroGeologi Wilayah Sungai Musi Sugihan Banyuasin Lemau (WS MSBL)
      </p>
      <div class="mt-6">
        &nbsp;
      </div>
    </div>

    <!-- 3 Column Cards (Inside Overlay) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
      
      <!-- Card 1: Peringatan Dini Cuaca -->
      <div class="card bg-base-100/30 text-base-content backdrop-blur-md border border-white/70 shadow-xl hover:bg-base-100/50 transition-all">
        <div class="card-body p-2">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2.5 bg-warning/20 text-warning rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="card-title">Peringatan Dini Cuaca</h2>
            <a href="{resolve("/hidrometeorologi/cuaca")}">-></a>
          </div>
        </div>
      </div>

      <!-- Card 2: Hujan & Muka Air Sungai -->
      <div class="card bg-base-100/30 text-base-content backdrop-blur-md border border-white/70 shadow-xl hover:bg-base-100/50 transition-all">
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
<div class="w-full  text-base-content max-w-6xl text-left p-5 bg-base-100/90 rounded-lg">
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
    <li class="leading-relaxed">
      <span class="badge badge-info font-bold mr-1">Stat Klim Sumbagsel</span>
      Respon Cepat BBWSS Sumatera VIII Peninjauan Kekeringan Sawah Kec. Kalidoni
    </li>
  </ol>
</div>
  </div>
</div>