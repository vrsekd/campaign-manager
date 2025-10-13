import { useState, useEffect, useCallback } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getCampaignApiClient } from "../../utils/campaignApi";
import { useShopify } from "../useShopify";
import type { Campaign } from "../../../backend/types/campaign";

interface UseCampaignsReturn {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCampaigns(): UseCampaignsReturn {
  const app = useAppBridge();
  const shopify = useShopify();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const idToken: string = await app.idToken();
      const apiClient = getCampaignApiClient(shopify.backendUrl);
      const data = await apiClient.getAllCampaigns(idToken);
      setCampaigns(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch campaigns";
      setError(errorMessage);
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  }, [app, shopify.backendUrl]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns,
  };
}
