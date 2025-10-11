import { useState, useCallback, useEffect } from "react";
import {
  Modal,
  FormLayout,
  TextField,
  Select,
  Toast,
  DatePicker,
  Popover,
  Icon,
} from "@shopify/polaris";
import { CalendarIcon } from "@shopify/polaris-icons";
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
    banner: "",
    status: "draft" as const,
  });

  const [startDatePickerActive, setStartDatePickerActive] = useState(false);
  const [endDatePickerActive, setEndDatePickerActive] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    undefined,
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    undefined,
  );

  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Initialize form with campaign data if in edit mode
  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        banner: campaign.banner || "",
        status: campaign.status as any,
      });
      setSelectedStartDate(
        campaign.startDate ? new Date(campaign.startDate) : undefined,
      );
      setSelectedEndDate(
        campaign.endDate ? new Date(campaign.endDate) : undefined,
      );
    }
  }, [campaign]);

  const handleSubmit = useCallback(async () => {
    if (!formData.name.trim()) {
      setToastMessage("Campaign name is required");
      setToastError(true);
      setToastActive(true);
      return;
    }

    if (isEditMode && campaign) {
      // Update existing campaign
      const updateData: UpdateCampaignInput = {
        name: formData.name.trim(),
        status: formData.status,
      };

      if (formData.banner !== undefined) {
        updateData.banner = formData.banner.trim() || undefined;
      }

      if (selectedStartDate) {
        updateData.startDate = selectedStartDate.toISOString();
      }

      if (selectedEndDate) {
        updateData.endDate = selectedEndDate.toISOString();
      }

      const updated = await updateCampaign(campaign.id, updateData);

      if (updated) {
        setToastMessage("Campaign updated successfully");
        setToastError(false);
        setToastActive(true);

        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        setToastMessage(updateState.error || "Failed to update campaign");
        setToastError(true);
        setToastActive(true);
      }
    } else {
      // Create new campaign
      const submitData: CreateCampaignInput = {
        name: formData.name.trim(),
        status: formData.status,
      };

      if (formData.banner?.trim()) {
        submitData.banner = formData.banner.trim();
      }

      if (selectedStartDate) {
        submitData.startDate = selectedStartDate.toISOString();
      }

      if (selectedEndDate) {
        submitData.endDate = selectedEndDate.toISOString();
      }

      const created = await createCampaign(submitData);

      if (created) {
        setToastMessage("Campaign created successfully");
        setToastError(false);
        setToastActive(true);

        // Reset form
        setFormData({
          name: "",
          banner: "",
          status: "draft",
        });
        setSelectedStartDate(undefined);
        setSelectedEndDate(undefined);

        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        setToastMessage(createState.error || "Failed to create campaign");
        setToastError(true);
        setToastActive(true);
      }
    }
  }, [
    formData,
    isEditMode,
    campaign,
    selectedStartDate,
    selectedEndDate,
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

  if (!open) return null;

  const isLoading = createState.loading || updateState.loading;

  const toastMarkup = toastActive ? (
    <Toast
      content={toastMessage}
      onDismiss={() => setToastActive(false)}
      error={toastError}
    />
  ) : null;

  return (
    <>
      {toastMarkup}
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
              label="Banner"
              value={formData.banner}
              onChange={(value) => setFormData({ ...formData, banner: value })}
              placeholder="e.g., Hot summer deals - up to 70% off!"
              autoComplete="off"
              helpText="Optional banner text to display"
            />

            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(value) =>
                setFormData({ ...formData, status: value as any })
              }
            />

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
          </FormLayout>
        </Modal.Section>
      </Modal>
    </>
  );
}
