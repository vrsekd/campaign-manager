import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import * as campaignApi from "../../services/campaign.client";
import { useShopify } from "../useShopify";
import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../../../backend/types/campaign";
import type {
  MutationState,
  UseCampaignMutationsReturn,
  MutationResult,
} from "../../types/hooks";

export function useCampaignMutations(): UseCampaignMutationsReturn {
  const app = useAppBridge();
  const shopify = useShopify();

  const [createState, setCreateState] = useState<MutationState>({
    loading: false,
    error: null,
  });
  const [updateState, setUpdateState] = useState<MutationState>({
    loading: false,
    error: null,
  });
  const [deleteState, setDeleteState] = useState<MutationState>({
    loading: false,
    error: null,
  });

  const createCampaign = async (
    data: CreateCampaignInput,
  ): Promise<MutationResult<Campaign>> => {
    try {
      setCreateState({ loading: true, error: null });
      const idToken = await app.idToken();
      const campaign = await campaignApi.createCampaign(
        shopify.apiBackend!,
        data,
        idToken as string,
      );
      setCreateState({ loading: false, error: null });
      return { data: campaign, success: true, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create campaign";
      setCreateState({ loading: false, error: errorMessage });
      console.error("Error creating campaign:", err);
      return { data: null, success: false, error: errorMessage };
    }
  };

  const updateCampaign = async (
    id: string,
    data: UpdateCampaignInput,
  ): Promise<MutationResult<Campaign>> => {
    try {
      setUpdateState({ loading: true, error: null });
      const idToken = await app.idToken();
      const campaign = await campaignApi.updateCampaign(
        shopify.apiBackend!,
        id,
        data,
        idToken as string,
      );
      setUpdateState({ loading: false, error: null });
      return { data: campaign, success: true, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update campaign";
      setUpdateState({ loading: false, error: errorMessage });
      console.error("Error updating campaign:", err);
      return { data: null, success: false, error: errorMessage };
    }
  };

  const deleteCampaign = async (
    id: string,
  ): Promise<MutationResult<Campaign>> => {
    try {
      setDeleteState({ loading: true, error: null });
      const idToken = await app.idToken();
      await campaignApi.deleteCampaign(
        shopify.apiBackend!,
        id,
        idToken as string,
      );
      setDeleteState({ loading: false, error: null });
      return { data: null, success: true, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete campaign";
      setDeleteState({ loading: false, error: errorMessage });
      console.error("Error deleting campaign:", err);
      return { data: null, success: false, error: errorMessage };
    }
  };

  return {
    createCampaign,
    updateCampaign,
    deleteCampaign,
    createState,
    updateState,
    deleteState,
  };
}
