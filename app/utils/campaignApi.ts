/**
 * Utility to create an authenticated campaign API client
 */

import { CampaignApiClient } from "../services/campaign.client";

let apiClientInstance: CampaignApiClient | null = null;
let currentBackendUrl: string | null = null;

export function getCampaignApiClient(backendUrl?: string): CampaignApiClient {
  // Recreate client if backend URL changed
  if (backendUrl && backendUrl !== currentBackendUrl) {
    apiClientInstance = null;
    currentBackendUrl = backendUrl;
  }

  if (!apiClientInstance) {
    apiClientInstance = new CampaignApiClient(backendUrl);
  }

  return apiClientInstance;
}

export function resetCampaignApiClient() {
  apiClientInstance = null;
  currentBackendUrl = null;
}
