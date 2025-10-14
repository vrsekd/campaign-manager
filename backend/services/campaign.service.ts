import type { PrismaClient, Campaign as PrismaCampaign } from "@prisma/client";
import type {
  CreateCampaignBody,
  UpdateCampaignBody,
} from "../schemas/campaign.js";

export class CampaignService {
  private readonly prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getAllCampaigns(shopId: string): Promise<PrismaCampaign[]> {
    return this.prisma.campaign.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getCampaignById(
    id: string,
    shopId: string,
  ): Promise<PrismaCampaign | null> {
    return this.prisma.campaign.findFirst({
      where: { id, shopId },
    });
  }

  async createCampaign(
    data: CreateCampaignBody,
    shopId: string,
  ): Promise<PrismaCampaign> {
    return this.prisma.campaign.create({
      data: {
        shopId,
        name: data.name,
        description: data.description,
        checkoutBanner: data.checkoutBanner,
        status: data.status,
        priority: data.priority,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        products: data.products,
      },
    });
  }

  async updateCampaign(
    id: string,
    data: UpdateCampaignBody,
    shopId: string,
  ): Promise<PrismaCampaign | null> {
    const existing = await this.getCampaignById(id, shopId);
    if (!existing) {
      return null;
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.checkoutBanner !== undefined)
      updateData.checkoutBanner = data.checkoutBanner;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }
    if (data.products !== undefined) updateData.products = data.products;

    return this.prisma.campaign.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCampaign(id: string, shopId: string): Promise<boolean> {
    const existing = await this.getCampaignById(id, shopId);
    if (!existing) {
      return false;
    }

    await this.prisma.campaign.delete({
      where: { id: existing.id },
    });

    return true;
  }

  async getCheckoutBanner(
    productIds: string[],
    shopId?: string,
  ): Promise<{
    banner: string | null;
    campaignId?: string;
    campaignName?: string;
    priority?: number;
  }> {
    const currentDate = new Date();

    const whereClause: any = {
      status: "active",
      startDate: { lte: currentDate },
      endDate: { gte: currentDate },
    };

    if (shopId) {
      whereClause.shopId = shopId;
    }

    const campaigns = await this.prisma.campaign.findMany({
      where: whereClause,
      orderBy: { priority: "desc" },
    });

    for (const campaign of campaigns) {
      if (campaign.products) {
        try {
          const campaignProducts = JSON.parse(campaign.products);
          const productGids = Array.isArray(campaignProducts)
            ? campaignProducts.map((p: any) =>
                typeof p === "string" ? p : p.id,
              )
            : [];

          const hasMatchingProduct = productIds.some((productId) =>
            productGids.some((gid: string) => gid.includes(productId)),
          );

          if (hasMatchingProduct && campaign.checkoutBanner) {
            return {
              banner: campaign.checkoutBanner,
              campaignId: campaign.id,
              campaignName: campaign.name,
              priority: campaign.priority,
            };
          }
        } catch (error) {
          continue;
        }
      }
    }

    return { banner: null };
  }
}
