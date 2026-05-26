export interface SubscriptionPlanDetail {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: number; // IDR per bulan
  features: {
    maxAlertRules: number;
    hasSemanticSearch: boolean;
    hasAiSummary: boolean;
    hasAiMatcher: boolean;
    hasTelegramChannel: boolean;
  };
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlanDetail> = {
  free: {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    features: {
      maxAlertRules: 1, // Hanya boleh mengaktifkan 1 filter notifikasi lelang
      hasSemanticSearch: false, // Hanya keyword search
      hasAiSummary: false, // Tidak bisa membaca Executive AI Summary
      hasAiMatcher: false, // Tidak bisa menghitung Match Score detail
      hasTelegramChannel: false, // Hanya notifikasi email
    },
  },
  pro: {
    id: 'pro',
    name: 'Business Pro',
    price: 499000, // Rp499.000 / bulan
    features: {
      maxAlertRules: 10,
      hasSemanticSearch: true,
      hasAiSummary: true,
      hasAiMatcher: true,
      hasTelegramChannel: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Prime',
    price: 1999000, // Rp1.999.000 / bulan
    features: {
      maxAlertRules: Infinity, // Tidak terbatas
      hasSemanticSearch: true,
      hasAiSummary: true,
      hasAiMatcher: true,
      hasTelegramChannel: true,
    },
  },
};

/**
 * Mendapatkan detail plan berdasarkan ID.
 * Mengembalikan paket 'free' sebagai default jika ID tidak valid.
 */
export function getPlanDetail(planId: string): SubscriptionPlanDetail {
  return SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
}
