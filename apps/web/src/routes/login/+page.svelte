<script lang="ts">
  import { Mail, Lock, ArrowRight, LogIn } from "lucide-svelte";
  
  let isLoading = $state(false);

  function handleLogin() {
    isLoading = true;
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  }
</script>

<svelte:head>
  <title>Masuk | Tender Hunter</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased select-none">
  
  <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
    <div class="mx-auto w-12 h-12 rounded-xl bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-6">
      <span class="font-extrabold text-2xl text-white">T</span>
    </div>
    <h2 class="text-3xl font-extrabold text-white tracking-tight">
      Masuk ke Akun Anda
    </h2>
    <p class="mt-2 text-sm text-slate-400">
      Atau <a href="/onboarding" class="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">daftar sekarang untuk uji coba gratis</a>
    </p>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
      <form class="space-y-6" onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        
        <!-- Email Input -->
        <div>
          <label for="email" class="block text-sm font-bold text-slate-300">
            Alamat Email
          </label>
          <div class="mt-2 relative rounded-xl shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail class="h-4 w-4 text-slate-500" />
            </div>
            <input 
              id="email" 
              name="email" 
              type="email" 
              autocomplete="email" 
              required 
              class="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl leading-5 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors" 
              placeholder="nama@perusahaan.com"
            />
          </div>
        </div>

        <!-- Password Input -->
        <div>
          <label for="password" class="block text-sm font-bold text-slate-300">
            Kata Sandi
          </label>
          <div class="mt-2 relative rounded-xl shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock class="h-4 w-4 text-slate-500" />
            </div>
            <input 
              id="password" 
              name="password" 
              type="password" 
              autocomplete="current-password" 
              required 
              class="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl leading-5 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors" 
              placeholder="••••••••"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input 
              id="remember-me" 
              name="remember-me" 
              type="checkbox" 
              class="h-4 w-4 bg-slate-950 border-slate-700 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label for="remember-me" class="ml-2 block text-sm text-slate-400">
              Ingat saya
            </label>
          </div>

          <div class="text-sm">
            <a href="/forgot-password" class="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Lupa sandi?
            </a>
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            disabled={isLoading}
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-indigo-600/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 gap-2 items-center"
          >
            {#if isLoading}
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Memproses...
            {:else}
              Masuk
              <ArrowRight class="w-4 h-4" />
            {/if}
          </button>
        </div>
      </form>

      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-800"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-slate-900 text-slate-500 font-medium">Atau lanjutkan dengan</span>
          </div>
        </div>

        <div class="mt-6">
          <button class="w-full inline-flex justify-center py-2.5 px-4 border border-slate-700 rounded-xl shadow-sm bg-slate-950 text-sm font-bold text-slate-300 hover:bg-slate-800 transition-colors gap-2 items-center">
            <LogIn class="w-5 h-5" />
            Sign in with Single Sign-On
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
