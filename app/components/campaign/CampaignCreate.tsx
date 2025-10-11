import { CampaignForm } from "./CampaignForm";

interface CampaignCreateProps {
  open: boolean;
  onClose: () => void;
  onCampaignCreated?: () => void;
}

export function CampaignCreate({
  open,
  onClose,
  onCampaignCreated,
}: CampaignCreateProps) {
  return (
    <CampaignForm
      open={open}
      onClose={onClose}
      onSuccess={onCampaignCreated}
      campaign={null}
    />
  );
}
