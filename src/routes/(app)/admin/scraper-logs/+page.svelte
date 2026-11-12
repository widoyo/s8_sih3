<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let { data }: { data: PageData } = $props();

  let selectedError = $state<string | null>(null);
  let errorModalRef = $state<HTMLDialogElement | null>(null);

  function filterBySource(event: Event) {
    const target = event.target as HTMLSelectElement;
    const url = new URL($page.url);
    if (target.value) {
      url.searchParams.set('source', target.value);
    } else {
      url.searchParams.delete('source');
    }
    url.searchParams.set('page', '1');
    goto(url.toString());
  }

  function changePage(newPage: number) {
    const url = new URL($page.url);
    url.searchParams.set('page', newPage.toString());
    goto(url.toString());
  }

  function openErrorModal(msg: string) {
    selectedError = msg;
    errorModalRef?.showModal();
  }

  function formatDate(isoStr: string) {
    try {
      return new Date(isoStr).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      });
    } catch {
      return isoStr;
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-base-300 pb-4">
    <div>
      <h1 class="text-2xl font-bold">Riwayat Log Scraper</h1>
      <p class="text-sm text-base-content/60">
        Pemantauan eksekusi otomatis scraper dan status sinkronisasi data
      </p>
    </div>

    <!-- Filter Source Dropdown -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold">Sumber:</span>
      <select
        class="select select-bordered select-sm w-full max-w-xs"
        value={data.selectedSource}
        onchange={filterBySource}
      >
        <option value="">Semua Sumber</option>
        {#each data.sources as s(s)}
          <option value={s}>{s}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Cards Statistik Ringkas -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div class="stat bg-base-100 rounded-lg border border-base-300 shadow-sm">
      <div class="stat-title text-xs font-medium">Total Eksekusi Log</div>
      <div class="stat-value text-2xl">{data.pagination.totalItems}</div>
      <div class="stat-desc">Tercatat dalam sistem</div>
    </div>
    <div class="stat bg-base-100 rounded-lg border border-base-300 shadow-sm">
      <div class="stat-title text-xs font-medium text-success">Eksekusi Sukses</div>
      <div class="stat-value text-2xl text-success">{data.stats.totalSuccess}</div>
      <div class="stat-desc">Berhasil mengambil data</div>
    </div>
    <div class="stat bg-base-100 rounded-lg border border-base-300 shadow-sm">
      <div class="stat-title text-xs font-medium text-error">Eksekusi Gagal</div>
      <div class="stat-value text-2xl text-error">{data.stats.totalFailed}</div>
      <div class="stat-desc">Mengalami kendala / error</div>
    </div>
  </div>

  <!-- Tabel Riwayat Log -->
  <div class="overflow-x-auto rounded-lg border border-base-300 bg-base-100 shadow-sm">
    <table class="table w-full table-sm">
      <thead>
        <tr class="bg-base-200/50 text-xs">
          <th>ID</th>
          <th>Waktu Eksekusi</th>
          <th>Sumber (Source)</th>
          <th>Status</th>
          <th>Jumlah Item</th>
          <th>Detail Error</th>
        </tr>
      </thead>
      <tbody>
        {#each data.logs as item (item.id)}
          <tr class="hover text-xs">
            <td class="font-mono font-semibold">#{item.id}</td>
            <td class="whitespace-nowrap">{item.executedAt}</td>
            <td>
              <span class="badge badge-ghost badge-sm font-semibold">
                {item.source}
              </span>
            </td>
            <td>
              {#if item.status === 'SUCCESS'}
                <span class="badge badge-success badge-sm font-bold gap-1 text-white">
                  ✓ SUCCESS
                </span>
              {:else}
                <span class="badge badge-error badge-sm font-bold gap-1 text-white">
                  ✕ FAILED
                </span>
              {/if}
            </td>
            <td class="font-mono font-bold">
              {item.itemsScraped} item
            </td>
            <td class="max-w-xs truncate">
              {#if item.errorMessage}
                <button
                  type="button"
                  class="btn btn-ghost btn-xs text-error underline font-normal truncate max-w-full justify-start"
                  onclick={() => openErrorModal(item.errorMessage || '')}
                >
                  {item.errorMessage}
                </button>
              {:else}
                <span class="text-base-content/40">-</span>
              {/if}
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="6" class="py-8 text-center text-sm text-base-content/60">
              Belum ada riwayat log scraper yang tercatat.
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Pagination Controls -->
  {#if data.pagination.totalPages > 1}
    <div class="flex justify-between items-center pt-2">
      <span class="text-xs text-base-content/60">
        Halaman {data.pagination.currentPage} dari {data.pagination.totalPages}
      </span>
      <div class="join">
        <button
          class="join-item btn btn-xs"
          disabled={data.pagination.currentPage <= 1}
          onclick={() => changePage(data.pagination.currentPage - 1)}
        >
          « Prev
        </button>
        <button class="join-item btn btn-xs btn-active">
          {data.pagination.currentPage}
        </button>
        <button
          class="join-item btn btn-xs"
          disabled={data.pagination.currentPage >= data.pagination.totalPages}
          onclick={() => changePage(data.pagination.currentPage + 1)}
        >
          Next »
        </button>
      </div>
    </div>
  {/if}
</div>

<!-- Modal Pop-up Pesan Error -->
<dialog bind:this={errorModalRef} class="modal">
  <div class="modal-box max-w-lg">
    <h3 class="font-bold text-base text-error mb-2">Detail Error Scraper</h3>
    <div class="p-3 bg-base-200 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-60">
      {selectedError}
    </div>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn btn-sm">Tutup</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>