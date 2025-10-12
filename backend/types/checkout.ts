/**
 * Types for checkout banner API
 */

export interface CheckoutBannerRequest {
  productIds: string[];
}

export interface CheckoutBannerResponse {
  banner: string | null;
  campaignId?: string;
  campaignName?: string;
  priority?: number;
}
