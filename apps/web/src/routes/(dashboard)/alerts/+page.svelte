<script lang="ts">
  import { onMount } from "svelte";
  import { Bell, ShieldAlert, CheckCircle, RefreshCw, Trash2, Calendar, Settings } from "lucide-svelte";

  let notifications = $state([
    {
      id: "1",
      title: "Tender Baru Cocok 94% dengan Profil Anda",
      message: "Pengadaan Jasa Asesmen Keamanan Informasi & Penetration Testing Aplikasi SPBE baru saja diterbitkan oleh Kementerian Kesehatan RI.",
      time: "10 menit yang lalu",
      type: "match",
      icon: CheckCircle,
      color: "text-emerald-400 bg-emerald-500/10",
      isRead: false
    },
    {
      id: "2",
      title: "Peringatan Batas Waktu Submit Dokumen",
      message: "Batas waktu untuk 'Pengadaan Lisensi Software Antivirus' tersisa 3 hari lagi. Pastikan jaminan penawaran sudah disiapkan.",
      time: "2 jam yang lalu",
      type: "deadline",
      icon: Calendar,
      color: "text-rose-400 bg-rose-500/10",
      isRead: false
    },
    {
      id: "3",
      title: "Perubahan Syarat Kualifikasi",
      message: "Adendum diterbitkan untuk 'Pembangunan Data Center Tier 3'. Ada penambahan syarat sertifikasi ISO 27001.",
      time: "1 hari yang lalu",
      type: "alert",
      icon: ShieldAlert,
      color: "text-yellow-400 bg-yellow-500/10",
      isRead: true
    },
    {
      id: "4",
      title: "Ringkasan Mingguan Tender",
      message: "Ada 12 tender baru di kategori IT & Cybersecurity minggu ini yang relevan dengan perusahaan Anda.",
      time: "3 hari yang lalu",
      type: "info",
      icon: Bell,
      color: "text-indigo-400 bg-indigo-500/10",
      isRead: true
    }
  ]);

  let isLoading = $state(false);

  function markAllRead() {
    notifications = notifications.map(n => ({ ...n, isRead: true }));
  }

  function deleteNotification(id: string) {
    notifications = notifications.filter(n => n.id !== id);
  }
</script>

<svelte:head>
  <title>Notifikasi & Alert | Tender Hunter</title>
</svelte:head>

<div class="space-y-8 animate-fadeIn select-none">
  <!-- Header Section -->
  <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
        Notifikasi & Alert
      </h1>
      <p class="text-sm text-slate-400 mt-1">Pembaruan real-time tentang tender baru, peringatan batas waktu, dan wawasan AI.</p>
    </div>
    
    <!-- Controls -->
    <div class="flex items-center gap-3">
      <button 
        onclick={markAllRead}
        class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-2"
      >
        <CheckCircle class="w-4 h-4" />
        Tandai Semua Dibaca
      </button>
      <button class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
        <Settings class="w-4 h-4" />
      </button>
    </div>
  </div>

  <!-- Notifications List -->
  <div class="space-y-4">
    {#if notifications.length === 0}
      <div class="p-12 rounded-2xl bg-slate-900 border border-slate-800 border-dashed text-center">
        <Bell class="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p class="text-slate-400 font-medium">Tidak ada notifikasi saat ini.</p>
      </div>
    {:else}
      {#each notifications as notif}
        <div class="p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 group 
          {notif.isRead ? 'bg-slate-900/50 border-slate-800/50 opacity-70' : 'bg-slate-900 border-slate-700 shadow-md'}">
          
          <div class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center {notif.color}">
            <notif.icon class="w-5 h-5" />
          </div>
          
          <div class="flex-1 space-y-1 mt-0.5">
            <div class="flex items-start justify-between gap-4">
              <h3 class="text-sm font-bold {notif.isRead ? 'text-slate-300' : 'text-slate-100'}">
                {notif.title}
              </h3>
              <span class="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{notif.time}</span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed pr-8">
              {notif.message}
            </p>
          </div>

          <div class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center self-center gap-2">
            <button 
              onclick={() => deleteNotification(notif.id)}
              class="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="Hapus notifikasi"
            >
              <Trash2 class="w-4 h-4" />
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
