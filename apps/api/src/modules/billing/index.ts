import { Hono } from 'hono';
import { db, organizations, eq } from '@tender-hunter/shared';
import { createSnapTransaction, verifyMidtransSignature } from './midtrans.js';
import { getPlanDetail } from './plans.js';

const billingRouter = new Hono();

/**
 * POST /api/billing/checkout
 * Inisialisasi transaksi checkout pembayaran Snap Midtrans untuk upgrade plan
 */
billingRouter.post('/checkout', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { orgId, planId } = body;

  if (!orgId || !planId) {
    return c.json({ error: 'orgId and planId are required' }, 400);
  }

  try {
    // 1. Dapatkan profil organisasi
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    if (!org) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    // 2. Dapatkan detail harga paket langganan
    const planDetail = getPlanDetail(planId);
    if (planDetail.price === 0) {
      return c.json({ error: 'Cannot checkout free starter plan' }, 400);
    }

    // 3. Buat Order ID unik
    const orderId = `SUB-${orgId.slice(0, 8)}-${planId}-${Date.now()}`;
    const amount = planDetail.price;

    // 4. Memicu pembuatan transaksi Snap Midtrans
    const checkoutResult = await createSnapTransaction(orderId, amount, {
      name: org.name,
      email: `${org.slug}@tenderhunter.id`, // Simulasi alamat email organisasi
      orgId: org.id,
      planId: planId,
    });

    return c.json({
      orderId,
      amount,
      planName: planDetail.name,
      ...checkoutResult,
    });

  } catch (error: any) {
    const errMsg = error.message || String(error);
    return c.json({ error: errMsg }, 500);
  }
});

/**
 * POST /api/billing/webhook
 * Webhook handler menerima notifikasi status pembayaran dari Midtrans.
 * Memperbarui paket langganan organisasi di database secara real-time dan aman.
 */
billingRouter.post('/webhook', async (c) => {
  const payload = await c.req.json().catch(() => ({}));
  
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
    custom_field1: orgId, // Dapatkan Metadata Org ID dari Midtrans
    custom_field2: planId, // Dapatkan Metadata Plan ID dari Midtrans
  } = payload;

  if (!order_id || !signature_key) {
    return c.json({ error: 'Invalid webhook payload structure' }, 400);
  }

  // 1. Verifikasi Keamanan Signature Key Webhook
  const isSignatureValid = verifyMidtransSignature(order_id, status_code, gross_amount, signature_key);
  if (!isSignatureValid) {
    return c.json({ error: 'Signature key verification failed' }, 403);
  }

  console.log(`[Billing-Webhook] Processing transaction status update for Order ID: ${order_id}. Status: ${transaction_status}`);

  try {
    // Pastikan Org ID dan Plan ID terdeteksi dari metadata kustom
    if (!orgId || !planId) {
      console.warn(`[Billing-Webhook] Missing custom fields orgId/planId for Order ID: ${order_id}. Signature valid, but metadata missing.`);
      return c.json({ message: 'Signature verified, but custom fields missing' });
    }

    // 2. Evaluasi Status Pembayaran Midtrans
    let resolvedPlanStatus = 'pending';
    let shouldUpdatePlan = false;

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      // Pembayaran sukses disetujui (Settlement)
      if (fraud_status === 'challenge') {
        resolvedPlanStatus = 'pending_challenge';
      } else {
        resolvedPlanStatus = 'active';
        shouldUpdatePlan = true;
      }
    } else if (transaction_status === 'pending') {
      resolvedPlanStatus = 'pending';
    } else if (transaction_status === 'deny' || transaction_status === 'expire' || transaction_status === 'cancel') {
      // Pembayaran gagal atau kedaluwarsa
      resolvedPlanStatus = 'expired';
      shouldUpdatePlan = true; // Kita turunkan paketnya ke free starter kembali
    }

    // 3. Perbarui Data Organisasi di Database
    if (shouldUpdatePlan) {
      const isSuccess = resolvedPlanStatus === 'active';
      const newPlan = isSuccess ? planId : 'free';
      
      // Masa aktif 30 hari ke depan untuk sukses, atau null jika diturunkan ke free
      const expiresAt = isSuccess 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
        : null;

      await db.update(organizations)
        .set({
          subscriptionPlan: newPlan,
          subscriptionStatus: resolvedPlanStatus,
          subscriptionExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));

      console.log(`[Billing-Webhook] Organization ${orgId} subscription plan successfully updated to: "${newPlan}" (Status: ${resolvedPlanStatus})`);
    }

    return c.json({ message: 'Webhook successfully processed and database synchronized.' });

  } catch (err: any) {
    const errMsg = err.message || String(err);
    console.error(`[Billing-Webhook] Failed to process webhook for Order ID ${order_id}:`, errMsg);
    return c.json({ error: errMsg }, 500);
  }
});

/**
 * GET /api/billing/subscription
 * Get subscription plan details and limits for an organization
 */
billingRouter.get('/subscription', async (c) => {
  const orgId = c.req.query('orgId');

  if (!orgId) {
    return c.json({ error: 'orgId is required' }, 400);
  }

  try {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    if (!org) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    const currentPlan = org.subscriptionPlan || 'free';
    const isExpired = org.subscriptionExpiresAt && new Date() > new Date(org.subscriptionExpiresAt);
    
    const resolvedPlan = isExpired ? 'free' : currentPlan;
    const planDetail = getPlanDetail(resolvedPlan);

    return c.json({
      plan: resolvedPlan,
      status: isExpired ? 'expired' : org.subscriptionStatus || 'active',
      expiresAt: org.subscriptionExpiresAt,
      isExpired,
      features: planDetail.features,
      pricing: planDetail.price,
      name: planDetail.name,
    });

  } catch (error: any) {
    const errMsg = error.message || String(error);
    return c.json({ error: errMsg }, 500);
  }
});

export default billingRouter;
