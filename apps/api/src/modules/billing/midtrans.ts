import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const serverKey = process.env.MIDTRANS_SERVER_KEY;
export const isMockMidtrans = !serverKey || serverKey === 'mock' || serverKey.startsWith('YOUR_');

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const midtransBaseUrl = isProduction
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

if (isMockMidtrans) {
  console.warn('[Midtrans] MIDTRANS_SERVER_KEY is not configured. Running in MOCK Midtrans Mode.');
}

export interface MidtransCheckoutResult {
  token: string;
  redirect_url: string;
}

/**
 * Membuat transaksi baru di Midtrans Snap API untuk checkout paket langganan.
 */
export async function createSnapTransaction(
  orderId: string,
  amount: number,
  customerDetails: { name: string; email: string; orgId: string; planId: string }
): Promise<MidtransCheckoutResult> {
  
  if (isMockMidtrans) {
    console.log(`
========================================
[MOCK MIDTRANS TRANSACTION CREATED]
Order ID: ${orderId}
Gross Amount: Rp${amount.toLocaleString('id-ID')}
Customer: ${customerDetails.name} (${customerDetails.email})
Org ID: ${customerDetails.orgId} | Plan: ${customerDetails.planId}
========================================
    `);
    
    // Simulasi respons Snap token
    const mockToken = `mock-token-${crypto.randomBytes(8).toString('hex')}`;
    return {
      token: mockToken,
      redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${mockToken}`, // URL dummy sandbox
    };
  }

  try {
    const authString = Buffer.from(`${serverKey}:`).toString('base64');
    
    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: customerDetails.name,
        email: customerDetails.email,
      },
      item_details: [
        {
          id: customerDetails.planId,
          price: amount,
          quantity: 1,
          name: `Subscription Plan - ${customerDetails.planId.toUpperCase()}`,
        }
      ],
      // Sisipkan metadata untuk dibaca saat webhook terpicu
      custom_field1: customerDetails.orgId,
      custom_field2: customerDetails.planId,
    };

    const response = await fetch(midtransBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      throw new Error(data.error_messages?.join(', ') || `Midtrans API Error: status ${response.status}`);
    }

    return {
      token: data.token,
      redirect_url: data.redirect_url,
    };

  } catch (error: any) {
    const errMsg = error.message || String(error);
    console.error('[Midtrans] Checkout transaction failed:', errMsg);
    throw error;
  }
}

/**
 * Melakukan verifikasi keamanan signature key webhook dari Midtrans.
 * Mencegah manipulasi status transaksi palsu dari pihak luar.
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  receivedSignature: string
): boolean {
  if (isMockMidtrans) {
    // Di mode mock, kita selalu izinkan lewat untuk kemudahan testing webhook simulasi
    return true;
  }

  try {
    const rawString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const calculatedSignature = crypto.createHash('sha512').update(rawString).digest('hex');
    
    const isValid = calculatedSignature === receivedSignature;
    if (!isValid) {
      console.error(`[Midtrans-Security] Signature key verification failed! Received: ${receivedSignature}, Calculated: ${calculatedSignature}`);
    }
    return isValid;
  } catch (err) {
    console.error('[Midtrans-Security] Error verifying signature:', err);
    return false;
  }
}
