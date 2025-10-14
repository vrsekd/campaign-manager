import { z } from "zod";

export const registerShopSchema = z.object({
  shopDomain: z.string().min(1, "Shop domain is required"),
  accessToken: z.string().min(1, "Access token is required"),
  scope: z.string().optional(),
});

export type RegisterShopBody = z.infer<typeof registerShopSchema>;
