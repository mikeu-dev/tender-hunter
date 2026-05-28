<script lang="ts">
  import { onMount } from "svelte";
  import { Search, Filter, Briefcase, Building, TrendingUp, Calendar, ArrowRight, RefreshCw, Star } from "lucide-svelte";

  let tendersList = $state([] as any[]);
  let isLoading = $state(true);
  let searchQuery = $state("");

  const fallbackTenders = [
    {
      id: "1",
      title: "Pengadaan Jasa Asesmen Keamanan Informasi & Penetration Testing Aplikasi SPBE",
      organizationName: "Kementerian Kesehatan RI",
      budget: 1450000000,
      submissionDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      category: "IT/Software/Telekomunikasi",
      aiMatch: { score: 94 }
    },
    {
      id: "2",
      title: "Pengembangan Sistem Informasi Layanan Terintegrasi & Pengadaan Infrastruktur Cloud",
      organizationName: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
      budget: 4800000000,
      submissionDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      category: "IT/Software/Telekomunikasi",
      aiMatch: { score: 87 }
    },
    {
      id: "3",
      title: "Pengadaan Lisensi Software Antivirus Enterprise & Endpoint Detection Response (EDR)",
      organizationName: "Pemerintah Provinsi Jawa Barat",
      budget: 850000000,
      submissionDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      category: "IT/Cybersecurity",
      aiMatch: { score: 72 }
    },
    {
      id: "4",
      title: "Pembangunan Data Center Tier 3 & Disaster Recovery Center",
      organizationName: "Kementerian Keuangan",
      budget: 12500000000,
      submissionDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      category: "IT/Infrastruktur",
      aiMatch: { score: 65 }
    }
  ];

  async function fetchTenders() {
    isLoading = true;
    try {
      const response = await fetch("http://localhost:3000/api/tenders/search");
      if (!response.ok) throw new Error("Gagal mengambil data");
      
      const resData = await response.json();
      tendersList = resData.tenders && resData.tenders.length > 0 ? resData.tenders : fallbackTenders;
    } catch (err) {
      console.warn("Using fallback data for tenders:", err);
      tendersList = fallbackTenders;
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    fetchTenders();
  });

  let filteredTenders = $derived(
    tendersList.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.organizationName.toLowerCase().includes(searchQuery.toLowerCase()))
  );
</script>

<svelte:head>
  <title>Temukan Tender | Tender Hunter</title>
</svelte:head>

<div class="space-y-8 animate-fadeIn select-none">
  <!-- Header Section -->
  <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
        Eksplorasi Tender
      </h1>
      <p class="text-sm text-slate-400 mt-1">Temukan dan filter ribuan tender pemerintah dan BUMN terbaru yang relevan dengan bisnis Anda.</p>
    </div>
    
    <!-- Search & Filter Controls -->
    <div class="flex items-center gap-3 w-full md:w-auto">
      <div class="relative w-full md:w-64">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="h-4 w-4 text-slate-500" />
        </div>
        <input 
          type="text" 
          bind:value={searchQuery}
          placeholder="Cari kata kunci lelang..." 
          class="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-xl leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
        />
      </div>
      <button class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
        <Filter class="w-4 h-4" />
      </button>
      <button 
        onclick={fetchTenders}
        disabled={isLoading}
        class="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/10 disabled:opacity-50"
      >
        <RefreshCw class="w-4 h-4 {isLoading ? 'animate-spin' : ''}" />
      </button>
    </div>
  </div>

  <!-- Tenders List -->
  <div class="space-y-4">
    {#if isLoading}
      <div class="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center">
        <RefreshCw class="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <span class="text-sm font-semibold text-slate-400">Memuat data tender...</span>
      </div>
    {:else if filteredTenders.length === 0}
      <div class="p-12 rounded-2xl bg-slate-900 border border-slate-800 border-dashed text-center">
        <Search class="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p class="text-slate-400 font-medium">Tidak ada tender yang sesuai dengan pencarian Anda.</p>
      </div>
    {:else}
      {#each filteredTenders as tender}
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
          
          <div class="space-y-3 flex-1">
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                <Building class="w-3 h-3 text-indigo-400" />
                {tender.organizationName}
              </span>
              {#if tender.aiMatch && tender.aiMatch.score >= 80}
                <span class="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Star class="w-3 h-3 fill-emerald-500/20" />
                  Sangat Relevan
                </span>
              {/if}
            </div>

            <h3 class="text-base font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
              {tender.title}
            </h3>

            <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span class="flex items-center gap-1.5">
                <TrendingUp class="w-3.5 h-3.5 text-emerald-500" />
                Rp {(tender.budget || 0).toLocaleString("id-ID")}
              </span>
              <span class="flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5 text-rose-400" />
                Batas: {new Date(tender.submissionDeadline).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span class="flex items-center gap-1.5">
                <Briefcase class="w-3.5 h-3.5 text-indigo-400" />
                {tender.category}
              </span>
            </div>
          </div>

          <div class="shrink-0 flex items-center gap-4">
            {#if tender.aiMatch}
              <div class="text-right">
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">AI Match</p>
                <p class="text-xl font-black {tender.aiMatch.score >= 80 ? 'text-emerald-400' : tender.aiMatch.score >= 60 ? 'text-yellow-400' : 'text-slate-400'}">
                  {tender.aiMatch.score}%
                </p>
              </div>
            {/if}
            <button class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold text-white transition-colors flex items-center gap-2">
              Detail
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>

        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
  }
</style>
