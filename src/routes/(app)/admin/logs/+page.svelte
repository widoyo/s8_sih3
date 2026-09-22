<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    // Helper pembeda warna badge berdasarkan kategori aktivitas
    function getActionBadgeClass(action: string): string {
        switch (action) {
            case 'LOGIN':
                return 'badge-success';
            case 'LOGOUT':
                return 'badge-ghost';
            case 'CHANGE_PASSWORD':
                return 'badge-warning';
            case 'UPDATE_LEMBAGA':
            case 'CREATE_LEMBAGA':
                return 'badge-info';
            case 'DELETE':
                return 'badge-error';
            default:
                return 'badge-neutral';
        }
    }
</script>

<div class="space-y-4">
    <!-- Header Halaman -->
    <div class="flex items-center justify-between pb-2 border-b border-base-300">
        <div>
            <h1 class="text-xl font-bold">Log Aktivitas Sistem</h1>
            <p class="text-xs text-base-content/60">Catatan riwayat tindakan pengguna dan peristiwa keamanan (100 transaksi terbaru)</p>
        </div>
    </div>

    <!-- Tabel Log Aktivitas -->
    <div class="overflow-x-auto bg-base-100 rounded-lg border border-base-300 shadow-sm">
        <table class="table table-sm w-full">
            <thead>
                <tr class="bg-base-200/50">
                    <th class="w-40">Waktu</th>
                    <th class="w-32">Pengguna</th>
                    <th class="w-36">Aksi</th>
                    <th>Detail Aktivitas</th>
                    <th class="w-32 text-right">IP Address</th>
                </tr>
            </thead>
            <tbody>
                {#each data.logs as log}
                    <tr class="hover">
                        <!-- Waktu -->
                        <td class="text-xs text-base-content/70 whitespace-nowrap font-mono">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString('id-ID') : '-'}
                        </td>

                        <!-- Username -->
                        <td class="font-bold text-xs">
                            {log.username || 'System / Anonim'}
                        </td>

                        <!-- Badge Aksi -->
                        <td>
                            <span class="badge badge-xs font-semibold px-2 py-1 {getActionBadgeClass(log.action)}">
                                {log.action}
                            </span>
                        </td>

                        <!-- Detail -->
                        <td class="text-xs text-base-content/80 max-w-md truncate">
                            {log.details || '-'}
                        </td>

                        <!-- IP Address -->
                        <td class="text-right text-xs font-mono opacity-60">
                            {log.ipAddress || '-'}
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="5" class="text-center py-6 text-xs opacity-60">Belum ada catatan aktivitas.</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>