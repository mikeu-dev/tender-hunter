<script lang="ts">
  import { onMount } from "svelte";
  import { Building2, Save, Plus, X, Shield, Award, MapPin } from "lucide-svelte";

  let isLoading = $state(true);
  let isSaving = $state(false);
  let feedbackMessage = $state("");
  let feedbackType = $state<"success" | "error" | "">("");

  // Company profile form data state
  let profile = $state({
    name: "",
    teamSize: "",
    budgetMin: "",
    budgetMax: "",
    businessSectors: [] as string[],
    certifications: [] as string[],
    preferredRegions: [] as string[],
    capabilities: [] as string[],
  });

  // Local state for array inputs
  let newSector = $state("");
  let newCert = $state("");
  let newRegion = $state("");
  let newCap = $state("");

  // Pre-configured tags for quick insertion
  const suggestedSectors = ["Cybersecurity", "Software House", "MSP", "Consulting", "System Integrator", "Cloud Service Provider"];
  const suggestedCerts = ["ISO 27001", "ISO 9001", "CISA", "CEH", "CISSP", "PMP"];
  const suggestedRegions = ["DKI Jakarta", "Jawa Barat", "Jawa Timur", "Banten", "Jawa Tengah", "Sumatera Utara"];

  onMount(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/company", {
        headers: { "Content-Type": "application/json" },
      });
      
      if (res.ok) {
        const data = await res.json();
        profile.name = data.name || "";
        profile.teamSize = data.teamSize?.toString() || "";
        profile.budgetMin = data.budgetMin?.toString() || "";
        profile.budgetMax = data.budgetMax?.toString() || "";
        profile.businessSectors = data.businessSectors || [];
        profile.certifications = data.certifications || [];
        profile.preferredRegions = data.preferredRegions || [];
        profile.capabilities = data.capabilities || [];
      } else {
        // Safe fallback - org not created yet
        console.log("No organization profile found, ready to create one!");
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    } finally {
      isLoading = false;
    }
  });

  async function handleSave(e: Event) {
    e.preventDefault();
    isSaving = true;
    feedbackMessage = "";
    
    try {
      const res = await fetch("http://localhost:3000/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        feedbackMessage = "Profil perusahaan berhasil diperbarui!";
        feedbackType = "success";
      } else {
        const data = await res.json();
        feedbackMessage = data.error || "Gagal memperbarui profil.";
        feedbackType = "error";
      }
    } catch (err) {
      feedbackMessage = "Koneksi ke server API gagal.";
      feedbackType = "error";
    } finally {
      isSaving = false;
      setTimeout(() => {
        feedbackMessage = "";
        feedbackType = "";
      }, 5000);
    }
  }

  // Array add/remove handlers
  function addToArray(key: 'businessSectors' | 'certifications' | 'preferredRegions' | 'capabilities', value: string) {
    const trimmed = value.trim();
    if (trimmed && !profile[key].includes(trimmed)) {
      profile[key] = [...profile[key], trimmed];
    }
  }

  function removeFromArray(key: 'businessSectors' | 'certifications' | 'preferredRegions' | 'capabilities', index: number) {
    profile[key] = profile[key].filter((_, i) => i !== index);
  }
</script>

<svelte:head>
  <title>Profil Perusahaan | Tender Hunter</title>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-8 select-none">
  <!-- Heading Header -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
        <Building2 class="w-6 h-6" />
      </div>
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-white">Profil Perusahaan</h1>
        <p class="text-sm text-slate-400 mt-1">Sesuaikan kompetensi, sertifikasi, & preferensi regional Anda untuk kalkulasi akurasi kecocokan AI.</p>
      </div>
    </div>
  </div>

  {#if isLoading}
    <div class="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
      <div class="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
      <span class="text-xs font-semibold">Memuat profil organisasi...</span>
    </div>
  {:else}
    <form onsubmit={handleSave} class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Form Area -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Info Card -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <h2 class="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Building2 class="w-4 h-4 text-indigo-400" />
            Informasi Pokok
          </h2>
          
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Perusahaan</label>
              <input 
                id="name"
                type="text" 
                bind:value={profile.name}
                required
                placeholder="Contoh: PT Solusi Siber Indonesia" 
                class="w-full px-4 py-3 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="team-size" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ukuran Tim (Karyawan)</label>
                <input 
                  id="team-size"
                  type="number" 
                  bind:value={profile.teamSize}
                  placeholder="Contoh: 25" 
                  class="w-full px-4 py-3 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
                />
              </div>

              <div>
                <label for="budget-min" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Budget Min (Rp)</label>
                <input 
                  id="budget-min"
                  type="number" 
                  bind:value={profile.budgetMin}
                  placeholder="Contoh: 100000000" 
                  class="w-full px-4 py-3 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
                />
              </div>

              <div>
                <label for="budget-max" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Budget Max (Rp)</label>
                <input 
                  id="budget-max"
                  type="number" 
                  bind:value={profile.budgetMax}
                  placeholder="Contoh: 5000000000" 
                  class="w-full px-4 py-3 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Competence & Capabilities Card -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <h2 class="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Shield class="w-4 h-4 text-purple-400" />
            Sektor Bisnis & Kapabilitas Utama
          </h2>

          <!-- Business Sectors -->
          <div class="space-y-3">
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Sektor Bisnis Perusahaan</label>
            
            <!-- Array Input -->
            <div class="flex gap-2">
              <input 
                type="text" 
                bind:value={newSector}
                placeholder="Tambahkan sektor..." 
                class="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button 
                type="button" 
                onclick={() => { addToArray('businessSectors', newSector); newSector = ""; }}
                class="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-white transition-colors active:scale-95"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>

            <!-- Tags Display -->
            <div class="flex flex-wrap gap-2 pt-1">
              {#each profile.businessSectors as sector, i}
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-xs font-bold text-indigo-400 animate-fadeIn">
                  {sector}
                  <button type="button" onclick={() => removeFromArray('businessSectors', i)} class="hover:text-red-400 transition-colors">
                    <X class="w-3.5 h-3.5" />
                  </button>
                </span>
              {/each}
            </div>

            <!-- Quick Suggestions -->
            <div class="pt-2">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Rekomendasi:</span>
              <div class="flex flex-wrap gap-1.5">
                {#each suggestedSectors as sugg}
                  {#if !profile.businessSectors.includes(sugg)}
                    <button 
                      type="button" 
                      onclick={() => addToArray('businessSectors', sugg)}
                      class="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800/80 text-[11px] text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      + {sugg}
                    </button>
                  {/if}
                {/each}
              </div>
            </div>
          </div>

          <!-- Capabilities -->
          <div class="space-y-3 pt-3">
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Keahlian / Kapabilitas Teknis Spesifik</label>
            
            <div class="flex gap-2">
              <input 
                type="text" 
                bind:value={newCap}
                placeholder="Contoh: Penetration Testing, SOC Operations, Mobile Dev..." 
                class="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none"
              />
              <button 
                type="button" 
                onclick={() => { addToArray('capabilities', newCap); newCap = ""; }}
                class="px-4 py-2.5 rounded-xl bg-slate-850 border border-slate-800 text-indigo-400 hover:text-white transition-colors"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>

            <div class="flex flex-wrap gap-2 pt-1">
              {#each profile.capabilities as cap, i}
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/25 text-xs font-bold text-purple-400">
                  {cap}
                  <button type="button" onclick={() => removeFromArray('capabilities', i)} class="hover:text-red-400 transition-colors">
                    <X class="w-3.5 h-3.5" />
                  </button>
                </span>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Right/Sidebar Form Options (Certifications and Region) -->
      <div class="space-y-6">
        <!-- Certifications Card -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <h2 class="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Award class="w-4 h-4 text-yellow-500" />
            Sertifikasi Perusahaan
          </h2>

          <div class="space-y-3">
            <div class="flex gap-2">
              <input 
                type="text" 
                bind:value={newCert}
                placeholder="Contoh: ISO 27001..." 
                class="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none"
              />
              <button 
                type="button" 
                onclick={() => { addToArray('certifications', newCert); newCert = ""; }}
                class="px-4 py-2.5 rounded-xl bg-slate-850 border border-slate-800 text-indigo-400 hover:text-white transition-colors"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>

            <div class="flex flex-wrap gap-2 pt-1">
              {#each profile.certifications as cert, i}
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/25 text-xs font-bold text-yellow-500">
                  {cert}
                  <button type="button" onclick={() => removeFromArray('certifications', i)} class="hover:text-red-400">
                    <X class="w-3.5 h-3.5" />
                  </button>
                </span>
              {/each}
            </div>

            <div class="flex flex-wrap gap-1.5 pt-2">
              {#each suggestedCerts as sugg}
                {#if !profile.certifications.includes(sugg)}
                  <button 
                    type="button" 
                    onclick={() => addToArray('certifications', sugg)}
                    class="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800/80 text-[10px] text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    + {sugg}
                  </button>
                {/if}
              {/each}
            </div>
          </div>
        </div>

        <!-- Regions Preference Card -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <h2 class="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <MapPin class="w-4 h-4 text-green-500" />
            Preferensi Regional
          </h2>

          <div class="space-y-3">
            <div class="flex gap-2">
              <input 
                type="text" 
                bind:value={newRegion}
                placeholder="Contoh: Jawa Barat..." 
                class="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none"
              />
              <button 
                type="button" 
                onclick={() => { addToArray('preferredRegions', newRegion); newRegion = ""; }}
                class="px-4 py-2.5 rounded-xl bg-slate-850 border border-slate-800 text-indigo-400 hover:text-white transition-colors"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>

            <div class="flex flex-wrap gap-2 pt-1">
              {#each profile.preferredRegions as region, i}
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-xs font-bold text-green-400">
                  {region}
                  <button type="button" onclick={() => removeFromArray('preferredRegions', i)} class="hover:text-red-400">
                    <X class="w-3.5 h-3.5" />
                  </button>
                </span>
              {/each}
            </div>

            <div class="flex flex-wrap gap-1.5 pt-2">
              {#each suggestedRegions as sugg}
                {#if !profile.preferredRegions.includes(sugg)}
                  <button 
                    type="button" 
                    onclick={() => addToArray('preferredRegions', sugg)}
                    class="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800/80 text-[10px] text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    + {sugg}
                  </button>
                {/if}
              {/each}
            </div>
          </div>
        </div>

        <!-- Submit Button Panel -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <button 
            type="submit" 
            disabled={isSaving}
            class="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 text-white font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md shadow-indigo-600/10 cursor-pointer active:scale-[0.98]"
          >
            {#if isSaving}
              <div class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              <span>Menyimpan...</span>
            {:else}
              <Save class="w-4.5 h-4.5" />
              <span>Simpan Profil</span>
            {/if}
          </button>

          {#if feedbackMessage}
            <div 
              class="p-4 rounded-xl border text-xs font-bold animate-fadeIn
                {feedbackType === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'}"
            >
              {feedbackMessage}
            </div>
          {/if}
        </div>
      </div>
    </form>
  {/if}
</div>

<style>
  :global(.animate-fadeIn) {
    animation: fadeIn 0.25s ease-out forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
