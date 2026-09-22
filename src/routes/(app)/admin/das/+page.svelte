<script lang="ts">
    import type { PageData, ActionData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    type DasItem = typeof data.dasList[number];

    let selectedDas = $state<DasItem | null>(null);
    let modalRef = $state<HTMLDialogElement | null>(null);

    // Form states
    let nama = $state('');
    let kode = $state('');
    let luasKm2 = $state('');
    let geometryStr = $state('');

    let isFormValid = $derived(nama.trim().length >= 2);

    function openModal(item?: DasItem) {
        if (item) {
            selectedDas = item;
            nama = item.nama;
            kode = item.kode || '';
            luasKm2 = item.luasKm2 !== null ? item.luasKm2.toString() : '';
            geometryStr = item.geometry ? JSON.stringify(item.geometry) : '';
        } else {
            selectedDas = null;
            nama = '';
            kode = '';
            luasKm2 = '';
            geometryStr = '';
        }
        modalRef?.showModal();
    }

    function closeModal() {
        modalRef?.close();
    }
</script>

<div class="space-y-4">
    <!-- Header Halaman -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-base-300">
        <div>
            <h1 class="text-xl font-bold">Kelola Daerah Aliran Sungai (DAS)</h1>
            <p class="text-xs text-base-content/60">Daftar wilayah sungai dan pemetaan koordinat batas DAS</p>
        </div>
        <button type="button" class="btn btn-primary btn-xs sm:btn-sm self-start sm:self-auto" onclick={() => openModal()}>
            + Tambah DAS
        </button>
    </div>

    <!-- Alert Umpan Balik -->
    {#if form?.message}
        <div class="alert {form.success ? 'alert-success' : 'alert-error'} text-xs py-2 rounded-lg">
            <span>{form.message}</span>
        </div>
    {/if}

    <!-- Tabel Daftar DAS -->
    <div class="overflow-x-auto bg-base-100 rounded-lg border border-base-300 shadow-sm">
        <table class="table table-sm w-full">
            <thead>
                <tr class="bg-base-200/50">
                    <th class="w-16">ID</th>
                    <th>Kode</th>
                    <th>Nama DAS</th>
                    <th>Luas (Km²)</th>
                    <th>GeoJSON Polygon</th>
                    <th class="text-right w-24">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {#each data.dasList as item(item.id)}
                    <tr class="hover">
                        <td class="font-mono text-xs font-bold opacity-60">#{item.id}</td>
                        <td class="font-mono text-xs">{item.kode || '-'}</td>
                        <td class="font-bold">{item.nama}</td>
                        <td class="text-xs font-mono">
                            {item.luasKm2 ? item.luasKm2.toLocaleString('id-ID') : '-'}
                        </td>
                        <td>
                            {#if item.geometry}
                                <span class="badge badge-xs badge-success gap-1">
                                    {item.geometry.type}
                                </span>
                            {:else}
                                <span class="badge badge-xs badge-ghost opacity-50">Kosong</span>
                            {/if}
                        </td>
                        <td class="text-right">
                            <button 
                                type="button" 
                                class="btn btn-ghost btn-xs text-info"
                                onclick={() => openModal(item)}
                            >
                                Edit
                            </button>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="6" class="text-center py-6 text-xs opacity-60">Belum ada data DAS.</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<!-- Modal Form Tambah / Edit DAS -->
<dialog bind:this={modalRef} class="modal">
    <div class="modal-box max-w-lg">
        <h3 class="font-bold text-base mb-1">
            {selectedDas ? 'Edit Data DAS' : 'Tambah DAS Baru'}
        </h3>
        <p class="text-xs text-base-content/70 mb-4">Informasi wilayah dan struktur geometri DAS</p>

        <form method="POST" action="?/saveDas" onsubmit={() => setTimeout(closeModal, 100)} class="space-y-3">
            {#if selectedDas}
                <input type="hidden" name="id" value={selectedDas.id} />
            {/if}

            <div class="grid grid-cols-3 gap-2">
                <div class="form-control col-span-1">
                    <label class="label p-1" for="kode"><span class="label-text text-xs">Kode DAS</span></label>
                    <input id="kode" name="kode" type="text" class="input input-bordered input-sm" placeholder="DAS-01" bind:value={kode} />
                </div>
                <div class="form-control col-span-2">
                    <label class="label p-1" for="nama"><span class="label-text text-xs">Nama DAS</span></label>
                    <input id="nama" name="nama" type="text" class="input input-bordered input-sm" placeholder="DAS Musi" bind:value={nama} required />
                </div>
            </div>

            <div class="form-control w-full">
                <label class="label p-1" for="luasKm2"><span class="label-text text-xs">Luas Area (Km²)</span></label>
                <input id="luasKm2" name="luasKm2" type="number" class="input input-bordered input-sm" placeholder="59942" bind:value={luasKm2} />
            </div>

            <div class="form-control w-full">
                <label class="label p-1" for="geometry">
                    <span class="label-text text-xs">Data Geometry (GeoJSON String)</span>
                </label>
                <textarea 
                    id="geometry"
                    name="geometry"
                    class="textarea textarea-bordered text-xs font-mono h-28 w-full" 
                    placeholder='&#123;"type":"Polygon","coordinates":...&#125;'
                    bind:value={geometryStr}
                ></textarea>
            </div>

            <div class="modal-action flex justify-end gap-2 pt-2">
                <button type="button" class="btn btn-ghost btn-xs" onclick={closeModal}>Batal</button>
                <button type="submit" class="btn btn-primary btn-xs" disabled={!isFormValid}>
                    Simpan Data DAS
                </button>
            </div>
        </form>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
</dialog>