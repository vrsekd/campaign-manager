import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../../backend/types/campaign";

export type MutationState = {
  loading: boolean;
  error: string | null;
};

export type UseCampaignMutationsReturn = {
  createCampaign: (
    data: CreateCampaignInput,
  ) => Promise<MutationResult<Campaign>>;
  updateCampaign: (
    id: string,
    data: UpdateCampaignInput,
  ) => Promise<MutationResult<Campaign>>;
  deleteCampaign: (id: string) => Promise<MutationResult<Campaign>>;
  createState: MutationState;
  updateState: MutationState;
  deleteState: MutationState;
};

export type UseCampaignsReturn = {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export type UseCampaignReturn = {
  campaign: Campaign | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export type MutationResult<T> = {
  data: T | null;
  success: boolean;
  error: string | null;
};
