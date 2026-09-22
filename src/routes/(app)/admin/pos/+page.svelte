<script lang="ts">
    import type { PageData, ActionData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    type PosItem = typeof data.posList[number];

    let selectedPos = $state<PosItem | null>(null);
    let modalRef = $state<HTMLDialogElement | null>(null);

    // Form states
    let nama = $state('');
    let kode = $state('');
    let tipe = $state('ARR');
    let lat = $state('');
    let lon = $state('');
    let elevasi = $state('');
    let status = $state('AKTIF');
    let lembagaId = $state('');
    let dasId = $state('');

    let isFormValid = $derived(nama.trim().length >= 2 && kode.trim().length >= 2 && lat !== '' && lon !== '');

    function openModal(posItem?: PosItem) {
        if (posItem) {
            selectedPos = posItem;
            nama = posItem.nama;
            kode = posItem.kode;
            tipe = posItem.tipe;
            lat = posItem.lat.toString();
            lon = posItem.lon.toString();
            elevasi = posItem.elevasi !== null ? posItem.elevasi.toString() : '';
            status = posItem.status || 'AKTIF';
            lembagaId = posItem.lembagaId ? posItem.lembagaId.toString() : '';
            dasId = posItem.dasId ? posItem.dasId.toString() : '';
        } else {
            selectedPos = null;
            nama = '';
            kode = '';
            tipe = 'ARR';
            lat = '';
            lon = '';
            elevasi = '';
            status = 'AKTIF';
            lembagaId = '';
            dasId = '';
        }
        modalRef?.showModal();
    }

    function closeModal() {
        modalRef?.close();
    }
</script>

<div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-base-300">
        <div>
            <h1 class="text-xl font-bold">Kelola Pos Hidrologi</h1>
            <p class="text-xs text-base-content/60">Stasiun pos pemantauan curah hujan (ARR), muka air (AWLR), dan kualitas air</p>
        </div>
        <button type="button" class="btn btn-primary btn-xs sm:btn-sm self-start sm:self-auto" onclick={() => openModal()}>
            + Tambah Pos
        </button>
    </div>

    <!-- Alert Umpan Balik -->
    {#if form?.message}
        <div class="alert {form.success ? 'alert-success' : 'alert-error'} text-xs py-2 rounded-lg">
            <span>{form.message}</span>
        </div>
    {/if}

    <!-- Tabel Daftar Pos -->
    <div class="overflow-x-auto bg-base-100 rounded-lg border border-base-300 shadow-sm">
        <table class="table table-sm w-full">
            <thead>
                <tr class="bg-base-200/50">
                    <th>ID</th>
                    <th>Nama Pos</th>
                    <th>Tipe</th>
                    <th>Koordinat (3D)</th>
                    <th>DAS / Lembaga</th>
                    <th>Status</th>
                    <th class="text-right">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {#each data.posList as item(item.id)}
                    <tr class="hover">
                        <td class="font-mono text-xs font-bold">{item.id} {#if item.kode !== null}/ {item.kode}{/if}</td>
                        <td class="font-bold">{item.nama}</td>
                        <td>
                            <span class="badge badge-xs font-bold {item.tipe === 'ARR' ? 'badge-info' : 'badge-warning'}">
                                {item.tipe}
                            </span>
                        </td>
                        <td class="text-xs font-mono opacity-80">
                            {item.lat}, {item.lon}
                            {#if item.elevasi !== null}
                                <span class="text-base-content/50">({item.elevasi} m)</span>
                            {/if}
                        </td>
                        <td class="text-xs text-base-content/70">
                            <div>{item.dasNama || '-'}</div>
                            <div class="text-[10px] opacity-50">{item.lembagaNama || '-'}</div>
                        </td>
                        <td>
                            <span class="badge badge-xs {item.status === 'AKTIF' ? 'badge-success' : 'badge-ghost'}">
                                {item.status}
                            </span>
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
                        <td colspan="7" class="text-center py-6 text-xs opacity-60">Belum ada data pos hidrologi.</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<!-- Modal Form Tambah / Edit Pos -->
<dialog bind:this={modalRef} class="modal">
    <div class="modal-box max-w-lg">
        <h3 class="font-bold text-base mb-1">
            {selectedPos ? 'Edit Pos Hidrologi' : 'Tambah Pos Hidrologi Baru'}
        </h3>
        <p class="text-xs text-base-content/70 mb-4">Parameter stasiun dan lokasi geografis pos</p>

        <form method="POST" action="?/savePos" class="space-y-3" onsubmit={() => setTimeout(closeModal, 100)}>
            {#if selectedPos}
                <input type="hidden" name="id" value={selectedPos.id} />
            {/if}

            <div class="grid grid-cols-3 gap-2">
                <div class="form-control col-span-1">
                    <label class="label p-1" for="kode"><span class="label-text text-xs">Kode Pos</span></label>
                    <input id="kode" name="kode" type="text" class="input input-bordered input-sm" placeholder="ARR-01" bind:value={kode} required />
                </div>
                <div class="form-control col-span-2">
                    <label class="label p-1" for="nama"><span class="label-text text-xs">Nama Pos</span></label>
                    <input id="nama" name="nama" type="text" class="input input-bordered input-sm" placeholder="Pos Simpang 5" bind:value={nama} required />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
                <div class="form-control">
                    <label class="label p-1" for="tipe"><span class="label-text text-xs">Tipe Pos</span></label>
                    <select id="tipe" name="tipe" class="select select-bordered select-sm" bind:value={tipe}>
                        <option value="ARR">ARR (Curah Hujan)</option>
                        <option value="AWLR">AWLR (Muka Air)</option>
                        <option value="KLIMATOLOGI">Klimatologi</option>
                        <option value="KUALITAS_AIR">Kualitas Air</option>
                    </select>
                </div>
                <div class="form-control">
                    <label class="label p-1" for="status"><span class="label-text text-xs">Status</span></label>
                    <select id="status" name="status" class="select select-bordered select-sm" bind:value={status}>
                        <option value="AKTIF">AKTIF</option>
                        <option value="NON_AKTIF">NON AKTIF</option>
                        <option value="PERBAIKAN">PERBAIKAN</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
                <div class="form-control">
                    <label class="label p-1" for="lat"><span class="label-text text-xs">Latitude</span></label>
                    <input id="lat" name="lat" type="number" step="any" class="input input-bordered input-sm" placeholder="-3.456" bind:value={lat} required />
                </div>
                <div class="form-control">
                    <label class="label p-1" for="lon"><span class="label-text text-xs">Longitude</span></label>
                    <input id="lon" name="lon" type="number" step="any" class="input input-bordered input-sm" placeholder="104.123" bind:value={lon} required />
                </div>
                <div class="form-control">
                    <label class="label p-1" for="elevasi"><span class="label-text text-xs">Elevasi (m)</span></label>
                    <input id="elevasi" name="elevasi" type="number" step="any" class="input input-bordered input-sm" placeholder="125" bind:value={elevasi} />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
                <div class="form-control">
                    <label class="label p-1" for="dasId"><span class="label-text text-xs">DAS</span></label>
                    <select id="dasId" name="dasId" class="select select-bordered select-sm" bind:value={dasId}>
                        <option value="">-- Pilih DAS --</option>
                        {#each data.refDas as d (d.id)}
                            <option value={d.id}>{d.nama}</option>
                        {/each}
                    </select>
                </div>
                <div class="form-control">
                    <label class="label p-1" for="lembagaId"><span class="label-text text-xs">Lembaga</span></label>
                    <select id="lembagaId" name="lembagaId" class="select select-bordered select-sm" bind:value={lembagaId}>
                        <option value="">-- Pilih Lembaga --</option>
                        {#each data.refLembaga as l (l.id)}
                            <option value={l.id}>{l.nama}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <div class="modal-action flex justify-end gap-2 pt-2">
                <button type="button" class="btn btn-ghost btn-xs" onclick={closeModal}>Batal</button>
                <button type="submit" class="btn btn-primary btn-xs" disabled={!isFormValid}>
                    Simpan Data Pos
                </button>
            </div>
        </form>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
</dialog>