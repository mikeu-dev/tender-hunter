import { db, alertRules, organizations, eq, and } from '@tender-hunter/shared';
import { getPlanDetail } from './plans.js';
import type { Context, Next } from 'hono';

/**
 * Memeriksa apakah organisasi masih diperbolehkan membuat alert rule baru berdasarkan limit paket langganan.
 */
export async function canCreateAlertRule(orgId: string): Promise<{ allowed: boolean; currentCount: number; maxLimit: number }> {
  try {
    // 1. Dapatkan profil organisasi penyewa
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    if (!org) {
      throw new Error(`Organization not found: ${orgId}`);
    }

    // 2. Dapatkan batas maksimal paket
    const currentPlan = org.subscriptionPlan || 'free';
    
    // Periksa apakah paket sudah kedaluwarsa
    const isExpired = org.subscriptionExpiresAt && new Date() > new Date(org.subscriptionExpiresAt);
    const resolvedPlan = isExpired ? 'free' : currentPlan; // Jika expired, kembalikan hak akses ke free starter

    const planDetail = getPlanDetail(resolvedPlan);
    const maxLimit = planDetail.features.maxAlertRules;

    // 3. Hitung jumlah alert rules aktif saat ini
    const activeRules = await db.query.alertRules.findMany({
      where: and(
        eq(alertRules.orgId, orgId),
        eq(alertRules.isActive, true)
      ),
    });

    const currentCount = activeRules.length;

    return {
      allowed: currentCount < maxLimit,
      currentCount,
      maxLimit,
    };
  } catch (error) {
    console.error('[Billing-Limits] Error checking alert rules limit:', error);
    return { allowed: false, currentCount: 0, maxLimit: 0 };
  }
}

/**
 * Memeriksa apakah organisasi berhak mengakses suatu fitur spesifik.
 */
export async function hasFeatureAccess(
  orgId: string,
  feature: 'hasSemanticSearch' | 'hasAiSummary' | 'hasAiMatcher' | 'hasTelegramChannel'
): Promise<boolean> {
  try {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    if (!org) return false;

    const currentPlan = org.subscriptionPlan || 'free';
    const isExpired = org.subscriptionExpiresAt && new Date() > new Date(org.subscriptionExpiresAt);
    const resolvedPlan = isExpired ? 'free' : currentPlan;

    const planDetail = getPlanDetail(resolvedPlan);
    return !!planDetail.features[feature];
  } catch (error) {
    console.error(`[Billing-Limits] Error checking access for feature "${feature}":`, error);
    return false;
  }
}

/**
 * Middleware Hono untuk menolak request jika jumlah alert rules aktif melebihi batas pemakaian paket langganan.
 */
export const checkAlertRulesLimitMiddleware = async (c: Context, next: Next) => {
  try {
    const body = await c.req.parseBody() as any;
    // Coba parsing dari json body jika parseBody kosong
    let orgId = body?.orgId;
    if (!orgId) {
      const jsonBody = await c.req.json().catch(() => ({}));
      orgId = jsonBody?.orgId;
      // Simpan kembali json body ke req context agar endpoint berikutnya bisa membaca ulang tanpa crash
      c.set('parsedJsonBody', jsonBody);
    }

    if (!orgId) {
      return c.json({ error: 'orgId is required to verify subscription limits' }, 400);
    }

    const { allowed, currentCount, maxLimit } = await canCreateAlertRule(orgId);

    if (!allowed) {
      return c.json({
        error: `Limit reached! Your current subscription plan only allows up to ${maxLimit} active alert rules. You currently have ${currentCount} active rules.`,
        code: 'LIMIT_REACHED',
        currentCount,
        maxLimit,
        suggestion: 'Please upgrade to Business Pro or Enterprise to create more alert filters.'
      }, 403);
    }

    // Lolos verifikasi limitasi
    await next();
  } catch (err: any) {
    return c.json({ error: err.message || 'Error enforcing subscription limits' }, 500);
  }
};
