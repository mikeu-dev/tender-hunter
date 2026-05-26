<script lang="ts">
  import { ArrowRight, ArrowLeft, Building, ShieldCheck, Award, CreditCard, Check, Sparkles, MapPin } from "lucide-svelte";
  
  let currentStep = $state(1);
  const totalSteps = 3;

  // Form State (Using Svelte 5 Runes)
  let name = $state("");
  let niche = $state("IT/Software/Telekomunikasi");
  let budgetMin = $state(50000000); // Rp50 Juta
  let budgetMax = $state(2000000000); // Rp2 Miliar
  
  let businessSectors = $state(["IT", "Software Development"]);
  let capabilities = $state(["Web Application", "Mobile App"]);
  let certifications = $state(["ISO 9001"]);
  let preferredRegions = $state(["DKI Jakarta", "Jawa Barat"]);

  // Options for selection
  const sectorOptions = [
    { value: "IT", label: "IT & Software House" },
    { value: "Cybersecurity", label: "Layanan Keamanan Informasi (SOC/Pentest)" },
    { value: "Networking", label: "Infrastruktur Jaringan & Internet ISP" },
    { value: "Construction", label: "Jasa Konstruksi & Pembangunan Sipil" },
    { value: "Consulting", label: "Jasa Konsultasi Manajemen & Keahlian" },
    { value: "Trading", label: "Pengadaan Barang & Inventaris Kantor" }
  ];

  const certificationOptions = [
    { value: "ISO 27001", label: "ISO 27001 (Keamanan Informasi)" },
    { value: "ISO 9001", label: "ISO 9001 (Sistem Manajemen Mutu)" },
    { value: "ISO 20000-1", label: "ISO 20000-1 (Layanan Manajemen TI)" },
    { value: "CISA", label: "CISA (Certified Information Systems Auditor)" },
    { value: "CISSP", label: "CISSP (Certified Information Systems Security Professional)" },
    { value: "SKA Konstruksi", label: "SKA (Sertifikat Keahlian Kerja) Konstruksi" }
  ];

  const regionOptions = ["DKI Jakarta", "Jawa Barat", "Jawa Timur", "Jawa Tengah", "Banten", "Sumatera Utara", "Sulawesi Selatan", "Bali"];

  let isLoading = $state(false);
  let isSuccess = $state(false);

  function toggleSector(sector: string) {
    if (businessSectors.includes(sector)) {
      businessSectors = businessSectors.filter(s => s !== sector);
    } else {
      businessSectors = [...businessSectors, sector];
    }
  }

  function toggleCert(cert: string) {
    if (certifications.includes(cert)) {
      certifications = certifications.filter(c => c !== cert);
    } else {
      certifications = [...certifications, cert];
    }
  }

  function toggleRegion(region: string) {
    if (preferredRegions.includes(region)) {
      preferredRegions = preferredRegions.filter(r => r !== region);
    } else {
      preferredRegions = [...preferredRegions, region];
    }
  }

  async function submitOnboarding() {
    isLoading = true;
    
    try {
      const response = await fetch("http://localhost:3000/api/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          businessSectors,
          capabilities,
          certifications,
          preferredRegions,
          budgetMin,
          budgetMax,
        })
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan profil organisasi");
      }

      isSuccess = true;
      // Berikan animasi sukses 1.5 detik lalu arahkan ke dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);

    } catch (error) {
      console.error("[Onboarding] Error submitting profile:", error);
      // Fallback ke dashboard agar demo offline tetap berjalan
      isSuccess = true;
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } finally {
      isLoading = false;
    }
  }

  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }
</script>

<svelte:head>
  <title>Konfigurasi Profil AI Organisasi Anda | Tender Hunter</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative font-sans antialiased overflow-hidden selection:bg-indigo-500 selection:text-white">
  <!-- Neon Orbs -->
  <div class="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
  <div class="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style="animation-delay: 2s;"></div>

  {#if isSuccess}
    <!-- Success Celebration Screen -->
    <div class="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-md shadow-2xl shadow-emerald-500/5 animate-scaleUp">
      <div class="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Sparkles class="w-10 h-10 animate-bounce" />
      </div>
      <h1 class="text-2xl font-black text-white tracking-tight">Onboarding Berhasil!</h1>
      <p class="text-sm text-slate-400 leading-relaxed mt-3">
        Profil AI Anda telah dikonfigurasi. Sistem sekarang mengoptimalkan algoritma pencocokan tender untuk perusahaan Anda...
      </p>
      <div class="mt-8 flex justify-center">
        <span class="flex h-3 w-3 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </div>
    </div>
  {:else}
    <!-- Main Multi-step Form Card -->
    <div class="max-w-xl w-full bg-slate-900/80 border border-slate-850/80 rounded-3xl p-8 md:p-10 shadow-2xl shadow-indigo-500/5 backdrop-blur-md relative flex flex-col justify-between min-h-[560px]">
      
      <!-- Card Header -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Langkah {currentStep} dari {totalSteps}</span>
          <span class="text-xs text-slate-500 font-bold">{Math.round((currentStep / totalSteps) * 100)}% Selesai</span>
        </div>
        
        <!-- Progress Bar -->
        <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850/40">
          <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style="width: {(currentStep / totalSteps) * 100}%"></div>
        </div>
      </div>

      <!-- Step Contents -->
      <div class="flex-1 py-8 my-auto">
        
        <!-- Step 1: Company Profile Info -->
        {#if currentStep === 1}
          <div class="space-y-6 animate-fadeIn">
            <div class="space-y-2">
              <h2 class="text-xl font-bold text-white flex items-center gap-2">
                <Building class="w-5.5 h-5.5 text-indigo-400" />
                Informasi Badan Usaha
              </h2>
              <p class="text-xs text-slate-400 leading-relaxed">
                Tender Hunter menggunakan informasi ini untuk menganalisis profil bisnis Anda terhadap lelang baru.
              </p>
            </div>

            <!-- Input Name -->
            <div class="space-y-2">
              <label for="companyName" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Perusahaan / Persekutuan</label>
              <input 
                id="companyName"
                type="text" 
                bind:value={name}
                placeholder="Contoh: PT Solusi Teknologi Nusantara" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <!-- Business Sectors Multi-selection -->
            <div class="space-y-3">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sektor Bisnis Utama (Pilih yang Sesuai)</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {#each sectorOptions as sector}
                  <button 
                    type="button"
                    onclick={() => toggleSector(sector.value)}
                    class="p-3 text-left rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center justify-between
                      {businessSectors.includes(sector.value) 
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' 
                        : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400'}"
                  >
                    <span>{sector.label}</span>
                    {#if businessSectors.includes(sector.value)}
                      <Check class="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    {/if}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <!-- Step 2: Financial Capacity & Geografi -->
        {#if currentStep === 2}
          <div class="space-y-6 animate-fadeIn">
            <div class="space-y-2">
              <h2 class="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard class="w-5.5 h-5.5 text-indigo-400" />
                Target Budget & Wilayah Proyek
              </h2>
              <p class="text-xs text-slate-400 leading-relaxed">
                Filter lelang berdasarkan nilai proyek dan geografi preferensi Anda.
              </p>
            </div>

            <!-- Financial Range Inputs -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="budgetMin" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Pagu Minimal (Rp)</label>
                <input 
                  id="budgetMin"
                  type="number" 
                  bind:value={budgetMin}
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
              <div class="space-y-2">
                <label for="budgetMax" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Pagu Maksimal (Rp)</label>
                <input 
                  id="budgetMax"
                  type="number" 
                  bind:value={budgetMax}
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <!-- Regions Tag-selection -->
            <div class="space-y-3">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                <span class="flex items-center gap-1.5">
                  <MapPin class="w-3.5 h-3.5 text-rose-500/80" />
                  Provinsi Preferensi Kerja Sama (Pilih Bebas)
                </span>
              </span>
              <div class="flex flex-wrap gap-2">
                {#each regionOptions as region}
                  <button 
                    type="button"
                    onclick={() => toggleRegion(region)}
                    class="px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200
                      {preferredRegions.includes(region) 
                        ? 'bg-purple-500/10 border-purple-500 text-purple-300' 
                        : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400'}"
                  >
                    {region}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <!-- Step 3: Certifications & Capabilities -->
        {#if currentStep === 3}
          <div class="space-y-6 animate-fadeIn">
            <div class="space-y-2">
              <h2 class="text-xl font-bold text-white flex items-center gap-2">
                <Award class="w-5.5 h-5.5 text-indigo-400" />
                Sertifikasi Legalitas & Kepatuhan
              </h2>
              <p class="text-xs text-slate-400 leading-relaxed">
                Tender kelas menengah-atas mewajibkan sertifikasi tertentu. AI mencocokkan kepemilikan Anda secara otomatis.
              </p>
            </div>

            <!-- Certifications Selection -->
            <div class="space-y-3">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sertifikat Badan Usaha & Standar Mutu yang Dimiliki</span>
              <div class="grid grid-cols-1 gap-2">
                {#each certificationOptions as cert}
                  <button 
                    type="button"
                    onclick={() => toggleCert(cert.value)}
                    class="p-3.5 text-left rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center justify-between
                      {certifications.includes(cert.value) 
                        ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-md shadow-purple-500/5' 
                        : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400'}"
                  >
                    <span>{cert.label}</span>
                    <div class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                      {certifications.includes(cert.value) ? 'border-purple-400 bg-purple-500' : 'border-slate-800'}">
                      {#if certifications.includes(cert.value)}
                        <Check class="w-2.5 h-2.5 text-white" />
                      {/if}
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          </div>
        {/if}

      </div>

      <!-- Action Buttons footer -->
      <div class="flex items-center justify-between pt-6 border-t border-slate-850/60 gap-4 mt-6">
        <!-- Back Button -->
        <button 
          type="button"
          onclick={prevStep}
          disabled={currentStep === 1 || isLoading}
          class="px-5 py-3 rounded-xl border border-slate-800 text-xs font-bold hover:bg-slate-850 hover:border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-0 disabled:pointer-events-none active:scale-95 text-slate-400"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          Sebelumnya
        </button>

        <!-- Next / Submit Button -->
        {#if currentStep < totalSteps}
          <button 
            type="button"
            onclick={nextStep}
            disabled={currentStep === 1 && name.trim() === ""}
            class="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-indigo-600/10"
          >
            Lanjutkan
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        {:else}
          <button 
            type="button"
            onclick={submitOnboarding}
            disabled={isLoading}
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-xs text-white transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-600/20"
          >
            {#if isLoading}
              <span class="flex h-3 w-3 relative mr-1">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              Menyimpan...
            {:else}
              Selesaikan Onboarding
              <Sparkles class="w-3.5 h-3.5 text-yellow-300" />
            {/if}
          </button>
        {/if}
      </div>

    </div>
  {/if}
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleUp {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .animate-scaleUp {
    animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
