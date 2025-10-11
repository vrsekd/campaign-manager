import { CampaignForm } from "./CampaignForm";
import type { Campaign } from "../../../backend/types/campaign";

interface CampaignEditProps {
  open: boolean;
  onClose: () => void;
  onCampaignUpdated?: () => void;
  campaign: Campaign | null;
}

export function CampaignEdit({
  open,
  onClose,
  onCampaignUpdated,
  campaign,
}: CampaignEditProps) {
  return (
    <CampaignForm
      open={open}
      onClose={onClose}
      onSuccess={onCampaignUpdated}
      campaign={campaign}
    />
  );
}
