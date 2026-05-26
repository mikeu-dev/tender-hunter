import { openai, isMockAi } from './client.js';

export interface SummaryRiskResult {
  aiSummary: string;
  aiRiskFlags: Array<{ severity: 'high' | 'medium' | 'low'; description: string; category: string }>;
  aiHiddenRequirements: string[];
}

/**
 * Menganalisis dokumen/kualifikasi tender untuk menghasilkan ringkasan eksekutif,
 * mendeteksi persyaratan tersembunyi yang memberatkan, serta mendeteksi risiko lelang.
 */
export async function analyzeSummaryAndRisks(title: string, qualification: string, rawText: string): Promise<SummaryRiskResult> {
  if (isMockAi || !openai) {
    return generateMockSummaryAndRisks(title, qualification);
  }

  try {
    const prompt = `
Anda adalah konsultan risiko bisnis dan ahli hukum pengadaan tender.
Tugas Anda adalah membaca data tender berikut dan melakukan analisis risiko serta menghasilkan ringkasan eksekutif.

Judul Tender: "${title}"
Kualifikasi Terbuka: "${qualification}"
Detail Teks Mentah:
"""
${rawText.slice(0, 10000)}
"""

Hasilkan output JSON dengan struktur berikut:
{
  "aiSummary": "Ringkasan eksekutif 1 paragraf (maksimal 4 kalimat) dalam Bahasa Indonesia yang menjelaskan tujuan tender, instansi pembuat, dan apa yang harus diserahkan oleh peserta secara umum.",
  "aiRiskFlags": [
    {
      "severity": "high" | "medium" | "low",
      "description": "Penjelasan risiko spesifik yang diidentifikasi dari dokumen tender ini dalam Bahasa Indonesia.",
      "category": "Keuangan" | "Hukum" | "Teknis" | "Waktu" | "Operasional"
    }
  ],
  "aiHiddenRequirements": [
    "Persyaratan tersembunyi/implisit ke-1 yang memberatkan (misal: kewajiban menyerahkan jaminan dengan nilai tinggi, kepemilikan alat berat spesifik, sertifikasi asing yang jarang dimiliki, atau sanksi keterlambatan ekstrem)."
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const data = JSON.parse(content);

    return {
      aiSummary: data.aiSummary || '',
      aiRiskFlags: Array.isArray(data.aiRiskFlags) ? data.aiRiskFlags : [],
      aiHiddenRequirements: Array.isArray(data.aiHiddenRequirements) ? data.aiHiddenRequirements : [],
    };
  } catch (error) {
    console.error('[AI-Summarizer] Error analyzing summary and risks:', error);
    return generateMockSummaryAndRisks(title, qualification);
  }
}

/**
 * Menghasilkan mock analisis ringkasan dan risiko berdasarkan kata kunci judul tender.
 */
function generateMockSummaryAndRisks(title: string, qualification: string): SummaryRiskResult {
  console.log(`[AI-Summarizer] Generating smart mock summary and risks for: "${title}"`);
  
  const titleLower = title.toLowerCase();
  
  let aiSummary = `Proyek ini merupakan tender pengadaan jasa/barang untuk kebutuhan operasional instansi terkait. Pekerjaan ini menuntut penyedia jasa memiliki kesiapan teknis, legalitas usaha yang lengkap, serta kemampuan mengelola sumber daya manusia secara efektif untuk memastikan pengiriman hasil proyek sesuai standar kualitas yang disepakati.`;
  
  let aiRiskFlags: SummaryRiskResult['aiRiskFlags'] = [
    {
      severity: 'medium',
      category: 'Hukum',
      description: 'Sanksi denda keterlambatan penyelesaian proyek standar (1 mil per hari) yang berpotensi membengkak jika terjadi kelambatan suplai logistik.',
    },
  ];
  
  let aiHiddenRequirements = [
    'Kewajiban menjaga kerahasiaan data instansi (Non-Disclosure Agreement) secara ketat dengan ancaman denda perdata jika bocor.',
    'Menyediakan layanan dukungan teknis (after-sales service) secara gratis selama masa garansi minimal 1 tahun.',
  ];

  if (titleLower.includes('software') || titleLower.includes('aplikasi') || titleLower.includes('sistem informasi') || titleLower.includes('development') || titleLower.includes('web')) {
    aiSummary = `Tender ini bertujuan untuk melakukan perancangan, pengembangan, pengujian, dan implementasi platform perangkat lunak digital guna meningkatkan efisiensi proses bisnis instansi. Penyedia terpilih wajib menyerahkan kode sumber (source code) lengkap, melatih staf internal, serta menyediakan jaminan pemeliharaan (maintenance) pasca-serah terima.`;
    
    aiRiskFlags = [
      {
        severity: 'high',
        category: 'Teknis',
        description: 'Potensi terjadinya pembengkakan ruang lingkup (scope creep) karena kebutuhan integrasi dengan sistem warisan (legacy systems) yang tidak didefinisikan secara mendetail di dokumen teknis awal.',
      },
      {
        severity: 'medium',
        category: 'Waktu',
        description: 'Jadwal implementasi dan migrasi data yang sangat padat (simulasi 3-4 bulan) meningkatkan risiko keterlambatan serah terima jika tahapan User Acceptance Test (UAT) berjalan lambat.',
      },
      {
        severity: 'medium',
        category: 'Hukum',
        description: 'Ketentuan pemindahan hak kekayaan intelektual (IP Rights) secara penuh ke pihak instansi, sehingga kode program tidak dapat digunakan kembali untuk produk komersial lain tanpa modifikasi total.',
      },
    ];
    
    aiHiddenRequirements.push(
      'Kewajiban penempatan tenaga ahli on-site (di kantor instansi) selama fase krusial UAT dan pelatihan pengguna tanpa biaya tambahan akomodasi.',
      'Sertifikasi ISO 27001 wajib dalam kondisi aktif selama masa kontrak berlangsung.',
      'Menyediakan dokumentasi teknis berstandar internasional (IEEE) untuk arsitektur sistem dan manual penggunaan.'
    );
  } else if (titleLower.includes('jaringan') || titleLower.includes('network') || titleLower.includes('fiber optic') || titleLower.includes('internet') || titleLower.includes('bandwidth') || titleLower.includes('security')) {
    aiSummary = `Pengadaan ini berfokus pada penyediaan infrastruktur konektivitas internet/intranet berkecepatan tinggi, instalasi perangkat jaringan (router/switches/firewall), atau audit keamanan sistem informasi. Layanan ini krusial untuk menjamin ketersediaan akses data instansi secara real-time dan aman dari ancaman siber.`;
    
    aiRiskFlags = [
      {
        severity: 'high',
        category: 'Operasional',
        description: 'Tingkat Service Level Agreement (SLA) konektivitas yang dipatok sangat tinggi (minimal 99.9% uptime). Kegagalan pemenuhan SLA akan berakibat langsung pada pemotongan nilai tagihan bulanan secara progresif.',
      },
      {
        severity: 'medium',
        category: 'Keuangan',
        description: 'Investasi perangkat keras jaringan (hardware) di awal proyek yang cukup besar sebelum pembayaran termin pertama cair, membutuhkan arus kas (cash flow) perusahaan yang kuat.',
      },
    ];
    
    aiHiddenRequirements.push(
      'Penyediaan link cadangan (backup link) dengan media transmisi berbeda (misal, fiber optic utama + backup nirkabel/VSAT) untuk redundansi.',
      'Wajib menyediakan helpdesk 24/7 dengan waktu tanggap (response time) maksimal 30 menit dari aduan kendala.'
    );
  } else if (titleLower.includes('gedung') || titleLower.includes('jalan') || titleLower.includes('jembatan') || titleLower.includes('renovasi') || titleLower.includes('konstruksi')) {
    aiSummary = `Proyek konstruksi fisik berskala besar yang mencakup pekerjaan struktur, arsitektur, mekanikal, elektrikal, dan plumbing (MEP) untuk pembangunan baru maupun renovasi gedung instansi. Rekanan wajib mematuhi standar keselamatan kerja K3 dan menyelesaikan proyek tepat waktu sebelum tahun anggaran berakhir.`;
    
    aiRiskFlags = [
      {
        severity: 'high',
        category: 'Keuangan',
        description: 'Keterikatan harga tetap (Lump Sum) di tengah risiko fluktuasi harga bahan bangunan (semen, baja, beton) yang tidak dapat dibebankan tambahan biayanya ke instansi jika terjadi inflasi.',
      },
      {
        severity: 'high',
        category: 'Waktu',
        description: 'Batas akhir penyelesaian proyek yang sangat kaku menjelang akhir tahun anggaran negara. Keterlambatan melewati batas tanggal anggaran dapat mengakibatkan sanksi daftar hitam (blacklist) LKPP dan pemutusan kontrak sepihak.',
      },
    ];
    
    aiHiddenRequirements.push(
      'Kewajiban menyediakan jaminan pelaksanaan (Performance Bond) sebesar 5% dari nilai kontrak dari bank pemerintah.',
      'Persyaratan kepemilikan alat berat tertentu (misal excavator, crane) dengan bukti kepemilikan sah atau surat sewa yang diverifikasi fisik.',
      'Penyusunan jaminan pemeliharaan konstruksi (retensi 5%) yang ditahan selama minimal 6 bulan pasca-proyek selesai.'
    );
  }

  return {
    aiSummary,
    aiRiskFlags,
    aiHiddenRequirements,
  };
}
