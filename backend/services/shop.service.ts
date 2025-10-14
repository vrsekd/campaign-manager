import type { PrismaClient } from "@prisma/client";
import type { RegisterShopBody } from "../schemas/shop.js";

export class ShopService {
  private readonly prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async registerOrUpdateShop(data: RegisterShopBody): Promise<{
    shop: { id: string; shopDomain: string };
    isNew: boolean;
  }> {
    const existingShop = await this.prisma.shop.findUnique({
      where: { shopDomain: data.shopDomain },
    });

    if (existingShop) {
      const updatedShop = await this.prisma.shop.update({
        where: { shopDomain: data.shopDomain },
        data: {
          accessToken: data.accessToken,
          scope: data.scope,
          isActive: true,
        },
      });

      return {
        shop: {
          id: updatedShop.id,
          shopDomain: updatedShop.shopDomain,
        },
        isNew: false,
      };
    }

    const shop = await this.prisma.shop.create({
      data: {
        shopDomain: data.shopDomain,
        accessToken: data.accessToken,
        scope: data.scope,
      },
    });

    return {
      shop: {
        id: shop.id,
        shopDomain: shop.shopDomain,
      },
      isNew: true,
    };
  }

  async deactivateShop(shopDomain: string): Promise<boolean> {
    try {
      await this.prisma.shop.update({
        where: { shopDomain },
        data: { isActive: false },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
