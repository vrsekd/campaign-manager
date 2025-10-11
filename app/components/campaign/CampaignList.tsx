import { useState } from "react";
import {
  IndexTable,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  Text,
  Badge,
  useBreakpoints,
  Toast,
  Frame,
  Modal,
  type TabProps,
  type IndexFiltersProps,
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

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const [itemStrings, setItemStrings] = useState(["All", "Active", "Inactive"]);

  const tabs: TabProps[] = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions: [],
  }));

  const [selected, setSelected] = useState(0);

  const onCreateNewView = async (value: string) => {
    await sleep(500);
    setItemStrings([...itemStrings, value]);
    setSelected(itemStrings.length);
    return true;
  };

  const sortOptions: IndexFiltersProps["sortOptions"] = [
    { label: "Campaign name", value: "order asc", directionLabel: "Ascending" },
    {
      label: "Campaign name",
      value: "order desc",
      directionLabel: "Descending",
    },
  ];

  const [sortSelected, setSortSelected] = useState(["order asc"]);
  const { mode, setMode } = useSetIndexFiltersMode();
  const onHandleCancel = () => {};

  const onHandleSave = async () => {
    await sleep(1);
    return true;
  };

  const primaryAction: IndexFiltersProps["primaryAction"] =
    selected === 0
      ? {
          type: "save-as",
          onAction: onCreateNewView,
          disabled: false,
          loading: false,
        }
      : {
          type: "save",
          onAction: onHandleSave,
          disabled: false,
          loading: false,
        };

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

  const [queryValue, setQueryValue] = useState("");

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Get status badge based on campaign status
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

  // Map campaigns data to table format
  const formattedCampaigns = campaigns.map((campaign) => ({
    id: campaign.id,
    name: (
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        {campaign.name}
      </Text>
    ),
    banner: campaign.banner || "No banner",
    dateStart: formatDate(campaign.startDate),
    dateEnd: formatDate(campaign.endDate),
    status: getStatusBadge(campaign.status),
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
    ({ id, name, banner, dateStart, dateEnd, status }, index) => (
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
        <IndexTable.Cell>{banner}</IndexTable.Cell>
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
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "Campaign name" },
          { title: "Banner" },
          { title: "Date start" },
          { title: "Date end" },
          { title: "Status" },
        ]}
        promotedBulkActions={promotedBulkActions}
      >
        {rowMarkup}
      </IndexTable>
    </Frame>
  );
}
