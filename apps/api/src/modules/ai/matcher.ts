import { openai, isMockAi } from './client.js';

export interface MatchScoreResult {
  matchScore: number; // 0 - 100
  matchJustification: {
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  };
}

/**
 * Menghitung tingkat kecocokan (Match Score) antara profil organisasi dan detail tender.
 */
export async function calculateMatchScore(organization: any, tender: any): Promise<MatchScoreResult> {
  if (isMockAi || !openai) {
    return calculateHeuristicMockMatch(organization, tender);
  }

  try {
    const orgProfileStr = `
Nama Organisasi: ${organization.name}
Sektor Bisnis: ${organization.businessSectors?.join(', ') || 'Tidak diset'}
Keahlian/Kapabilitas: ${organization.capabilities?.join(', ') || 'Tidak diset'}
Sertifikasi yang Dimiliki: ${organization.certifications?.join(', ') || 'Tidak diset'}
Daerah Preferensi: ${organization.preferredRegions?.join(', ') || 'Tidak diset'}
Rentang Budget Preferensi: Rp${organization.budgetMin?.toLocaleString('id-ID') || 0} - Rp${organization.budgetMax?.toLocaleString('id-ID') || 'Tidak terbatas'}
`;

    const tenderDetailStr = `
Judul Tender: ${tender.title}
Organisasi Pembuat: ${tender.organizationName || 'Tidak diketahui'}
Kategori: ${tender.category || 'Tidak diketahui'} / ${tender.subcategory || 'Tidak diketahui'}
Budget Nilai Proyek: Rp${tender.budget?.toLocaleString('id-ID') || 0}
Kualifikasi Wajib: ${tender.qualification || 'Tidak diketahui'}
Persyaratan Dokumen: ${tender.documentRequirements?.join(', ') || 'Tidak diketahui'}
`;

    const prompt = `
Anda adalah konsultan tender senior yang bertugas menilai kelayakan partisipasi sebuah perusahaan dalam lelang proyek pemerintah.
Bandingkan Profil Perusahaan dengan Detail Tender berikut secara kritis dan objektif.

[PROFIL PERUSAHAAN]
${orgProfileStr}

[DETAIL TENDER]
${tenderDetailStr}

Tugas Anda:
1. Hitung Match Score (skor kecocokan) dalam persentase (angka bulat antara 0 sampai 100) berdasarkan kesesuaian keahlian, legalitas, budget, sertifikasi, dan geografi. Be realistik dan kritis (jangan memberikan skor tinggi jika ada sertifikasi wajib yang tidak dimiliki perusahaan).
2. Hasilkan justifikasi kecocokan terstruktur berupa:
   - strengths: Kekuatan atau keunggulan perusahaan yang sangat cocok dengan kebutuhan proyek (maksimal 3 poin).
   - gaps: Ketidakcocokan, celah, kekurangan, atau sertifikasi wajib tender yang tidak dimiliki perusahaan (maksimal 3 poin).
   - recommendations: Langkah konkret yang harus diambil perusahaan jika ingin memenangkan tender ini (misal: membentuk konsorsium/kemitraan, meningkatkan lisensi, melengkapi sertifikasi tertentu, dll.) (maksimal 3 poin).

Hasilkan respon dalam format JSON murni dengan struktur berikut:
{
  "matchScore": 85,
  "matchJustification": {
    "strengths": [
      "Perusahaan memiliki pengalaman kuat di bidang pengembangan aplikasi web yang dicari lelang ini."
    ],
    "gaps": [
      "Perusahaan belum memiliki sertifikasi ISO 27001 yang tercantum sebagai dokumen pendukung."
    ],
    "recommendations": [
      "Bekerja sama dengan subkontraktor lokal yang tersertifikasi keamanan informasi untuk memperkuat penawaran."
    ]
  }
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
      matchScore: Math.min(100, Math.max(0, Math.round(data.matchScore || 50))),
      matchJustification: {
        strengths: Array.isArray(data.matchJustification?.strengths) ? data.matchJustification.strengths : [],
        gaps: Array.isArray(data.matchJustification?.gaps) ? data.matchJustification.gaps : [],
        recommendations: Array.isArray(data.matchJustification?.recommendations) ? data.matchJustification.recommendations : [],
      }
    };
  } catch (error) {
    console.error('[AI-Matcher] Error calculating match score via OpenAI:', error);
    return calculateHeuristicMockMatch(organization, tender);
  }
}

/**
 * Algoritma pencocokan heuristik yang membandingkan parameter riil organisasi dengan data tender.
 * Menghasilkan justifikasi dinamis yang akurat berdasarkan data sesungguhnya untuk simulasi premium!
 */
function calculateHeuristicMockMatch(organization: any, tender: any): MatchScoreResult {
  console.log(`[AI-Matcher] Calculating heuristic mock match score for organization "${organization.name}" and tender "${tender.title}"`);
  
  let score = 65; // Skor dasar lelang
  const strengths: string[] = [];
  const gaps: string[] = [];
  const recommendations: string[] = [];

  const tenderTitle = tender.title.toLowerCase();
  const tenderCat = (tender.category || '').toLowerCase();
  const tenderSub = (tender.subcategory || '').toLowerCase();
  const tenderBudget = tender.budget || 0;

  // 1. Pencocokan Sektor Bisnis & Keahlian (Bobot: 40%)
  const hasSectorMatch = organization.businessSectors?.some((s: string) => {
    const sectorLower = s.toLowerCase();
    return tenderTitle.includes(sectorLower) || tenderCat.includes(sectorLower) || tenderSub.includes(sectorLower);
  });

  const hasCapabilityMatch = organization.capabilities?.some((c: string) => {
    const capLower = c.toLowerCase();
    return tenderTitle.includes(capLower) || (tender.qualification || '').toLowerCase().includes(capLower);
  });

  if (hasSectorMatch || hasCapabilityMatch) {
    score += 15;
    strengths.push(`Sektor bisnis atau kompetensi inti perusahaan (${organization.businessSectors?.[0] || 'IT'}) sangat selaras dengan kategori lelang.`);
  } else {
    score -= 15;
    gaps.push(`Bidang utama lelang tidak termasuk dalam fokus sektor bisnis utama perusahaan saat ini.`);
    recommendations.push(`Pertimbangkan untuk merekrut tenaga ahli eksternal atau membentuk kemitraan operasi (KSO) dengan perusahaan sejenis.`);
  }

  // 2. Pencocokan Budget (Bobot: 20%)
  const minBudget = organization.budgetMin || 0;
  const maxBudget = organization.budgetMax || Infinity;

  if (tenderBudget > 0) {
    if (tenderBudget >= minBudget && tenderBudget <= maxBudget) {
      score += 10;
      strengths.push(`Nilai anggaran proyek lelang (Rp${tenderBudget.toLocaleString('id-ID')}) berada dalam rentang kapasitas budget perusahaan.`);
    } else if (tenderBudget < minBudget) {
      score -= 5;
      gaps.push(`Nilai proyek lelang berada di bawah target budget minimum perusahaan.`);
      recommendations.push(`Nilai proyek relatif kecil; jika margin memadai, lelang ini masih layak diikuti untuk memperkaya portofolio.`);
    } else if (tenderBudget > maxBudget) {
      score -= 20;
      gaps.push(`Nilai proyek (Rp${tenderBudget.toLocaleString('id-ID')}) melebihi preferensi kapasitas budget maksimum perusahaan (Rp${maxBudget.toLocaleString('id-ID')}).`);
      recommendations.push(`Wajib menggandeng mitra perbankan untuk penyediaan garansi bank pelaksanaan (Performance Bond) dan kredit modal kerja tambahan.`);
    }
  }

  // 3. Pencocokan Sertifikasi (Bobot: 20%)
  const tenderQualLower = (tender.qualification || '').toLowerCase();
  const orgCerts = organization.certifications || [];
  
  let requiredCerts: string[] = [];
  if (tenderTitle.includes('software') || tenderTitle.includes('aplikasi') || tenderTitle.includes('sistem')) {
    requiredCerts = ['ISO 27001', 'ISO 9001'];
  } else if (tenderTitle.includes('gedung') || tenderTitle.includes('konstruksi')) {
    requiredCerts = ['SBU (Sertifikat Badan Usaha)', 'ISO 9001'];
  }

  let certMatches = 0;
  requiredCerts.forEach(cert => {
    const hasCert = orgCerts.some((oc: string) => oc.toLowerCase().includes(cert.toLowerCase()));
    if (hasCert) {
      certMatches++;
    } else {
      gaps.push(`Perusahaan belum mendaftarkan kepemilikan sertifikasi wajib "${cert}" di profil.`);
      recommendations.push(`Segera lakukan pemenuhan sertifikasi "${cert}" atau jalin kerja sama KSO dengan rekanan tersertifikasi.`);
    }
  });

  if (requiredCerts.length > 0) {
    if (certMatches === requiredCerts.length) {
      score += 10;
      strengths.push(`Perusahaan memenuhi seluruh prasyarat sertifikasi penting (${requiredCerts.join(', ')}) yang diminta lelang.`);
    } else if (certMatches > 0) {
      score += 0;
      strengths.push(`Perusahaan memiliki beberapa sertifikasi pendukung lelang seperti ${orgCerts.filter((c: string) => requiredCerts.includes(c)).join(', ')}.`);
    } else {
      score -= 10;
    }
  }

  // 4. Pencocokan Wilayah (Bobot: 10%)
  const tenderRegion = (tender.region || '').toLowerCase();
  const orgRegions = organization.preferredRegions || [];
  const hasRegionMatch = orgRegions.some((r: string) => r.toLowerCase().includes(tenderRegion) || tenderRegion.includes(r.toLowerCase()));

  if (hasRegionMatch && orgRegions.length > 0) {
    score += 5;
    strengths.push(`Lokasi proyek berada di wilayah operasional utama atau preferensi geografi perusahaan.`);
  } else if (orgRegions.length > 0 && tenderRegion !== '') {
    gaps.push(`Lokasi proyek berada di luar wilayah operasional preferensi perusahaan.`);
    recommendations.push(`Pertimbangkan logistik penempatan personel lapangan atau biaya mobilisasi di luar kota.`);
  }

  // Batasi skor minimum 10 dan maksimum 98 (agar selalu ada ruang improvisasi lelang)
  const finalScore = Math.min(98, Math.max(10, score));

  if (strengths.length === 0) {
    strengths.push(`Kelengkapan legalitas standar perusahaan memenuhi prasyarat umum lelang.`);
  }
  if (recommendations.length === 0) {
    recommendations.push(`Lakukan analisis menyeluruh terhadap dokumen penawaran administrasi sebelum mengunggah.`);
  }

  return {
    matchScore: finalScore,
    matchJustification: {
      strengths,
      gaps,
      recommendations,
    }
  };
}
