import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
export const isMockTelegram = !token || token === 'mock' || token.startsWith('YOUR_');

if (isMockTelegram) {
  console.warn('[Telegram] TELEGRAM_BOT_TOKEN is not configured. Running in MOCK Telegram Mode.');
}

/**
 * Mengirim pesan notifikasi lelang baru ke chat ID Telegram pengguna.
 * @param chatId Chat ID Telegram penerima
 * @param message Konten pesan berformat MarkdownV2/Markdown
 */
export async function sendTelegramNotification(chatId: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (isMockTelegram) {
    console.log(`
========================================
[MOCK TELEGRAM NOTIFICATION]
To Chat ID: ${chatId}
Message:
${message}
========================================
    `);
    // Simulasi jeda pengiriman jaringan
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown', // Menggunakan parse mode Markdown standar
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json() as any;

    if (!response.ok || !data.ok) {
      throw new Error(data.description || `HTTP error! status: ${response.status}`);
    }

    console.log(`[Telegram] Message successfully sent to Chat ID ${chatId}`);
    return { success: true };
  } catch (error: any) {
    const errMsg = error.message || String(error);
    console.error(`[Telegram] Failed to send message to Chat ID ${chatId}:`, errMsg);
    return { success: false, error: errMsg };
  }
}

/**
 * Memformat detail tender menjadi pesan Markdown yang premium dan mudah dibaca di Telegram.
 */
export function formatTelegramTenderMessage(tender: any, orgName: string, matchScore: number): string {
  const cleanTitle = tender.title.replace(/[*_`[\]()]/g, ''); // Bersihkan karakter sensitif markdown
  const budgetStr = tender.budget 
    ? `Rp${tender.budget.toLocaleString('id-ID')}` 
    : 'Nilai proyek tidak tercantum';
    
  const deadlineStr = tender.submissionDeadline
    ? new Date(tender.submissionDeadline).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Tidak dicantumkan';

  const emojiScore = matchScore >= 80 ? '🔥' : matchScore >= 60 ? '⚡' : '📋';

  return `
*📢 TENDER BARU DITEMUKAN\\!*

📌 *${cleanTitle}*
🏢 *Instansi:* ${tender.organizationName || 'Tidak diketahui'}
📂 *Kategori:* ${tender.category || 'Jasa Lainnya'}

💰 *Nilai Anggaran:* \`${budgetStr}\`
📅 *Batas Penawaran:* \`${deadlineStr}\`

${emojiScore} *AI Match Score (${orgName}):* *${matchScore}%*

📝 *Ringkasan Eksekutif:*
_${tender.aiSummary || 'Proyek ini merupakan tender pengadaan yang membutuhkan kesiapan teknis dan kelengkapan administrasi sesuai bidang.'}_

🔗 *Tautan Tender:* [Lihat Detail LPSE](${tender.url || '#'})
  `.trim();
}
