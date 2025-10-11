import { useState, useEffect, useCallback } from "react";
import { campaignApi } from "../../services/campaign.client";
import type { Campaign } from "../../../backend/types/campaign";

interface UseCampaignsReturn {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCampaigns(): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await campaignApi.getAllCampaigns();
      setCampaigns(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch campaigns";
      setError(errorMessage);
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
