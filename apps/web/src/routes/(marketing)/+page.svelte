<script lang="ts">
  import { Sparkles, Check, ArrowRight, ShieldCheck, Zap, HelpCircle } from "lucide-svelte";
  
  // SEO Meta
  const pageTitle = "Tender Hunter — Platform Intelijen Tender AI Pertama di Indonesia";
  const pageDesc = "Temukan tender LPSE, BUMN, & Swasta yang paling cocok dengan bisnis Anda secara instan menggunakan teknologi AI cerdas.";

  // Rencana Paket Harga Langganan
  const plans = [
    {
      id: "free",
      name: "Free Starter",
      price: "Rp0",
      period: "selamanya",
      desc: "Cocok untuk eksplorasi awal dan pemantauan dasar lelang.",
      features: [
        "1 Filter Aturan Peringatan (Alert Rule)",
        "Pencarian Kata Kunci (FTS Keyword)",
        "Batas 20 Pencarian per hari",
        "Notifikasi via Surat Elektronik (Email)",
        "Tidak termasuk analisis kecerdasan AI"
      ],
      btnText: "Mulai Gratis Sekarang",
      btnClass: "bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300",
      badge: ""
    },
    {
      id: "pro",
      name: "Business Pro",
      price: "Rp499.000",
      period: "bulan",
      desc: "Sangat direkomendasikan untuk Software House & Kontraktor aktif.",
      features: [
        "10 Filter Aturan Peringatan (Alert Rules)",
        "Pencarian Semantik pgvector (Kemiripan Makna)",
        "Executive AI Summary (Ringkasan Eksekutif lelang)",
        "Deteksi AI Risk Flags & Persyaratan Tersembunyi",
        "Notifikasi Instan Telegram Bot & Email 24/7",
        "Perhitungan Dinamis AI Match Score (0-100%)"
      ],
      btnText: "Upgrade ke Pro",
      btnClass: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95",
      badge: "Paling Populer"
    },
    {
      id: "enterprise",
      name: "Enterprise Prime",
      price: "Rp1.999.000",
      period: "bulan",
      desc: "Dirancang untuk korporasi besar dengan kebutuhan tender intensif.",
      features: [
        "Alert Rules Aktif Tidak Terbatas",
        "Seluruh Akses Fitur Kecerdasan AI Tak Terbatas",
        "Akses Custom API & Webhooks Terintegrasi",
        "Dukungan CS Prioritas 24/7 & KSO Matchmaker",
        "SLA Notifikasi Instan di bawah 5 Menit"
      ],
      btnText: "Hubungi Penjualan",
      btnClass: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20",
      badge: "Skala Besar"
    }
  ];

  // Simulasi data preview pencarian untuk keindahan estetika interaktif
  let searchQuery = "keamanan informasi";
  let activeTab = "lpse";

  const previewTenders = [
    {
      title: "Pengadaan Jasa Asesmen Keamanan Informasi & Penetration Testing Aplikasi SPBE",
      org: "Kementerian Kesehatan RI",
      budget: "Rp 1.450.000.000",
      score: 94,
      category: "IT/Cybersecurity"
    },
    {
      title: "Pengembangan Sistem Informasi Layanan Terintegrasi & Pengadaan Cloud",
      org: "Kementerian Pendidikan dan Kebudayaan",
      budget: "Rp 4.800.000.000",
      score: 87,
      category: "IT/Software"
    }
  ];
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDesc} />
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
  
  <!-- Glowing Background Orbs -->
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
  <div class="absolute top-[800px] left-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
  <div class="absolute top-[1600px] right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style="animation-delay: 3s;"></div>

  <!-- Header / Navigation -->
  <header class="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-900/60 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span class="font-extrabold text-xl tracking-tighter text-white">T</span>
        </div>
        <span class="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Tender Hunter</span>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <a href="#features" class="hover:text-white transition-colors">Fitur Utama</a>
        <a href="#preview" class="hover:text-white transition-colors">Preview AI</a>
        <a href="#pricing" class="hover:text-white transition-colors">Harga Paket</a>
        <a href="#faq" class="hover:text-white transition-colors">Bantuan</a>
      </nav>

      <div class="flex items-center gap-4">
        <a href="/dashboard" class="text-sm font-bold text-slate-400 hover:text-white transition-colors">Masuk</a>
        <a href="/onboarding" class="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold hover:bg-indigo-500 transition-all duration-300 shadow-md shadow-indigo-600/20 active:scale-95">
          <span class="relative z-10">Coba Gratis</span>
          <div class="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-purple-600 to-indigo-600 transition-transform duration-300 -z-0"></div>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center relative">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-indigo-400 mb-8 shadow-sm">
      <span class="flex h-2 w-2 relative">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
      </span>
      Kini Hadir di Indonesia: AI-Driven Procurement SaaS
    </div>

    <!-- SEO Best Practices: Single H1 on Page -->
    <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-8 text-white">
      Menangkan Tender Lebih Cepat Menggunakan <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Kecerdasan AI</span>
    </h1>

    <p class="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
      Tender Hunter memindai ratusan portal LPSE secara *real-time*, mengekstrak syarat kualifikasi lelang secara cerdas, dan memicu notifikasi instan langsung ke Telegram Anda.
    </p>

    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
      <a href="/onboarding" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 font-bold text-sm hover:bg-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group active:scale-[0.98]">
        Mulai Onboarding AI
        <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
      <a href="#pricing" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 font-bold text-sm hover:bg-slate-850 hover:border-slate-700 transition-all duration-300 flex items-center justify-center gap-2">
        Lihat Harga Paket
      </a>
    </div>

    <!-- Interactive AI Dashboard Mockup Preview -->
    <div id="preview" class="relative max-w-5xl mx-auto rounded-3xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm shadow-2xl shadow-indigo-500/5 group">
      <div class="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10"></div>
      
      <!-- Inside Interactive mockup browser -->
      <div class="w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-900 relative flex flex-col text-left">
        <!-- Mockup Browser Header Bar -->
        <div class="h-12 border-b border-slate-900 bg-slate-900/40 px-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
          </div>
          <div class="w-80 bg-slate-950 border border-slate-900 rounded-lg py-1 px-3 text-[10px] text-slate-500 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            https://app.tenderhunter.id/dashboard
          </div>
          <div class="w-8"></div>
        </div>
        
        <!-- Mockup Content -->
        <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2 space-y-4">
            <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-widest">Rekomendasi Tender AI Hari Ini</h3>
            
            {#each previewTenders as tender}
              <div class="p-5 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between gap-4">
                <div class="space-y-2">
                  <span class="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-bold">{tender.org}</span>
                  <h4 class="text-xs font-extrabold text-white leading-relaxed">{tender.title}</h4>
                  <p class="text-[10px] text-slate-500">Nilai HPS: <strong class="text-slate-300">{tender.budget}</strong></p>
                </div>
                <!-- AI Circular score mockup -->
                <div class="shrink-0 w-14 h-14 rounded-full border border-slate-800 bg-slate-950 flex flex-col items-center justify-center">
                  <span class="text-xs font-black text-emerald-400">{tender.score}%</span>
                  <span class="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">Match</span>
                </div>
              </div>
            {/each}
          </div>
          
          <div class="space-y-4">
            <h3 class="text-xs font-bold text-purple-400 uppercase tracking-widest">Kecocokan AI</h3>
            <div class="p-5 rounded-2xl bg-gradient-to-tr from-indigo-950/20 to-purple-950/20 border border-indigo-900/20 space-y-3">
              <h4 class="text-xs font-bold text-slate-200">IT & Cybersecurity Niche</h4>
              <p class="text-[10px] text-slate-400 leading-relaxed">
                Algoritma AI sedang memantau secara aktif proyek pembangunan aplikasi, penetration testing, ISO 27001, & audit keamanan siber secara terus menerus.
              </p>
              <div class="flex flex-wrap gap-1 pt-1">
                <span class="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[8px] text-slate-400 font-bold">ISO 27001</span>
                <span class="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[8px] text-slate-400 font-bold">Pentest</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-24 border-t border-slate-900/60 bg-slate-950 relative">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center max-w-3xl mx-auto mb-20">
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">Fitur Unggulan Intelijen Pengadaan</h2>
        <p class="text-slate-400">Kami merancang platform cerdas terlengkap di Indonesia untuk melipatgandakan peluang kesuksesan tender Anda.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="p-8 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-slate-800 hover:bg-slate-900 transition-all duration-300 group">
          <div class="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
            <Zap class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-bold mb-3 text-slate-100">Pemindaian Real-Time 24/7</h3>
          <p class="text-slate-400 leading-relaxed text-sm">
            Robot kami memindai ratusan portal LPSE instansi kabupaten, kota, provinsi, hingga kementerian secara terus menerus agar Anda menjadi yang pertama tahu.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="p-8 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-slate-800 hover:bg-slate-900 transition-all duration-300 group">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-bold mb-3 text-slate-100">AI Match & Risk Analysis</h3>
          <p class="text-slate-400 leading-relaxed text-sm">
            AI membandingkan profil kualifikasi badan usaha Anda dengan lelang, mendeteksi risiko lelang yang tersembunyi, dan memberikan skor kelayakan kemenangan secara instan.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="p-8 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-slate-800 hover:bg-slate-900 transition-all duration-300 group">
          <div class="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
            <Sparkles class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-bold mb-3 text-slate-100">Notifikasi Telegram Instan</h3>
          <p class="text-slate-400 leading-relaxed text-sm">
            Tender terpilih dikirimkan secara instan langsung ke grup Telegram tim sales Anda lengkap dengan detail pagu, dokumen syarat, dan link satu ketukan.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing / Paket Harga Section -->
  <section id="pricing" class="py-24 border-t border-slate-900 bg-slate-950 relative">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center max-w-3xl mx-auto mb-20">
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">Pilihan Paket Langganan SaaS</h2>
        <p class="text-slate-400">Pilih rencana terbaik untuk melipatgandakan produktivitas pencarian tender bisnis Anda.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {#each plans as plan}
          <div class="p-8 rounded-3xl bg-slate-900/50 border flex flex-col justify-between relative group transition-all duration-300
            {plan.id === 'pro' 
              ? 'border-indigo-500 bg-slate-900 shadow-xl shadow-indigo-500/5 scale-105 z-10' 
              : 'border-slate-900 hover:border-slate-800 hover:bg-slate-900'}">
            
            {#if plan.badge}
              <span class="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md">
                {plan.badge}
              </span>
            {/if}

            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-bold text-slate-200">{plan.name}</h3>
                <p class="text-xs text-slate-500 mt-2 leading-relaxed">{plan.desc}</p>
              </div>

              <!-- Price tag -->
              <div class="flex items-baseline gap-1.5 border-b border-slate-850/60 pb-6">
                <span class="text-3xl font-black text-white tracking-tight">{plan.price}</span>
                <span class="text-xs text-slate-500 font-bold">/ {plan.period}</span>
              </div>

              <!-- Feature list -->
              <ul class="space-y-4 py-2">
                {#each plan.features as feat}
                  <li class="flex items-start gap-3 text-xs text-slate-300">
                    <Check class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                {/each}
              </ul>
            </div>

            <!-- Action Button -->
            <a href="/onboarding" class="w-full text-center py-3.5 rounded-xl font-bold text-xs mt-8 transition-all flex items-center justify-center gap-1.5 {plan.btnClass}">
              {plan.btnText}
              <ArrowRight class="w-3.5 h-3.5" />
            </a>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Help & FAQ Section -->
  <section id="faq" class="py-24 border-t border-slate-900 bg-slate-950 relative">
    <div class="max-w-4xl mx-auto px-6">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold tracking-tight mb-4 text-white">Pertanyaan yang Sering Diajukan</h2>
        <p class="text-slate-400">Butuh info lebih lanjut? Temukan jawabannya di bawah ini.</p>
      </div>

      <div class="space-y-6">
        <div class="p-6 rounded-2xl bg-slate-900/40 border border-slate-850 space-y-2.5">
          <h3 class="text-sm font-bold text-slate-200 flex items-center gap-2">
            <HelpCircle class="w-4.5 h-4.5 text-indigo-400" />
            Bagaimana sistem AI menghitung Match Score lelang?
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            AI kami membandingkan data kualifikasi lelang yang diekstrak (sertifikasi mutu wajib, kapasitas budget proyek, kapabilitas khusus) secara mendalam terhadap preferensi data profil badan usaha organisasi Anda untuk merumuskan skor kecocokan real-time (0-100%).
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-slate-900/40 border border-slate-850 space-y-2.5">
          <h3 class="text-sm font-bold text-slate-200 flex items-center gap-2">
            <HelpCircle class="w-4.5 h-4.5 text-indigo-400" />
            Apakah aman mengintegrasikan webhook notifikasi ke Telegram?
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Sangat aman. Notifikasi dikirimkan menggunakan bot Telegram resmi dan terisolasi. Pesan hanya dapat dikirim jika Anda menyimpan Chat ID Telegram yang valid di pengaturan aturan alert peringatan Anda.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-12 border-t border-slate-900 bg-slate-950 text-slate-500 text-sm">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
          <span>T</span>
        </div>
        <span class="font-bold text-white">Tender Hunter</span>
      </div>
      <div>
        &copy; 2026 Tender Hunter. Hak Cipta Dilindungi. Platform Cerdas Tender Indonesia.
      </div>
    </div>
  </footer>
</div>

<style>
  /* Custom smooth scroll behaviors */
  :global(html) {
    scroll-behavior: smooth;
  }
</style>
