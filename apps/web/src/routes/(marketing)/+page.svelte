<script lang="ts">
  // Modern Landing Page for Tender Hunter
</script>

<svelte:head>
  <title>Tender Hunter — Platform Intelijen Tender AI Pertama di Indonesia</title>
  <meta name="description" content="Temukan tender LPSE, BUMN, & Swasta yang paling cocok dengan bisnis Anda secara instan menggunakan teknologi AI cerdas." />
</svelte:head>

<div class="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
  <!-- Glowing Background Effects -->
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
  <div class="absolute top-[800px] left-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
  <div class="absolute top-[1200px] right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

  <!-- Header -->
  <header class="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-900 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span class="font-extrabold text-xl tracking-tighter">T</span>
        </div>
        <span class="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Tender Hunter</span>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        <a href="#features" class="hover:text-white transition-colors">Fitur Utama</a>
        <a href="#niche" class="hover:text-white transition-colors">Niche Spesifik</a>
        <a href="#pricing" class="hover:text-white transition-colors">Harga Paket</a>
        <a href="#faq" class="hover:text-white transition-colors">Tanya Jawab</a>
      </nav>

      <div class="flex items-center gap-4">
        <a href="/login" class="text-sm font-medium text-slate-300 hover:text-white transition-colors">Masuk</a>
        <a href="/dashboard" class="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold hover:bg-indigo-500 transition-all duration-300 shadow-md shadow-indigo-600/20 active:scale-95">
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
      Kini Hadir di Indonesia: AI-Driven Procurement Intelligence
    </div>

    <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-8">
      Menangkan Tender Lebih Mudah Dengan <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Kekuatan AI</span>
    </h1>

    <p class="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
      Tender Hunter memindai ratusan portal LPSE 24/7, menganalisis syarat dokumen, lalu memberikan skor kecocokan otomatis untuk bisnis Anda. Bebas lelah, hemat waktu.
    </p>

    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
      <a href="/dashboard" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 font-semibold hover:bg-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group active:scale-[0.98]">
        Mulai Cari Tender
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </a>
      <a href="#features" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 font-semibold hover:bg-slate-850 hover:border-slate-700 transition-all duration-300 flex items-center justify-center gap-2">
        Pelajari Fitur
      </a>
    </div>

    <!-- Hero Image Mockup -->
    <div class="relative max-w-5xl mx-auto rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm shadow-2xl shadow-indigo-500/5 group">
      <div class="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10"></div>
      <div class="w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-900 relative flex flex-col items-center justify-center text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500/40 mb-4 animate-pulse"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M21 9H3"/><path d="M21 15H3"/><path d="M12 3v18"/></svg>
        <span class="text-sm font-semibold tracking-wide uppercase text-slate-400">Interactive AI Dashboard Preview</span>
        <span class="text-xs text-slate-600 mt-2">Dapatkan info tender terpilih, skor kesiapan, dan notifikasi instan</span>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-24 border-t border-slate-900 bg-slate-950 relative">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center max-w-3xl mx-auto mb-20">
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight mb-4">Fitur Utama Yang Memenangkan Kontrak</h2>
        <p class="text-slate-400">Teknologi intelijen pengadaan kami dirancang untuk membawa Anda satu langkah di depan para pesaing.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="p-8 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-slate-800 hover:bg-slate-900 transition-all duration-300 group">
          <div class="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </div>
          <h3 class="text-xl font-bold mb-3">Monitoring 24/7 LPSE</h3>
          <p class="text-slate-400 leading-relaxed text-sm">
            Robot kami memantau ratusan portal LPSE kabupaten/kota & kementerian terus-menerus. Dapatkan alert tender baru dalam waktu kurang dari 15 menit.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="p-8 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-slate-800 hover:bg-slate-900 transition-all duration-300 group">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <h3 class="text-xl font-bold mb-3">AI Match Scoring</h3>
          <p class="text-slate-400 leading-relaxed text-sm">
            Berdasarkan profil bisnis, sertifikasi, kualifikasi, & historis proyek Anda, AI kami memprediksi kecocokan dan risiko kegagalan tender secara instan.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="p-8 rounded-2xl bg-slate-900/50 border border-slate-900 hover:border-slate-800 hover:bg-slate-900 transition-all duration-300 group">
          <div class="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <h3 class="text-xl font-bold mb-3">Notifikasi Multi-Channel</h3>
          <p class="text-slate-400 leading-relaxed text-sm">
            Kirimkan peluang emas secara otomatis ke grup Telegram tim sales Anda lengkap dengan ringkasan syarat & link akses satu ketukan.
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
