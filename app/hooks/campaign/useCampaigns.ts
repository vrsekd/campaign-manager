import { useState, useEffect, useCallback } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import * as campaignApi from "../../services/campaign.client";
import { useShopify } from "../useShopify";
import type { Campaign } from "../../../backend/types/campaign";
import type { UseCampaignsReturn } from "../../types/hooks";

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
      const data = await campaignApi.getAllCampaigns(
        shopify.apiBackend!,
        idToken,
      );
      setCampaigns(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch campaigns";
      setError(errorMessage);
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  }, [app, shopify.apiBackend]);

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
