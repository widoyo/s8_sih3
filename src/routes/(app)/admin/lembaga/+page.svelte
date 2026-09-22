<script lang="ts">
    import type { PageData, ActionData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    // State untuk Modal Edit
    let selectedLembaga = $state<{ id: number; nama: string; deskripsi: string | null } | null>(null);
    let editNama = $state('');
    let editDeskripsi = $state('');

    let isFormValid = $derived(editNama.trim().length >= 2);
    let modalRef = $state<HTMLDialogElement | null>(null);

    function openEditModal(lembaga: { id: number; nama: string; deskripsi: string | null }) {
        selectedLembaga = lembaga;
        editNama = lembaga.nama;
        editDeskripsi = lembaga.deskripsi || '';
        modalRef?.showModal();
    }

    function closeModal() {
        modalRef?.close();
        selectedLembaga = null;
        editNama = '';
        editDeskripsi = '';
    }
</script>

<div class="space-y-4">
    <!-- Header Halaman -->
    <div class="flex items-center justify-between pb-2 border-b border-base-300">
        <div>
            <h1 class="text-xl font-bold">Kelola Lembaga / Instansi</h1>
            <p class="text-xs text-base-content/60">Daftar lembaga pengelola hidrometeorologi & hidrologi</p>
        </div>
    </div>

    <!-- Alert Umpan Balik -->
    {#if form?.message}
        <div class="alert {form.success ? 'alert-success' : 'alert-error'} text-xs py-2 rounded-lg">
            <span>{form.message}</span>
        </div>
    {/if}

    <!-- Tabel Daftar Lembaga -->
    <div class="overflow-x-auto bg-base-100 rounded-lg border border-base-300 shadow-sm">
        <table class="table table-sm w-full">
            <thead>
                <tr class="bg-base-200/50">
                    <th class="w-16">ID</th>
                    <th>Nama Lembaga</th>
                    <th>Deskripsi / Keterangan</th>
                    <th class="text-right w-24">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {#each data.lembagas as l}
                    <tr class="hover">
                        <td class="font-mono text-xs font-bold opacity-60">#{l.id}</td>
                        <td class="font-bold">{l.nama}</td>
                        <td class="text-xs text-base-content/70">{l.deskripsi || '-'}</td>
                        <td class="text-right">
                            <button 
                                type="button" 
                                class="btn btn-ghost btn-xs text-info"
                                onclick={() => openEditModal(l)}
                            >
                                Edit
                            </button>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="4" class="text-center py-6 text-xs opacity-60">Tidak ada data lembaga.</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<!-- Modal Dialog Edit Lembaga -->
<dialog bind:this={modalRef} class="modal">
    <div class="modal-box max-w-md">
        <h3 class="font-bold text-base mb-1">Edit Data Lembaga</h3>
        <p class="text-xs text-base-content/70 mb-4">
            Perbarui nama atau deskripsi lembaga <strong class="text-primary">#{selectedLembaga?.id}</strong>
        </p>

        <form method="POST" action="?/updateLembaga" onsubmit={() => setTimeout(closeModal, 100)}>
            <input type="hidden" name="id" value={selectedLembaga?.id} />
            
            <div class="form-control w-full mb-3">
                <label class="label p-1" for="editNama">
                    <span class="label-text text-xs">Nama Lembaga</span>
                </label>
                <input 
                    id="editNama"
                    name="nama"
                    type="text" 
                    class="input input-bordered input-sm w-full" 
                    placeholder="Masukkan nama lembaga"
                    bind:value={editNama}
                    required
                />
            </div>

            <div class="form-control w-full mb-4">
                <label class="label p-1" for="editDeskripsi">
                    <span class="label-text text-xs">Deskripsi (Opsional)</span>
                </label>
                <textarea 
                    id="editDeskripsi"
                    name="deskripsi"
                    class="textarea textarea-bordered text-xs w-full h-20" 
                    placeholder="Keterangan tambahan..."
                    bind:value={editDeskripsi}
                ></textarea>
            </div>

            <div class="modal-action flex justify-end gap-2">
                <button type="button" class="btn btn-ghost btn-xs" onclick={closeModal}>Batal</button>
                <button 
                    type="submit" 
                    class="btn btn-primary btn-xs" 
                    disabled={!isFormValid}
                >
                    Simpan Perubahan
                </button>
            </div>
        </form>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button type="button" onclick={closeModal}>close</button>
    </form>
</dialog>