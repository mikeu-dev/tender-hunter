<script lang="ts">
  import { onMount } from "svelte";
  import { CheckCircle, Zap, Building, Crown, ArrowRight, ShieldCheck, CreditCard } from "lucide-svelte";

  let currentPlan = "Pro";
  
  const plans = [
    {
      name: "Free",
      price: "Rp 0",
      period: "/bulan",
      description: "Untuk freelancer yang baru mulai mencari proyek",
      features: [
        "5 Notifikasi Tender/Bulan",
        "Sumber tender terbatas",
        "Pencarian manual dasar"
      ],
      icon: Building,
      color: "text-slate-400",
      bg: "bg-slate-900 border-slate-800",
      buttonText: "Paket Saat Ini",
      isCurrent: false
    },
    {
      name: "Starter",
      price: "Rp 499.000",
      period: "/bulan",
      description: "Untuk software house kecil & agency",
      features: [
        "Notifikasi Tender Tanpa Batas",
        "Simpan & Pantau Tender (Workspace)",
        "Dukungan Email Dasar",
        "Update harian"
      ],
      icon: Zap,
      color: "text-indigo-400",
      bg: "bg-slate-900 border-slate-800 hover:border-indigo-500/50",
      buttonText: "Tingkatkan ke Starter",
      isCurrent: false
    },
    {
      name: "Pro",
      price: "Rp 1.499.000",
      period: "/bulan",
      description: "Untuk perusahaan berkembang yang agresif",
      features: [
        "AI Match Scoring (Kecocokan Profil)",
        "Competitor Intelligence",
        "Notifikasi Real-time Prioritas",
        "Akses Sumber Premium/Private",
        "Analisis Risiko Dokumen"
      ],
      icon: Crown,
      color: "text-emerald-400",
      bg: "bg-slate-800 border-emerald-500/50 shadow-lg shadow-emerald-500/10 relative",
      buttonText: "Paket Saat Ini",
      isCurrent: true,
      badge: "Paling Populer"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Untuk perusahaan skala besar & konsorsium",
      features: [
        "Semua fitur Pro",
        "Custom Source Crawling",
        "Dedicated Account Manager",
        "SLA 99.9% Uptime",
        "Integrasi API Internal"
      ],
      icon: ShieldCheck,
      color: "text-rose-400",
      bg: "bg-slate-900 border-slate-800 hover:border-rose-500/50",
      buttonText: "Hubungi Sales",
      isCurrent: false
    }
  ];
</script>

<svelte:head>
  <title>Billing & Langganan | Tender Hunter</title>
</svelte:head>

<div class="space-y-8 animate-fadeIn select-none">
  <!-- Header Section -->
  <div>
    <h1 class="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
      Langganan & Penagihan
    </h1>
    <p class="text-sm text-slate-400 mt-1">Kelola paket langganan Anda, metode pembayaran, dan riwayat tagihan.</p>
  </div>

  <!-- Current Plan Banner -->
  <div class="p-6 rounded-2xl bg-linear-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <span class="px-3 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-xs font-black text-emerald-400 uppercase tracking-wider">
          Paket Aktif
        </span>
        <h2 class="text-xl font-bold text-white">SaaS {currentPlan}</h2>
      </div>
      <p class="text-sm text-slate-400">Tagihan berikutnya sebesar <strong>Rp 1.499.000</strong> pada tanggal <strong>28 Juni 2026</strong>.</p>
    </div>
    
    <div class="flex items-center gap-3 shrink-0">
      <button class="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-2">
        <CreditCard class="w-4 h-4" />
        Metode Pembayaran
      </button>
      <button class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-white text-sm font-bold text-slate-900 transition-colors">
        Kelola Langganan
      </button>
    </div>
  </div>

  <!-- Pricing Cards Grid -->
  <div>
    <h3 class="text-base font-bold text-slate-200 mb-4">Pilihan Paket Langganan</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each plans as plan}
        <div class="p-6 rounded-2xl border transition-all duration-300 flex flex-col h-full {plan.bg}">
          {#if plan.badge}
            <div class="absolute -top-3 inset-x-0 flex justify-center">
              <span class="px-3 py-1 rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 uppercase tracking-widest shadow-md">
                {plan.badge}
              </span>
            </div>
          {/if}
          
          <div class="space-y-4 mb-6">
            <div class="w-12 h-12 rounded-xl bg-slate-950/50 flex items-center justify-center border border-slate-800">
              <plan.icon class="w-6 h-6 {plan.color}" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">{plan.name}</h3>
              <p class="text-xs text-slate-400 mt-1 h-8">{plan.description}</p>
            </div>
            <div class="flex items-baseline gap-1 pt-2">
              <span class="text-2xl font-black text-white">{plan.price}</span>
              <span class="text-xs font-bold text-slate-500">{plan.period}</span>
            </div>
          </div>

          <div class="flex-1 space-y-3 mb-8">
            {#each plan.features as feature}
              <div class="flex items-start gap-2.5">
                <CheckCircle class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span class="text-xs font-medium text-slate-300 leading-relaxed">{feature}</span>
              </div>
            {/each}
          </div>

          <button class="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 
            {plan.isCurrent ? 'bg-emerald-500/20 text-emerald-400 cursor-default' : 'bg-slate-800 hover:bg-slate-700 text-white'}">
            {plan.buttonText}
            {#if !plan.isCurrent}
              <ArrowRight class="w-4 h-4" />
            {/if}
          </button>
        </div>
      {/each}
    </div>
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
