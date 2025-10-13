/**
 * Utility to create an authenticated campaign API client
 */

import { CampaignApiClient } from "../services/campaign.client";

let apiClientInstance: CampaignApiClient | null = null;

export function getCampaignApiClient(shopDomain?: string): CampaignApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new CampaignApiClient();
  }

  if (shopDomain) {
    apiClientInstance.setShopContext(shopDomain);
  }

  return apiClientInstance;
}

export function resetCampaignApiClient() {
  apiClientInstance = null;
}
