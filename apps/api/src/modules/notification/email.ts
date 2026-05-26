import dotenv from 'dotenv';

dotenv.config();

const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
export const isMockEmail = !smtpHost || !smtpUser || smtpHost === 'mock';

if (isMockEmail) {
  console.warn('[Email] SMTP configuration is not complete. Running in MOCK Email Mode.');
}

/**
 * Mengirim notifikasi email transaksional tentang tender baru yang cocok.
 * @param to Alamat email penerima
 * @param subject Subjek email
 * @param htmlBody Konten email berformat HTML premium
 */
export async function sendEmailNotification(to: string, subject: string, htmlBody: string): Promise<{ success: boolean; error?: string }> {
  if (isMockEmail) {
    console.log(`
========================================
[MOCK EMAIL NOTIFICATION]
To: ${to}
Subject: ${subject}
HTML Body:
${htmlBody.slice(0, 500)}... [truncated]
========================================
    `);
    // Simulasi jeda pengiriman jaringan
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }

  try {
    // Muat nodemailer secara dinamis agar compiler tidak error jika paket belum di-install di mode offline
    // @ts-ignore
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: process.env.SMTP_PASS || '',
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Tender Hunter" <noreply@tenderhunter.id>',
      to,
      subject,
      html: htmlBody,
    });

    console.log(`[Email] Message successfully sent to ${to}: ${info.messageId}`);
    return { success: true };
  } catch (error: any) {
    const errMsg = error.message || String(error);
    console.error(`[Email] Failed to send email to ${to}:`, error);
    return { success: false, error: errMsg };
  }
}

/**
 * Memformat detail tender menjadi template email HTML premium bergaya kartu dasbor.
 */
export function formatEmailTenderTemplate(tender: any, orgName: string, matchScore: number): string {
  const budgetStr = tender.budget 
    ? `Rp${tender.budget.toLocaleString('id-ID')}` 
    : 'Nilai proyek tidak tercantum';
    
  const deadlineStr = tender.submissionDeadline
    ? new Date(tender.submissionDeadline).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Tidak dicantumkan';

  const scoreColor = matchScore >= 80 ? '#22c55e' : matchScore >= 60 ? '#f59e0b' : '#3b82f6';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tender Baru Ditemukan!</title>
      <style>
        body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; }
        .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
        .content { padding: 30px; }
        .card { background-color: #0f172a; border-radius: 8px; border: 1px solid #1e293b; padding: 20px; margin-top: 15px; }
        .badge-score { display: inline-block; padding: 6px 12px; border-radius: 20px; color: #ffffff; font-weight: bold; font-size: 14px; margin-bottom: 15px; }
        .title { color: #f8fafc; font-size: 18px; font-weight: bold; margin: 0 0 10px 0; }
        .meta-item { font-size: 14px; color: #94a3b8; margin: 5px 0; }
        .meta-item strong { color: #cbd5e1; }
        .summary { font-size: 14px; color: #cbd5e1; line-height: 1.6; border-top: 1px solid #334155; padding-top: 15px; margin-top: 15px; }
        .btn { display: block; text-align: center; background-color: #3b82f6; color: #ffffff; font-weight: bold; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 25px; transition: background-color 0.2s; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📢 Tender Baru Ditemukan!</h1>
        </div>
        <div class="content">
          <p>Halo,</p>
          <p>Sistem deteksi Tender Hunter mendeteksi adanya peluang tender baru yang sangat cocok dengan profil perusahaan Anda <strong>${orgName}</strong>.</p>
          
          <div class="card">
            <div class="badge-score" style="background-color: ${scoreColor};">
              🔥 AI Match Score: ${matchScore}%
            </div>
            <div class="title">${tender.title}</div>
            <div class="meta-item"><strong>Instansi:</strong> ${tender.organizationName || 'Tidak diketahui'}</div>
            <div class="meta-item"><strong>Nilai Proyek:</strong> ${budgetStr}</div>
            <div class="meta-item"><strong>Batas Penawaran:</strong> ${deadlineStr}</div>
            <div class="meta-item"><strong>Kategori:</strong> ${tender.category || 'IT'}</div>
            
            <div class="summary">
              <strong>Ringkasan Eksekutif AI:</strong><br>
              <em>${tender.aiSummary || 'Peluang tender baru telah dideteksi. Harap lakukan verifikasi teknis secara berkala.'}</em>
            </div>
          </div>
          
          <a href="${tender.url || '#'}" class="btn">Lihat Detail Tender di LPSE</a>
        </div>
        <div class="footer">
          Email dikirim secara otomatis oleh Tender Hunter SaaS Platform.<br>
          © 2026 Tender Hunter. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `.trim();
}
