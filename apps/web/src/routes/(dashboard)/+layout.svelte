<script lang="ts">
  import { page } from "$app/state";
  import { Home, Briefcase, Building2, Bell, CreditCard, LogOut, Menu, User, Search } from "lucide-svelte";

  let { children } = $props();
  let isMobileMenuOpen = $state(false);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Temukan Tender", href: "/tenders", icon: Briefcase },
    { name: "Profil Perusahaan", href: "/company", icon: Building2 },
    { name: "Notifikasi & Alert", href: "/alerts", icon: Bell },
    { name: "Langganan & Billing", href: "/billing", icon: CreditCard },
  ];

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
</script>

<div class="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row antialiased">
  <!-- Desktop Sidebar -->
  <aside class="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800 shrink-0 sticky top-0 h-screen select-none">
    <!-- Header/Logo -->
    <div class="h-20 px-8 flex items-center gap-3 border-b border-slate-800/60">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
        <span class="font-extrabold text-lg text-white">T</span>
      </div>
      <span class="font-bold text-lg text-white tracking-tight">Tender Hunter</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-1">
      {#each menuItems as item}
        {@const isActive = page.url.pathname === item.href}
        <a
          href={item.href}
          class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative
            {isActive 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'}"
        >
          <item.icon class="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
          {item.name}
          {#if isActive}
            <span class="absolute left-0 w-1.5 h-6 bg-white rounded-r-full"></span>
          {/if}
        </a>
      {/each}
    </nav>

    <!-- User Profile Footer -->
    <div class="p-4 border-t border-slate-800/60 bg-slate-900/40">
      <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/40 transition-colors duration-200 cursor-pointer">
        <div class="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
          <User class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-slate-200 truncate">Mike Udev</p>
          <p class="text-xs text-slate-500 truncate">mike@tenderhunter.com</p>
        </div>
        <a href="/login" class="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition-colors">
          <LogOut class="w-4 h-4" />
        </a>
      </div>
    </div>
  </aside>

  <!-- Mobile Header -->
  <header class="md:hidden h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40 select-none">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
        T
      </div>
      <span class="font-bold text-white tracking-tight text-md">Tender Hunter</span>
    </div>
    <button onclick={toggleMobileMenu} class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 active:scale-95 transition-all">
      <Menu class="w-6 h-6" />
    </button>
  </header>

  <!-- Mobile Menu Drawer -->
  {#if isMobileMenuOpen}
    <div class="md:hidden fixed inset-0 z-50 flex bg-slate-950/60 backdrop-blur-sm" onclick={toggleMobileMenu}>
      <div class="w-72 bg-slate-900 h-full border-r border-slate-800 flex flex-col p-6 space-y-6" onclick={(e) => e.stopPropagation()}>
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <span class="font-bold text-white">Menu Navigasi</span>
          <button onclick={toggleMobileMenu} class="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded bg-slate-800">Tutup</button>
        </div>
        
        <nav class="flex-1 space-y-1">
          {#each menuItems as item}
            {@const isActive = page.url.pathname === item.href}
            <a
              href={item.href}
              onclick={toggleMobileMenu}
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                {isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
            >
              <item.icon class="w-5 h-5 shrink-0" />
              {item.name}
            </a>
          {/each}
        </nav>

        <div class="pt-4 border-t border-slate-800 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <User class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-slate-200 truncate">Mike Udev</p>
            <p class="text-xs text-slate-500 truncate">mike@tenderhunter.com</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Main Content Area -->
  <main class="flex-1 flex flex-col min-w-0">
    <!-- Top Header / Search / Alerts -->
    <header class="hidden md:flex h-20 items-center justify-between px-8 bg-slate-950/40 border-b border-slate-900 select-none">
      <!-- Search -->
      <div class="relative w-80">
        <Search class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Cari tender cepat..." 
          class="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
        />
      </div>

      <!-- Action items -->
      <div class="flex items-center gap-4">
        <!-- Notification button -->
        <button class="relative p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors">
          <Bell class="w-4.5 h-4.5" />
          <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
        </button>

        <div class="h-6 w-[1px] bg-slate-800"></div>

        <!-- Org Indicator -->
        <div class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-indigo-400">
          IT & Security Niche
        </div>
      </div>
    </header>

    <!-- Page Content Container -->
    <div class="flex-1 p-6 md:p-8 overflow-y-auto">
      {@render children()}
    </div>
  </main>
</div>
