import { useState } from "react";
import {
  IndexTable,
  useIndexResourceState,
  Text,
  Badge,
  useBreakpoints,
  Toast,
  Frame,
  Modal,
} from "@shopify/polaris";
import type { Campaign } from "../../../backend/types/campaign";
import { DeleteIcon } from "@shopify/polaris-icons";
import { useCampaignMutations } from "../../hooks/campaign";
import { CampaignEdit } from "./CampaignEdit";

interface CampaignListProps {
  campaigns: Campaign[];
  onCampaignSelect?: (campaignIds: string[]) => void;
  onCampaignsDeleted?: () => void;
  onCampaignUpdated?: () => void;
}

export function CampaignList({
  campaigns,
  onCampaignSelect,
  onCampaignsDeleted,
  onCampaignUpdated,
}: CampaignListProps) {
  const breakpoints = useBreakpoints();
  const { deleteCampaign } = useCampaignMutations();
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editModalActive, setEditModalActive] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );

  const handleBulkDeleteClick = () => {
    setDeleteModalActive(true);
  };

  const handleBulkDeleteConfirm = async () => {
    setIsDeleting(true);

    let successCount = 0;
    let failCount = 0;

    for (const campaignId of selectedResources) {
      const success = await deleteCampaign(campaignId);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setIsDeleting(false);
    setDeleteModalActive(false);

    if (failCount === 0) {
      setToastMessage(`Successfully deleted ${successCount} campaign(s)`);
      setToastError(false);
    } else {
      setToastMessage(
        `Deleted ${successCount} campaign(s), failed to delete ${failCount}`,
      );
      setToastError(true);
    }
    setToastActive(true);

    if (onCampaignsDeleted) {
      onCampaignsDeleted();
    }
  };

  const promotedBulkActions = [
    {
      icon: DeleteIcon,
      destructive: true,
      content: "Delete campaigns",
      onAction: handleBulkDeleteClick,
    },
  ];

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge progress="complete">Active</Badge>;
      case "draft":
        return <Badge>Draft</Badge>;
      case "paused":
        return <Badge progress="incomplete">Paused</Badge>;
      case "completed":
        return <Badge tone="success">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formattedCampaigns = campaigns.map((campaign) => ({
    id: campaign.id,
    name: (
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        {campaign.name}
      </Text>
    ),
    description: campaign.description || "—",
    checkoutBanner: campaign.checkoutBanner || "—",
    priority: campaign.priority,
    dateStart: formatDate(campaign.startDate),
    dateEnd: formatDate(campaign.endDate),
    status: getStatusBadge(campaign.status),
    productCount: campaign.products
      ? (() => {
          try {
            return JSON.parse(campaign.products).length;
          } catch {
            return 0;
          }
        })()
      : 0,
  }));

  const resourceName = {
    singular: "campaign",
    plural: "campaigns",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(formattedCampaigns);

  const handleRowClick = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
      setEditModalActive(true);
    }
  };

  const handleEditClose = () => {
    setEditModalActive(false);
    setSelectedCampaign(null);
  };

  const handleEditSuccess = () => {
    if (onCampaignUpdated) {
      onCampaignUpdated();
    }
  };

  const rowMarkup = formattedCampaigns.map(
    (
      {
        id,
        name,
        description,
        priority,
        productCount,
        dateStart,
        dateEnd,
        status,
      },
      index,
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
        onClick={() => handleRowClick(id)}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {name}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodySm" tone="subdued">
            {description}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{priority}</IndexTable.Cell>
        <IndexTable.Cell>{productCount} products</IndexTable.Cell>
        <IndexTable.Cell>{dateStart}</IndexTable.Cell>
        <IndexTable.Cell>{dateEnd}</IndexTable.Cell>
        <IndexTable.Cell>{status}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  const toastMarkup = toastActive ? (
    <Toast
      content={toastMessage}
      onDismiss={() => setToastActive(false)}
      error={toastError}
    />
  ) : null;

  return (
    <Frame>
      {toastMarkup}
      <CampaignEdit
        open={editModalActive}
        onClose={handleEditClose}
        onCampaignUpdated={handleEditSuccess}
        campaign={selectedCampaign}
      />
      <Modal
        open={deleteModalActive}
        onClose={() => setDeleteModalActive(false)}
        title="Delete campaigns"
        primaryAction={{
          content: "Delete",
          destructive: true,
          loading: isDeleting,
          onAction: handleBulkDeleteConfirm,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setDeleteModalActive(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            <p>
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="bold">
                {selectedResources.length}
              </Text>{" "}
              campaign(s)? This action cannot be undone.
            </p>
          </Text>
        </Modal.Section>
      </Modal>

      <IndexTable
        condensed={breakpoints.smDown}
        resourceName={resourceName}
        itemCount={formattedCampaigns.length}
        hasZebraStriping={true}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "Campaign name" },
          { title: "Description" },
          { title: "Priority" },
          { title: "Products" },
          { title: "Start date" },
          { title: "End date" },
          { title: "Status" },
        ]}
        promotedBulkActions={promotedBulkActions}
      >
        {rowMarkup}
      </IndexTable>
    </Frame>
  );
}
