<script lang="ts">
    import type { PageData, ActionData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    // State modal & form
    let selectedUser = $state<{ id: string; username: string } | null>(null);
    let newPassword = $state('');
    let isPasswordValid = $derived(newPassword.length >= 4);

    let modalRef = $state<HTMLDialogElement | null>(null);

    function openSetPasswordModal(user: { id: string; username: string }) {
        selectedUser = user;
        newPassword = '';
        modalRef?.showModal();
    }

    function closeModal() {
        modalRef?.close();
        selectedUser = null;
        newPassword = '';
    }
</script>

<div class="space-y-4">
    <!-- Header Halaman -->
    <div class="flex items-center justify-between pb-2 border-b border-base-300">
        <div>
            <h1 class="text-xl font-bold">Kelola User</h1>
            <p class="text-xs text-base-content/60">Daftar pengguna terdaftar dan manajemen kredensial</p>
        </div>
    </div>

    <!-- Alert Umpan Balik -->
    {#if form?.message}
        <div class="alert {form.success ? 'alert-success' : 'alert-error'} text-xs py-2 rounded-lg">
            <span>{form.message}</span>
        </div>
    {/if}

    <!-- Tabel Daftar User -->
    <div class="overflow-x-auto bg-base-100 rounded-lg border border-base-300 shadow-sm">
        <table class="table table-sm w-full">
            <thead>
                <tr class="bg-base-200/50">
                    <th>Username</th>
                    <th>Role</th>
                    <th>Lembaga</th>
                    <th>Terakhir Login</th>
                    <th class="text-right">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {#each data.users as u}
                    <tr class="hover">
                        <td class="font-bold">{u.username}</td>
                        <td>
                            <span class="badge badge-xs {u.role === 'SUPER_ADMIN' ? 'badge-primary' : 'badge-ghost'}">
                                {u.role}
                            </span>
                        </td>
                        <td class="text-xs text-base-content/70">{u.lembagaNama || '-'}</td>
                        <td class="text-xs text-base-content/60">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString('id-ID') : 'Belum pernah'}
                        </td>
                        <td class="text-right">
                            <button 
                                type="button" 
                                class="btn btn-ghost btn-xs text-warning"
                                onclick={() => openSetPasswordModal(u)}
                            >
                                Set Password
                            </button>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="5" class="text-center py-6 text-xs opacity-60">Tidak ada data user.</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<!-- Modal Dialog Set Password -->
<dialog bind:this={modalRef} class="modal">
    <div class="modal-box max-w-sm">
        <h3 class="font-bold text-base mb-1">Set Password Baru</h3>
        <p class="text-xs text-base-content/70 mb-4">
            Ubah kata sandi untuk user: <strong class="text-primary">{selectedUser?.username}</strong>
        </p>

        <form method="POST" action="?/setPassword" onsubmit={() => setTimeout(closeModal, 100)}>
            <input type="hidden" name="userId" value={selectedUser?.id} />
            
            <div class="form-control w-full mb-4">
                <label class="label p-1" for="newPassword">
                    <span class="label-text text-xs">Password Baru (min 4 karakter)</span>
                </label>
                <input 
                    id="newPassword"
                    name="newPassword"
                    type="password" 
                    class="input input-bordered input-sm w-full" 
                    placeholder="Masukkan password baru"
                    bind:value={newPassword}
                    required
                />
            </div>

            <div class="modal-action flex justify-end gap-2">
                <button type="button" class="btn btn-ghost btn-xs" onclick={closeModal}>Batal</button>
                <button 
                    type="submit" 
                    class="btn btn-warning btn-xs" 
                    disabled={!isPasswordValid}
                >
                    Simpan Password
                </button>
            </div>
        </form>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button type="button" onclick={closeModal}>close</button>
    </form>
</dialog>