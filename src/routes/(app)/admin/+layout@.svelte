<script lang="ts">
    import { resolve } from '$app/paths';
    let { children } = $props();
</script>

<div class="drawer md:drawer-open min-h-screen bg-base-200">
    <input id="admin-drawer" type="checkbox" class="drawer-toggle" />

    <!-- Area Konten Utama -->
    <div class="drawer-content flex flex-col">
        <!-- Header Burger Menu (Hanya tampil di layar kecil / sm) -->
        <header class="navbar bg-base-100 border-b border-base-300 md:hidden px-4">
            <label for="admin-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-5 h-5 stroke-current">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </label>
            <span class="font-bold text-sm ml-2">Panel Admin</span>
        </header>

        <main class="flex-1 p-4 md:p-6">
            {@render children()}
        </main>
    </div>

    <!-- Sidebar Aside (Selalu tampil di md ke atas, drawer di sm) -->
    <div class="drawer-side z-40">
        <label for="admin-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <aside class="bg-base-100 border-r border-base-300 w-60 min-h-full flex flex-col justify-between p-4">
            <div class="space-y-4">
                <div class="px-2 py-1 font-bold text-base border-b border-base-200 pb-3">
                    Panel Admin
                </div>
                
                <ul class="menu menu-sm p-0 gap-1 text-base-content/80">
                    <li><a href="{resolve('/admin/pos')}">Pos Hidrologi</a></li>
                    <li><a href="{resolve('/admin/logs')}">Log Web Scraping</a></li>
                    <li><a href="{resolve('/admin/logs')}">Aktifitas Admin</a></li>
                    <li><a href="{resolve('/admin/berita')}">Berita</a></li>
                    <li><a href="{resolve('/admin/users')}">User</a></li>
                </ul>
            </div>

            <div class="pt-4 border-t border-base-200">
                <form method="POST" action="/logout?/logout">
                    <button type="submit" class="btn btn-ghost btn-sm text-error w-full justify-start px-2">
                        Logout
                    </button>
                </form>
            </div>
        </aside>
    </div>
</div>