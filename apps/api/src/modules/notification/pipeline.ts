import { db, tenders, alertRules, notificationLogs, organizations, eq } from '@tender-hunter/shared';
import { calculateMatchScore } from '../ai/matcher.js';
import { queueNotificationJob } from './queue.js';
import { formatTelegramTenderMessage } from './telegram.js';
import { formatEmailTenderTemplate } from './email.js';

/**
 * Pemicu utama alur pencocokan notifikasi lelang baru.
 * Fungsi ini membandingkan data lelang ter-update dengan seluruh aturan alert di database,
 * menghitung kelayakan match, dan mendaftarkan pengiriman notifikasi asinkron ke BullMQ.
 */
export async function triggerNotificationPipeline(tenderId: string): Promise<void> {
  console.log(`[NotificationPipeline] Triggered for tender ID: ${tenderId}`);

  try {
    // 1. Ambil data tender lengkap dari database
    const tender = await db.query.tenders.findFirst({
      where: eq(tenders.id, tenderId),
    });

    if (!tender) {
      console.warn(`[NotificationPipeline] Tender not found: ${tenderId}`);
      return;
    }

    if (tender.status !== 'open') {
      console.log(`[NotificationPipeline] Tender is not open (status: ${tender.status}). Skipping.`);
      return;
    }

    // 2. Ambil seluruh alert rules aktif dari database
    const activeRules = await db.query.alertRules.findMany({
      where: eq(alertRules.isActive, true),
    });

    if (activeRules.length === 0) {
      console.log('[NotificationPipeline] No active alert rules configured in database.');
      return;
    }

    console.log(`[NotificationPipeline] Evaluating ${activeRules.length} active alert rules...`);

    for (const rule of activeRules) {
      try {
        // Ambil profil organisasi pembuat aturan
        const org = await db.query.organizations.findFirst({
          where: eq(organizations.id, rule.orgId!),
        });

        if (!org) {
          console.warn(`[NotificationPipeline] Organization not found for rule ${rule.id}`);
          continue;
        }

        // 3. Evaluasi Kriteria Filter dari Alert Rule
        
        // A. Filter Kategori
        if (rule.categories && rule.categories.length > 0 && tender.category) {
          const isCategoryMatch = rule.categories.some((cat: string) => 
            tender.category?.toLowerCase().includes(cat.toLowerCase()) || 
            cat.toLowerCase().includes(tender.category?.toLowerCase() || '')
          );
          if (!isCategoryMatch) continue; // Kategori tidak cocok
        }

        // B. Filter Budget Minimum
        if (rule.minBudget && rule.minBudget > 0 && tender.budget) {
          if (tender.budget < rule.minBudget) continue; // Budget terlalu kecil
        }

        // C. Filter Kata Kunci
        if (rule.keywords && rule.keywords.length > 0) {
          const titleAndSummary = `${tender.title} ${tender.aiSummary || ''}`.toLowerCase();
          const isKeywordMatch = rule.keywords.some((kw: string) => titleAndSummary.includes(kw.toLowerCase()));
          if (!isKeywordMatch) continue; // Kata kunci tidak cocok
        }

        // D. Filter AI Match Score (Kriteria Utama)
        // Hitung Match Score organisasi secara dinamis
        const matchResult = await calculateMatchScore(org, tender);
        if (rule.minMatchScore && rule.minMatchScore > 0) {
          if (matchResult.matchScore < rule.minMatchScore) {
            console.log(`[NotificationPipeline] Rule "${rule.name}" matches criteria, but Match Score ${matchResult.matchScore}% is below minimum ${rule.minMatchScore}%. Skipping.`);
            continue;
          }
        }

        console.log(`[NotificationPipeline] Match detected! Rule: "${rule.name}" matches Tender: "${tender.title}" (${matchResult.matchScore}% Match)`);

        // 4. Masukkan Pengiriman ke Antrean untuk Setiap Saluran yang Dipilih
        const channels = rule.channels || [];
        
        for (const channel of channels) {
          let recipient = '';
          let formattedMessage = '';

          if (channel === 'telegram') {
            recipient = rule.telegramChatId || '';
            if (!recipient) continue;
            formattedMessage = formatTelegramTenderMessage(tender, org.name, matchResult.matchScore);
          } else if (channel === 'email') {
            recipient = rule.emailAddress || '';
            if (!recipient) continue;
            formattedMessage = formatEmailTenderTemplate(tender, org.name, matchResult.matchScore);
          } else {
            continue;
          }

          // A. Buat baris logs pending di database untuk memberikan logId unik
          const [log] = await db.insert(notificationLogs).values({
            alertRuleId: rule.id,
            tenderId: tender.id,
            channel: channel as any,
            recipient,
            status: 'pending',
          }).returning();

          // B. Kirim job ke antrean BullMQ
          await queueNotificationJob({
            logId: log.id,
            tenderId: tender.id,
            channel: channel as any,
            recipient,
            payload: {
              title: tender.title,
              orgName: org.name,
              matchScore: matchResult.matchScore,
              formattedMessage,
            }
          });

          console.log(`[NotificationPipeline] Queued ${channel} notification job for recipient: ${recipient}`);
        }

      } catch (ruleErr) {
        console.error(`[NotificationPipeline] Error evaluating alert rule ${rule.id}:`, ruleErr);
      }
    }

  } catch (error) {
    console.error('[NotificationPipeline] Critical error in notification pipeline:', error);
  }
}
