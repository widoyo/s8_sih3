<script lang="ts">
  import type { ActionData } from './$types';
  import { resolve } from '$app/paths';

  let { form }: { form: ActionData } = $props();

  let username = $state('');
  let password = $state('');
  let isValid = $derived(username.trim().length >= 3 && password.length >= 4);
</script>

<div class="hero bg-base-200 min-h-[calc(100vh-4rem)] px-6 py-12 lg:px-16">
  <div class="hero-content flex-col lg:flex-row-reverse w-full max-w-5xl justify-between gap-12 lg:gap-20">
    
    <!-- Bagian Teks Header / Branding (Menempati ruang lebih fleksibel) -->
    <div class="text-center lg:text-left lg:flex-1 space-y-4">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
        Login Admin
      </h1>
      <p class="text-base sm:text-lg text-base-content/70 leading-relaxed max-w-md mx-auto lg:mx-0">
        Masuk ke sistem pengelola data SIH3 MSBL untuk mengelola informasi hidrometeorologi, hidrologi, dan hidrogeologi.
      </p>
    </div>
    
    <!-- Form Card (Lebar sedikit disesuaikan & padding lebih longgar) -->
    <div class="card bg-base-100 w-full max-w-md shrink-0 shadow-xl border border-base-300">
      <form method="POST" class="card-body p-8 sm:p-10 space-y-4">
        
        {#if form?.invalid}
          <div class="alert alert-error text-sm p-3 mb-2 rounded-lg">
            <span>{form.message}</span>
          </div>
        {/if}

        <fieldset class="fieldset space-y-3">
          <div class="form-control w-full">
            <label class="label pb-1" for="username">
              <span class="label-text font-medium">Username</span>
            </label>
            <input 
              id="username"
              name="username"
              type="text" 
              class="input input-bordered w-full" 
              placeholder="Masukkan username" 
              bind:value={username} 
            />
          </div>
          
          <div class="form-control w-full">
            <label class="label pb-1" for="password">
              <span class="label-text font-medium">Password</span>
            </label>
            <input 
              id="password"
              name="password"
              type="password" 
              class="input input-bordered w-full" 
              placeholder="Masukkan password" 
              bind:value={password} 
            />
          </div>
          
          <div class="flex justify-end pt-1">
          &nbsp;
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-full mt-4" 
            disabled={!isValid}
          >
            Login
          </button>
        </fieldset>
        <a href={resolve('/')} class="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
          ke Beranda
        </a>
      </form>
    </div>

  </div>
</div>