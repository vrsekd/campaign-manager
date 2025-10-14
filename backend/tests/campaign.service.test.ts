import { test, expect } from "@playwright/test";
import { setupTestDatabase, teardownTestDatabase } from "./setup-test-db.js";
import { CampaignService } from "../services/campaign.service.js";

test.describe("Campaign Service", () => {
  let prisma: any;
  let campaignService: CampaignService;

  test.beforeAll(async () => {
    prisma = await setupTestDatabase();
    campaignService = new CampaignService(prisma);
  });

  test.afterAll(async () => {
    await teardownTestDatabase(prisma);
  });

  test("should create campaign and verify all data", async () => {
    // Given
    const shop = await prisma.shop.create({
      data: {
        shopDomain: `test-${crypto.randomUUID()}.myshopify.com`,
        accessToken: "test-token",
        scope: "read_products",
      },
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const campaignData = {
      name: "Summer Sale 2025",
      description: "Hot summer deals",
      checkoutBanner: "Get 50% off summer items!",
      status: "active" as const,
      priority: 5,
      startDate: tomorrow.toISOString(),
      endDate: nextWeek.toISOString(),
      products: JSON.stringify([
        { id: "gid://shopify/Product/123", title: "Product 1" },
        { id: "gid://shopify/Product/456", title: "Product 2" },
      ]),
    };

    // When
    const createdCampaign = await campaignService.createCampaign(
      campaignData,
      shop.id,
    );

    // Then
    const fetchedCampaign = await prisma.campaign.findUnique({
      where: { id: createdCampaign.id },
    });

    expect(fetchedCampaign).not.toBeNull();
    expect(fetchedCampaign!.name).toBe(campaignData.name);
    expect(fetchedCampaign!.description).toBe(campaignData.description);
    expect(fetchedCampaign!.checkoutBanner).toBe(campaignData.checkoutBanner);
    expect(fetchedCampaign!.status).toBe(campaignData.status);
    expect(fetchedCampaign!.priority).toBe(campaignData.priority);
    expect(fetchedCampaign!.shopId).toBe(shop.id);
    expect(fetchedCampaign!.startDate).toBeTruthy();
    expect(fetchedCampaign!.endDate).toBeTruthy();
    expect(fetchedCampaign!.products).toBe(campaignData.products);

    const allCampaigns = await campaignService.getAllCampaigns(shop.id);
    expect(allCampaigns).toHaveLength(1);
  });
});
