import { useState, useEffect, useCallback } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { campaignApi } from "../../services/campaign.client";
import type { Campaign } from "../../../backend/types/campaign";

interface UseCampaignReturn {
  campaign: Campaign | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCampaign(id: string | undefined): UseCampaignReturn {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const app = useAppBridge();

  const fetchCampaign = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const idToken: string = await app.idToken();
      const data = await campaignApi.getCampaign(id, idToken);
      setCampaign(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch campaign";
      setError(errorMessage);
      console.error("Error fetching campaign:", err);
    } finally {
      setLoading(false);
    }
  }, [id, app]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  return {
    campaign,
    loading,
    error,
    refetch: fetchCampaign,
  };
}
