<script lang="ts">
  import { Briefcase, Building, ShieldAlert, CheckCircle, TrendingUp, Calendar, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-svelte";

  const stats = [
    { name: "Total Tender Dipindai", value: "1.428", icon: Briefcase, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/10" },
    { name: "Kecocokan Sempurna (AI > 80%)", value: "12", icon: CheckCircle, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/10" },
    { name: "Rata-rata Skor Kesiapan", value: "84%", icon: TrendingUp, color: "text-purple-400 bg-purple-500/10 border-purple-500/10" },
    { name: "Risiko Terdeteksi", value: "3", icon: ShieldAlert, color: "text-rose-400 bg-rose-500/10 border-rose-500/10" },
  ];

  const matchedTenders = [
    {
      id: "1",
      title: "Pengadaan Jasa Asesmen Keamanan Informasi & Penetration Testing Aplikasi SPBE",
      org: "Kementerian Kesehatan RI",
      budget: "Rp 1.450.000.000",
      deadline: "3 hari lagi (31 Mei 2026)",
      score: 94,
      label: "QUICK_WIN",
      strengths: ["Memiliki Sertifikasi ISO 27001", "Keahlian Penetration Testing Terpenuhi", "Budget di atas batas minimum perusahaan"],
      risks: ["Waktu pengerjaan relatif singkat (45 hari kalender)"],
    },
    {
      id: "2",
      title: "Pengembangan Sistem Informasi Layanan Terintegrasi & Pengadaan Infrastruktur Cloud",
      org: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
      budget: "Rp 4.800.000.000",
      deadline: "5 hari lagi (2 Juni 2026)",
      score: 87,
      label: "HIGH_VALUE",
      strengths: ["Kategori Software House cocok", "Nilai pagu besar", "Regional Jakarta sesuai"],
      risks: ["Membutuhkan garansi bank 5% dari nilai pagu", "Daftar tenaga ahli tersertifikasi CISA sangat ketat"],
    },
    {
      id: "3",
      title: "Pekerjaan Implementasi Security Operations Center (SOC) Tahap Lanjutan",
      org: "Kementerian Komunikasi dan Informatika",
      budget: "Rp 8.200.000.000",
      deadline: "8 hari lagi (5 Juni 2026)",
      score: 76,
      label: "HARD_COMPETITION",
      strengths: ["Keahlian SOC terpenuhi", "Budget sangat tinggi"],
      risks: ["Membutuhkan Sertifikasi ISO 20000-1 (Perusahaan Anda belum memilikinya)", "Persyaratan pengalaman sejenis minimal Rp 5 Miliar"],
    },
  ];
</script>

<svelte:head>
  <title>Dashboard Ringkasan Tender | Tender Hunter</title>
</svelte:head>

<div class="space-y-8 select-none animate-fadeIn">
  <!-- Top Welcome Header -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-white">Selamat Datang di Tender Hunter</h1>
      <p class="text-sm text-slate-400 mt-1">Berikut adalah ikhtisar tender LPSE terbaru yang tervalidasi oleh kecerdasan AI kami.</p>
    </div>
    <div class="flex items-center gap-3">
      <a href="/tenders" class="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-2">
        Lihat Semua Tender
      </a>
      <a href="/company" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors shadow-md shadow-indigo-600/10 flex items-center gap-2 active:scale-95">
        Optimalkan Profil AI
        <ArrowRight class="w-3.5 h-3.5" />
      </a>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {#each stats as stat}
      <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between group hover:border-slate-700 transition-all duration-300">
        <div class="space-y-2">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.name}</p>
          <p class="text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
        </div>
        <div class="w-12 h-12 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 duration-300 {stat.color}">
          <stat.icon class="w-5.5 h-5.5" />
        </div>
      </div>
    {/each}
  </div>

  <!-- Main Dashboard Content Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    
    <!-- Left Column: Matched Tenders List -->
    <div class="lg:col-span-2 space-y-6">
      <div class="flex items-center justify-between pb-2">
        <h2 class="text-md font-bold text-slate-200 flex items-center gap-2.5">
          <ShieldCheck class="w-5 h-5 text-emerald-400" />
          Rekomendasi Tender AI Terbaik
        </h2>
        <span class="text-xs font-bold text-indigo-400 hover:underline cursor-pointer">Segarkan Data</span>
      </div>

      <div class="space-y-4">
        {#each matchedTenders as tender}
          <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 flex flex-col md:flex-row md:items-start justify-between gap-6 relative group">
            
            <div class="space-y-4 flex-1">
              <!-- Instansi & Badge -->
              <div class="flex flex-wrap items-center gap-3">
                <span class="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Building class="w-3.5 h-3.5 text-indigo-400" />
                  {tender.org}
                </span>

                {#if tender.label === 'QUICK_WIN'}
                  <span class="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-extrabold text-emerald-400 tracking-wide uppercase">Quick Win</span>
                {:else if tender.label === 'HIGH_VALUE'}
                  <span class="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-extrabold text-indigo-400 tracking-wide uppercase">High Value</span>
                {:else}
                  <span class="px-2.5 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-extrabold text-yellow-500 tracking-wide uppercase">Hard Competition</span>
                {/if}
              </div>

              <!-- Title -->
              <h3 class="text-sm font-bold text-slate-100 leading-relaxed group-hover:text-indigo-300 transition-colors">
                {tender.title}
              </h3>

              <!-- Info details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-500">
                <span class="flex items-center gap-2 font-semibold">
                  <TrendingUp class="w-4 h-4 text-emerald-500/70" />
                  Nilai Pagu: <strong class="text-slate-300">{tender.budget}</strong>
                </span>
                <span class="flex items-center gap-2 font-semibold">
                  <Calendar class="w-4 h-4 text-rose-500/70" />
                  Batas Waktu: <strong class="text-rose-400">{tender.deadline}</strong>
                </span>
              </div>

              <!-- AI Strengths and Risks list -->
              <div class="space-y-2 border-t border-slate-800/60 pt-4">
                <div class="space-y-1">
                  {#each tender.strengths as str}
                    <div class="flex items-start gap-2 text-xs text-slate-400">
                      <span class="text-emerald-500 font-bold text-[10px] mt-0.5">✓</span>
                      <span>{str}</span>
                    </div>
                  {/each}
                </div>
                {#if tender.risks.length > 0}
                  <div class="space-y-1 pt-1">
                    {#each tender.risks as risk}
                      <div class="flex items-start gap-2 text-xs text-slate-500">
                        <span class="text-rose-500 font-bold text-[10px] mt-0.5">!</span>
                        <span>{risk}</span>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>

            <!-- AI Circular Score Badge -->
            <div class="shrink-0 flex md:flex-col items-center justify-center gap-3 md:border-l border-slate-800/60 md:pl-6 md:h-full justify-self-end">
              <div class="relative w-18 h-18 rounded-full border border-slate-800 flex items-center justify-center bg-slate-950">
                <span class="text-lg font-black tracking-tighter
                  {tender.score >= 90 ? 'text-emerald-400' : tender.score >= 75 ? 'text-indigo-400' : 'text-yellow-500'}">
                  {tender.score}%
                </span>
                <!-- Decorative absolute border highlight -->
                <div class="absolute inset-0 rounded-full border border-t-transparent border-r-transparent animate-spin duration-1000 opacity-20
                  {tender.score >= 90 ? 'border-emerald-500' : 'border-indigo-500'}"></div>
              </div>
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Match Score</span>
            </div>

          </div>
        {/each}
      </div>
    </div>

    <!-- Right Column: Sidebar Alerts & Active Search Niche -->
    <div class="space-y-6">
      
      <!-- Niche Info Box -->
      <div class="p-6 rounded-2xl bg-gradient-to-tr from-indigo-950/20 to-purple-950/20 border border-indigo-900/30 space-y-4">
        <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Kategori Niche Aktif</h3>
        <h4 class="text-md font-bold text-slate-200">IT & Cybersecurity Services</h4>
        <p class="text-xs text-slate-400 leading-relaxed">
          AI Tender Hunter saat ini dioptimalkan penuh untuk menyaring pengadaan jasa keamanan informasi, penetrasi aplikasi, infrastruktur awan, dan rekayasa perangkat lunak.
        </p>
        <div class="flex flex-wrap gap-1.5 pt-2">
          <span class="px-2.5 py-1 rounded bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 font-bold">ISO 27001</span>
          <span class="px-2.5 py-1 rounded bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 font-bold">SOC Operations</span>
          <span class="px-2.5 py-1 rounded bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 font-bold">Penetration Testing</span>
        </div>
      </div>

      <!-- Compliance Advisory Banner -->
      <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-800">
          <AlertTriangle class="w-4.5 h-4.5 text-yellow-500" />
          <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Advisori Kesiapan Dokumen</h3>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">
          Berdasarkan analisis crawler, 84% tender pemerintah bernilai di atas Rp 2 Miliar mewajibkan penyedia jasa melampirkan sertifikat kelayakan **ISO 9001** dan **ISO 27001**.
        </p>
        <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-300">Status Anda:</span>
          <span class="text-xs font-bold text-emerald-400">Siap & Lengkap (100%)</span>
        </div>
      </div>

    </div>

  </div>
</div>
