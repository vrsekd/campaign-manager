import { z } from "zod";
import { campaignStatusEnum } from "../types/routes.js";

export const createCampaignSchema = z
  .object({
    name: z.string().min(1, "Campaign name is required"),
    description: z.string().optional(),
    checkoutBanner: z.string().min(1, "Checkout banner is required"),
    status: campaignStatusEnum.optional().default("draft"),
    priority: z.number().int().min(1, "Priority must be at least 1").default(1),
    startDate: z.string().datetime("Start date must be a valid date"),
    endDate: z.string().datetime("End date must be a valid date"),
    products: z.string().min(1, "At least one product must be selected"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const now = new Date();
      start.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      return start >= now;
    },
    {
      message: "Start date cannot be in the past (today is allowed)",
      path: ["startDate"],
    },
  )
  .refine(
    (data) => {
      const end = new Date(data.endDate);
      const now = new Date();
      end.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      return end >= now;
    },
    {
      message: "End date cannot be in the past (today is allowed)",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export const updateCampaignSchema = z
  .object({
    name: z.string().min(1, "Campaign name cannot be empty").optional(),
    description: z.string().optional(),
    checkoutBanner: z
      .string()
      .min(1, "Checkout banner cannot be empty")
      .optional(),
    status: campaignStatusEnum.optional(),
    priority: z.number().int().min(1, "Priority must be at least 1").optional(),
    startDate: z.string().datetime("Invalid date format").optional().nullable(),
    endDate: z.string().datetime("Invalid date format").optional().nullable(),
    products: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate) {
        const start = new Date(data.startDate);
        const now = new Date();
        start.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        return start >= now;
      }
      return true;
    },
    {
      message: "Start date cannot be in the past (today is allowed)",
      path: ["startDate"],
    },
  )
  .refine(
    (data) => {
      if (data.endDate) {
        const end = new Date(data.endDate);
        const now = new Date();
        end.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        return end >= now;
      }
      return true;
    },
    {
      message: "End date cannot be in the past (today is allowed)",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end >= start;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export type CreateCampaignBody = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignBody = z.infer<typeof updateCampaignSchema>;
