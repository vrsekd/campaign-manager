import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { campaignApi } from "../../services/campaign.client";
import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../../../backend/types/campaign";

interface MutationState {
  loading: boolean;
  error: string | null;
}

interface UseCampaignMutationsReturn {
  createCampaign: (data: CreateCampaignInput) => Promise<Campaign | undefined>;
  updateCampaign: (
    id: string,
    data: UpdateCampaignInput,
  ) => Promise<Campaign | undefined>;
  deleteCampaign: (id: string) => Promise<boolean>;
  createState: MutationState;
  updateState: MutationState;
  deleteState: MutationState;
}

export function useCampaignMutations(): UseCampaignMutationsReturn {
  const app = useAppBridge();

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
  ): Promise<Campaign | undefined> => {
    try {
      setCreateState({ loading: true, error: null });
      const idToken = await app.idToken();
      const campaign = await campaignApi.createCampaign(
        data,
        idToken as string,
      );
      setCreateState({ loading: false, error: null });
      return campaign;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create campaign";
      setCreateState({ loading: false, error: errorMessage });
      console.error("Error creating campaign:", err);
      return undefined;
    }
  };

  const updateCampaign = async (
    id: string,
    data: UpdateCampaignInput,
  ): Promise<Campaign | undefined> => {
    try {
      setUpdateState({ loading: true, error: null });
      const idToken = await app.idToken();
      const campaign = await campaignApi.updateCampaign(
        id,
        data,
        idToken as string,
      );
      setUpdateState({ loading: false, error: null });
      return campaign;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update campaign";
      setUpdateState({ loading: false, error: errorMessage });
      console.error("Error updating campaign:", err);
      return undefined;
    }
  };

  const deleteCampaign = async (id: string): Promise<boolean> => {
    try {
      setDeleteState({ loading: true, error: null });
      const idToken = await app.idToken();
      await campaignApi.deleteCampaign(id, idToken as string);
      setDeleteState({ loading: false, error: null });
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete campaign";
      setDeleteState({ loading: false, error: errorMessage });
      console.error("Error deleting campaign:", err);
      return false;
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
