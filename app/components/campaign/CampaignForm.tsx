import { useState, useCallback, useEffect } from "react";
import {
  Modal,
  FormLayout,
  TextField,
  Select,
  DatePicker,
  Popover,
  Icon,
  Button,
  InlineStack,
  BlockStack,
  Text,
  Tag,
  Banner,
} from "@shopify/polaris";
import { CalendarIcon, ProductIcon } from "@shopify/polaris-icons";
import { useCampaignMutations } from "../../hooks/campaign";
import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../../../backend/types/campaign";

interface CampaignFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  campaign?: Campaign | null; // If provided, form is in edit mode
}

export function CampaignForm({
  open,
  onClose,
  onSuccess,
  campaign,
}: CampaignFormProps) {
  const isEditMode = !!campaign;
  const { createCampaign, updateCampaign, createState, updateState } =
    useCampaignMutations();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    checkoutBanner: "",
    status: "draft" as const,
    priority: 1,
  });

  const [startDatePickerActive, setStartDatePickerActive] = useState(false);
  const [endDatePickerActive, setEndDatePickerActive] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    undefined,
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    undefined,
  );
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{ id: string; title: string }>
  >([]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form with campaign data if in edit mode
  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description || "",
        checkoutBanner: campaign.checkoutBanner || "",
        status: campaign.status as any,
        priority: campaign.priority,
      });
      setSelectedStartDate(
        campaign.startDate ? new Date(campaign.startDate) : undefined,
      );
      setSelectedEndDate(
        campaign.endDate ? new Date(campaign.endDate) : undefined,
      );
      // Parse products if available
      if (campaign.products) {
        try {
          const productData = JSON.parse(campaign.products);
          // Handle both old format (array of strings) and new format (array of objects)
          if (Array.isArray(productData)) {
            if (productData.length > 0 && typeof productData[0] === "string") {
              // Old format: convert to new format
              setSelectedProducts(
                productData.map((gid) => ({
                  id: gid,
                  title: `Product ${gid.split("/").pop()}`,
                })),
              );
            } else {
              // New format
              setSelectedProducts(productData);
            }
          }
        } catch {
          setSelectedProducts([]);
        }
      }
    }
  }, [campaign]);

  const handleSubmit = useCallback(async () => {
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage("Campaign name is required");
      return;
    }

    if (isEditMode && campaign) {
      // Update existing campaign
      const updateData: UpdateCampaignInput = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        checkoutBanner: formData.checkoutBanner.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
      };

      if (selectedStartDate) {
        updateData.startDate = selectedStartDate.toISOString();
      }

      if (selectedEndDate) {
        updateData.endDate = selectedEndDate.toISOString();
      }

      if (selectedProducts.length > 0) {
        updateData.products = JSON.stringify(
          selectedProducts.map((p) => ({ id: p.id, title: p.title })),
        );
      }

      const updated = await updateCampaign(campaign.id, updateData);

      if (updated) {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        setErrorMessage(updateState.error || "Failed to update campaign");
      }
    } else {
      // Create new campaign
      const submitData: CreateCampaignInput = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        checkoutBanner: formData.checkoutBanner.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
      };

      if (selectedStartDate) {
        submitData.startDate = selectedStartDate.toISOString();
      }

      if (selectedEndDate) {
        submitData.endDate = selectedEndDate.toISOString();
      }

      if (selectedProducts.length > 0) {
        submitData.products = JSON.stringify(
          selectedProducts.map((p) => ({ id: p.id, title: p.title })),
        );
      }

      const created = await createCampaign(submitData);

      if (created) {
        // Reset form
        setFormData({
          name: "",
          description: "",
          checkoutBanner: "",
          status: "draft",
          priority: 1,
        });
        setSelectedStartDate(undefined);
        setSelectedEndDate(undefined);
        setSelectedProducts([]);

        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        setErrorMessage(createState.error || "Failed to create campaign");
      }
    }
  }, [
    formData,
    isEditMode,
    campaign,
    selectedStartDate,
    selectedEndDate,
    selectedProducts,
    createCampaign,
    updateCampaign,
    createState.error,
    updateState.error,
    onSuccess,
    onClose,
  ]);

  const handleClose = useCallback(() => {
    const isLoading = createState.loading || updateState.loading;
    if (!isLoading) {
      onClose();
    }
  }, [createState.loading, updateState.loading, onClose]);

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Active", value: "active" },
    { label: "Paused", value: "paused" },
    { label: "Completed", value: "completed" },
  ];

  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleStartDateChange = ({ start }: { start: Date; end: Date }) => {
    setSelectedStartDate(start);
    setStartDatePickerActive(false);
  };

  const handleEndDateChange = ({ start }: { start: Date; end: Date }) => {
    setSelectedEndDate(start);
    setEndDatePickerActive(false);
  };

  const handleSelectProducts = async () => {
    try {
      // Use Shopify Resource Picker for product selection
      if (
        typeof window !== "undefined" &&
        (window as any).shopify?.resourcePicker
      ) {
        const selected = await (window as any).shopify.resourcePicker({
          type: "product",
          multiple: true,
        });

        if (selected && selected.length > 0) {
          // Add selected products with their IDs and titles
          const newProducts = selected
            .map((product: any) => ({
              id: product.id,
              title: product.title || `Product ${product.id.split("/").pop()}`,
            }))
            .filter(
              (product: { id: string; title: string }) =>
                !selectedProducts.some((p) => p.id === product.id),
            );

          if (newProducts.length > 0) {
            setSelectedProducts([...selectedProducts, ...newProducts]);
          }
        }
      } else {
        // Fallback for development/testing
        setErrorMessage(
          "Product selection requires running in Shopify admin context",
        );
      }
    } catch (error) {
      console.error("Error selecting products:", error);
      setErrorMessage("Failed to select products");
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  if (!open) return null;

  const isLoading = createState.loading || updateState.loading;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditMode ? "Edit campaign" : "Create new campaign"}
      primaryAction={{
        content: isEditMode ? "Save changes" : "Create campaign",
        loading: isLoading,
        onAction: handleSubmit,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleClose,
        },
      ]}
    >
      {errorMessage && (
        <Modal.Section>
          <Banner tone="critical" onDismiss={() => setErrorMessage(null)}>
            {errorMessage}
          </Banner>
        </Modal.Section>
      )}
      <Modal.Section>
        <FormLayout>
          <TextField
            label="Campaign name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="e.g., Summer Sale 2025"
            autoComplete="off"
            requiredIndicator
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
            placeholder="Campaign description"
            autoComplete="off"
            multiline={3}
            helpText="Internal description of the campaign"
          />

          <TextField
            label="Checkout banner content"
            value={formData.checkoutBanner}
            onChange={(value) =>
              setFormData({ ...formData, checkoutBanner: value })
            }
            placeholder="e.g., Hot summer deals - up to 70% off!"
            autoComplete="off"
            multiline={2}
            helpText="Banner text shown at checkout"
          />

          <FormLayout.Group>
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(value) =>
                setFormData({ ...formData, status: value as any })
              }
            />

            <TextField
              label="Priority"
              type="number"
              value={formData.priority.toString()}
              onChange={(value) =>
                setFormData({ ...formData, priority: parseInt(value) || 0 })
              }
              autoComplete="off"
              helpText="Higher priority campaigns show first"
            />
          </FormLayout.Group>

          <Popover
            active={startDatePickerActive}
            activator={
              <TextField
                label="Start date"
                value={formatDateDisplay(selectedStartDate)}
                onFocus={() => setStartDatePickerActive(true)}
                placeholder="Select start date"
                autoComplete="off"
                prefix={<Icon source={CalendarIcon} />}
                helpText="When the campaign should start"
              />
            }
            onClose={() => setStartDatePickerActive(false)}
          >
            <DatePicker
              month={
                selectedStartDate
                  ? selectedStartDate.getMonth()
                  : new Date().getMonth()
              }
              year={
                selectedStartDate
                  ? selectedStartDate.getFullYear()
                  : new Date().getFullYear()
              }
              onChange={handleStartDateChange}
              selected={selectedStartDate}
            />
          </Popover>

          <Popover
            active={endDatePickerActive}
            activator={
              <TextField
                label="End date"
                value={formatDateDisplay(selectedEndDate)}
                onFocus={() => setEndDatePickerActive(true)}
                placeholder="Select end date"
                autoComplete="off"
                prefix={<Icon source={CalendarIcon} />}
                helpText="When the campaign should end"
              />
            }
            onClose={() => setEndDatePickerActive(false)}
          >
            <DatePicker
              month={
                selectedEndDate
                  ? selectedEndDate.getMonth()
                  : new Date().getMonth()
              }
              year={
                selectedEndDate
                  ? selectedEndDate.getFullYear()
                  : new Date().getFullYear()
              }
              onChange={handleEndDateChange}
              selected={selectedEndDate}
            />
          </Popover>

          <BlockStack gap="200">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h3" variant="headingSm">
                Products
              </Text>
              <Button
                onClick={handleSelectProducts}
                icon={ProductIcon}
                size="slim"
              >
                Select products
              </Button>
            </InlineStack>

            {selectedProducts.length > 0 ? (
              <InlineStack gap="200" wrap>
                {selectedProducts.map((product) => (
                  <Tag
                    key={product.id}
                    onRemove={() => handleRemoveProduct(product.id)}
                  >
                    {product.title}
                  </Tag>
                ))}
              </InlineStack>
            ) : (
              <Text as="p" variant="bodySm" tone="subdued">
                No products selected
              </Text>
            )}
          </BlockStack>
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}
