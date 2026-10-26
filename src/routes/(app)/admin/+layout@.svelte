<script lang="ts">
	import { resolve } from '$app/paths';
	let { children } = $props();
</script>

<div class="drawer min-h-screen bg-base-200 md:drawer-open">
	<input id="admin-drawer" type="checkbox" class="drawer-toggle" />

	<!-- Area Konten Utama -->
	<div class="drawer-content flex flex-col">
		<!-- Header Burger Menu (Hanya tampil di layar kecil / sm) -->
		<header class="navbar border-b border-base-300 bg-base-100 px-4 md:hidden">
			<label for="admin-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost btn-sm">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="h-5 w-5 stroke-current"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</label>
			<span class="ml-2 text-sm font-bold">Panel Admin</span>
		</header>

		<main class="flex-1 p-4 md:p-6">
			{@render children()}
		</main>
	</div>

	<!-- Sidebar Aside (Selalu tampil di md ke atas, drawer di sm) -->
	<div class="drawer-side z-40">
		<label for="admin-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<aside
			class="flex min-h-full w-60 flex-col justify-between border-r border-base-300 bg-base-100 p-4"
		>
			<div class="space-y-4">
				<div class="border-b border-base-200 px-2 py-1 pb-3 text-base font-bold">Panel Admin</div>

				<ul class="menu gap-1 p-0 text-base text-base-content/80">
					<li>
						<a href={resolve('/admin/pos')} class="gap-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="size-5 shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.8"
									d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
								/>
								<circle cx="12" cy="10" r="2.2" stroke-width="1.8" />
							</svg>
							<span>Pos Hidrologi</span>
						</a>
					</li>
					<li>
						<a href={resolve('/admin/perijinan')} class="gap-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="size-5 shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.8"
									d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.8"
									d="M14 2v6h6m-12 5h8m-8 4h5"
								/>
							</svg>
							<span>Perijinan</span>
						</a>
					</li>
					<li>
						<a href={resolve('/admin/logs')} class="gap-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="size-5 shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.8"
									d="M4 19V5m0 14h17M7 15l4-4 3 2 5-6"
								/>
							</svg>
							<span>Aktifitas Admin</span>
						</a>
					</li>
					<li>
						<a href={resolve('/admin/users')} class="gap-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="size-5 shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<circle cx="9" cy="8" r="3" stroke-width="1.8" />
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.8"
									d="M3 20v-1a6 6 0 0 1 12 0v1zm13-9a3 3 0 1 0 0-6m1 9a5 5 0 0 1 4 5"
								/>
							</svg>
							<span>User</span>
						</a>
					</li>
				</ul>
			</div>

			<div class="border-t border-base-200 pt-4">
				<form method="POST" action="/logout?/logout">
					<button type="submit" class="btn w-full justify-start gap-3 btn-ghost px-2 text-error">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="size-5 shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.8"
								d="M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"
							/>
						</svg>
						Logout
					</button>
				</form>
			</div>
		</aside>
	</div>
</div>
