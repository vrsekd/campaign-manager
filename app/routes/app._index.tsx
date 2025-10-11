import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Spinner, Banner } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useCampaigns } from "../hooks/campaign";
import { CampaignList, CampaignCreate } from "../components/campaign";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  const { campaigns, loading, error, refetch } = useCampaigns();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  if (error) {
    return (
      <Page fullWidth={true}>
        <Banner
          title="Error loading campaigns"
          tone="critical"
          onDismiss={() => {}}
        >
          <p>{error}</p>
        </Banner>
      </Page>
    );
  }

  return (
    <Page
      title="Campaigns"
      primaryAction={{
        content: "Add campaign",
        onAction: () => setCreateModalOpen(true),
      }}
      secondaryActions={[
        {
          content: "Refresh",
          onAction: refetch,
        },
      ]}
      fullWidth={true}
    >
      <CampaignCreate
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCampaignCreated={refetch}
      />

      {loading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Spinner accessibilityLabel="Loading campaigns" size="large" />
        </div>
      ) : (
        <CampaignList
          campaigns={campaigns}
          onCampaignsDeleted={refetch}
          onCampaignUpdated={refetch}
        />
      )}
    </Page>
  );
}
