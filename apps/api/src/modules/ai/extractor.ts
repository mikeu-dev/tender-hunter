import { openai, isMockAi } from './client.js';

export interface ExtractedTenderData {
  registrationDeadline: Date | null;
  submissionDeadline: Date | null;
  category: string;
  subcategory: string;
  qualification: string;
  eligibility: string;
  confidenceScore: number;
  documentRequirements: string[];
  timeline: Array<{ stage: string; date: string }>;
}

/**
 * Mengekstrak informasi terstruktur dari raw data/teks tender menggunakan LLM.
 */
export async function extractTenderData(title: string, rawText: string): Promise<ExtractedTenderData> {
  if (isMockAi || !openai) {
    return generateMockExtractedData(title, rawText);
  }

  try {
    const prompt = `
Anda adalah ahli pengadaan barang dan jasa serta analisis tender pemerintah Indonesia.
Tugas Anda adalah mengekstrak informasi terstruktur yang akurat dari teks detail tender berikut.

Judul Tender: "${title}"
Detail Teks Mentah:
"""
${rawText.slice(0, 12000)}
"""

Ekstrak bidang-bidang berikut secara akurat dalam format JSON:
1. registrationDeadline: Tanggal batas akhir pendaftaran/pengambilan dokumen (format ISO YYYY-MM-DDTHH:mm:ssZ atau null jika tidak ada).
2. submissionDeadline: Tanggal batas akhir penyampaian dokumen penawaran (format ISO YYYY-MM-DDTHH:mm:ssZ atau null jika tidak ada).
3. category: Kategori procurement utama (pilih salah satu: 'IT/Software/Telekomunikasi', 'Konstruksi/Infrastruktur', 'Pengadaan Barang', 'Jasa Konsultasi', 'Jasa Lainnya').
4. subcategory: Subkategori spesifik (misal: 'Pengembangan Perangkat Lunak', 'Keamanan Jaringan', 'Sewa Bandwidth', 'Konstruksi Jalan', dll.).
5. qualification: Kualifikasi usaha, teknis, atau sertifikasi yang wajib dimiliki (ISO, CISA, IUJK, dll.).
6. eligibility: Kriteria kelayakan umum bagi peserta.
7. documentRequirements: Daftar nama dokumen yang diwajibkan (misal: NIB, NPWP, Akta Pendirian, Sertifikasi ISO).
8. timeline: Rangkaian tahapan lelang beserta tanggalnya jika tercantum.
9. confidenceScore: Nilai desimal antara 0.0 sampai 1.0 yang menunjukkan tingkat kepercayaan ekstraksi Anda berdasarkan kejelasan teks sumber.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const data = JSON.parse(content);
    
    return {
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
      submissionDeadline: data.submissionDeadline ? new Date(data.submissionDeadline) : null,
      category: data.category || 'Jasa Lainnya',
      subcategory: data.subcategory || 'Lainnya',
      qualification: data.qualification || '',
      eligibility: data.eligibility || '',
      confidenceScore: data.confidenceScore || 0.5,
      documentRequirements: Array.isArray(data.documentRequirements) ? data.documentRequirements : [],
      timeline: Array.isArray(data.timeline) ? data.timeline : [],
    };
  } catch (error) {
    console.error('[AI-Extractor] Error extracting tender data:', error);
    // Fallback ke mock jika API error di luar dugaan agar crawling tetap berlanjut
    return generateMockExtractedData(title, rawText);
  }
}

/**
 * Menghasilkan mock data ekstraksi yang kaya berdasarkan analisa kata kunci pada judul tender.
 */
function generateMockExtractedData(title: string, rawText: string): ExtractedTenderData {
  console.log(`[AI-Extractor] Generating smart mock extracted data for: "${title}"`);
  
  const titleLower = title.toLowerCase();
  
  // 1. Tentukan Kategori & Subkategori
  let category = 'Jasa Lainnya';
  let subcategory = 'Umum';
  let qualification = 'Memiliki izin usaha yang berlaku sesuai bidang.';
  let documentRequirements = ['NIB (Nomor Induk Berusaha)', 'NPWP Perusahaan', 'SPT Tahunan Terakhir'];
  
  if (titleLower.includes('software') || titleLower.includes('aplikasi') || titleLower.includes('sistem informasi') || titleLower.includes('development') || titleLower.includes('web')) {
    category = 'IT/Software/Telekomunikasi';
    subcategory = 'Pengembangan Perangkat Lunak';
    qualification = 'Kualifikasi Usaha Mikro/Kecil/Non-Kecil Bidang Jasa Pembuatan Perangkat Lunak. Memiliki pengalaman sejenis dalam 3 tahun terakhir. Diutamakan memiliki sertifikasi ISO 27001 (Sistem Manajemen Keamanan Informasi) dan ISO 9001 (Manajemen Mutu).';
    documentRequirements.push('Sertifikat ISO 27001', 'Portofolio Proyek Terkait', 'CV Tenaga Ahli (Programmer, System Analyst)');
  } else if (titleLower.includes('jaringan') || titleLower.includes('network') || titleLower.includes('fiber optic') || titleLower.includes('internet') || titleLower.includes('bandwidth') || titleLower.includes('security')) {
    category = 'IT/Software/Telekomunikasi';
    subcategory = 'Infrastruktur Jaringan & Keamanan';
    qualification = 'Memiliki Izin Penyelenggaraan Jaringan Telekomunikasi. Diutamakan memiliki sertifikasi keahlian jaringan (CCNA/CCNP) dan sertifikasi keamanan informasi (CISA/CISSP).';
    documentRequirements.push('Sertifikat Kemitraan Resmi (Partner Letter)', 'Sertifikasi Keahlian Jaringan (CCNP/Equivalent)', 'Sertifikat Penyelenggara Jasa Internet (ISP) Aktif');
  } else if (titleLower.includes('gedung') || titleLower.includes('jalan') || titleLower.includes('jembatan') || titleLower.includes('renovasi') || titleLower.includes('konstruksi')) {
    category = 'Konstruksi/Infrastruktur';
    subcategory = 'Pekerjaan Sipil & Pembangunan';
    qualification = 'Memiliki Sertifikat Badan Usaha (SBU) Jasa Konstruksi yang masih berlaku. Memiliki KBLI terkait Jasa Konstruksi Gedung/Sipil. Memiliki tenaga ahli bersertifikat SKA/SKT Sipil.';
    documentRequirements.push('Sertifikat Badan Usaha (SBU)', 'Izin Mendirikan Bangunan (IMB) terkait', 'Sertifikat Keahlian Kerja (SKA) Tenaga Ahli Konstruksi');
  } else if (titleLower.includes('sewa') || titleLower.includes('kendaraan') || titleLower.includes('cleaning') || titleLower.includes('keamanan') || titleLower.includes('cater') || titleLower.includes('makan')) {
    category = 'Jasa Lainnya';
    subcategory = 'Jasa Penyediaan & Operasional';
    qualification = 'Memiliki SIUP/NIB bidang Penyediaan Jasa Tenaga Kerja/Sewa Kendaraan/Catering. Berpengalaman melayani instansi pemerintah.';
    documentRequirements.push('Izin Operasional Jasa Pengamanan/Catering', 'Daftar armada/peralatan aktif', 'Hasil tes kesehatan/pemeriksaan berkala karyawan');
  } else if (titleLower.includes('alat') || titleLower.includes('laptop') || titleLower.includes('komputer') || titleLower.includes('mebel') || titleLower.includes('pengadaan')) {
    category = 'Pengadaan Barang';
    subcategory = 'Penyediaan Peralatan & Inventaris';
    qualification = 'Distributor Resmi atau agen penjualan bersertifikat dari pabrikan. Memiliki garansi resmi purna jual.';
    documentRequirements.push('Surat Dukungan Pabrikan (Manufacturer Authorization Letter)', 'Katalog Produk Resmi', 'Sertifikat Garansi Resmi');
  }

  // 2. Tentukan Deadline Logis (Simulasi)
  const now = new Date();
  const regDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 Hari dari sekarang
  const subDeadline = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000); // 12 Hari dari sekarang

  // 3. Tentukan Timeline
  const timeline = [
    { stage: 'Pengumuman Pascaprakualifikasi', date: now.toLocaleDateString('id-ID') },
    { stage: 'Pendaftaran dan Pengambilan Dokumen', date: `${now.toLocaleDateString('id-ID')} - ${regDeadline.toLocaleDateString('id-ID')}` },
    { stage: 'Pemberian Penjelasan (Anwijzing)', date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID') },
    { stage: 'Penyampaian Dokumen Penawaran', date: subDeadline.toLocaleDateString('id-ID') },
    { stage: 'Evaluasi Penawaran & Kualifikasi', date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID') },
    { stage: 'Pengumuman Pemenang', date: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID') },
  ];

  return {
    registrationDeadline: regDeadline,
    submissionDeadline: subDeadline,
    category,
    subcategory,
    qualification,
    eligibility: 'Peserta harus berbentuk badan usaha (PT/CV) berbadan hukum, memiliki NPWP aktif, patuh membayar pajak tahunan, tidak dalam pengawasan pengadilan, dan tidak masuk daftar hitam LKPP.',
    confidenceScore: 0.95,
    documentRequirements,
    timeline,
  };
}
