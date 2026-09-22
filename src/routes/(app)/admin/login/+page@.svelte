<script lang="ts">
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();

  let username = $state('');
  let password = $state('');
  let isValid = $derived(username.trim().length >= 3 && password.length >= 4);
</script>

<div class="hero bg-base-200 min-h-screen">
  <div class="hero-content flex-col lg:flex-row-reverse">
    <div class="text-center lg:text-left">
      <h1 class="text-5xl font-bold">Login Admin</h1>
      <p class="py-6">Masuk ke sistem pengelola data SIH3 MSBL.</p>
    </div>
    
    <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
      <form method="POST" class="card-body">
        
        {#if form?.invalid}
          <div class="alert alert-error text-xs py-2 mb-2 rounded-lg">
            <span>{form.message}</span>
          </div>
        {/if}

        <fieldset class="fieldset">
          <label class="label" for="username">Username</label>
          <input 
            id="username"
            name="username"
            type="text" 
            class="input" 
            placeholder="username" 
            bind:value={username} 
          />
          
          <label class="label" for="password">Password</label>
          <input 
            id="password"
            name="password"
            type="password" 
            class="input" 
            placeholder="Password" 
            bind:value={password} 
          />
          
          <div><a href="#forgot" class="link link-hover text-xs">Forgot password?</a></div>
          
          <button 
            type="submit" 
            class="btn btn-primary mt-4" 
            disabled={!isValid}
          >
            Login
          </button>
        </fieldset>
      </form>
    </div>
  </div>
</div>