import { z } from "zod";

export const campaignStatusEnum = z.enum([
  "draft",
  "active",
  "paused",
  "completed",
]);

export const checkoutBannerSchema = z.object({
  productIds: z.array(z.string()).min(1, "At least one product ID is required"),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export type CheckoutBannerBody = z.infer<typeof checkoutBannerSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
