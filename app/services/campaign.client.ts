/**
 * Campaign API Client for Frontend
 *
 * This service provides methods to interact with the Fastify backend API
 * for campaign management.
 */

import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../../backend/types/campaign";

export class CampaignApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "/api";
  }

  /**
   * Fetch all campaigns
   */
  async getAllCampaigns(idToken: string): Promise<Campaign[]> {
    const response = await fetch(`${this.baseUrl}/campaigns`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch a single campaign by ID
   */
  async getCampaign(id: string, idToken: string): Promise<Campaign> {
    const response = await fetch(`${this.baseUrl}/campaigns/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Campaign not found");
      }
      throw new Error(`Failed to fetch campaign: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Create a new campaign
   */
  async createCampaign(
    data: CreateCampaignInput,
    idToken: string,
  ): Promise<Campaign> {
    const response = await fetch(`${this.baseUrl}/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create campaign");
    }

    return response.json();
  }

  /**
   * Update an existing campaign
   */
  async updateCampaign(
    id: string,
    data: UpdateCampaignInput,
    idToken: string,
  ): Promise<Campaign> {
    const response = await fetch(`${this.baseUrl}/campaigns/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Campaign not found");
      }
      const error = await response.json();
      throw new Error(error.message || "Failed to update campaign");
    }

    return response.json();
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(id: string, idToken: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/campaigns/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Campaign not found");
      }
      throw new Error(`Failed to delete campaign: ${response.statusText}`);
    }
  }

  /**
   * Get checkout banner for products
   * Returns banner text if any active campaign matches the provided products
   */
  async getCheckoutBanner(productIds: string[]): Promise<{
    banner: string | null;
    campaignId?: string;
    campaignName?: string;
    priority?: number;
  }> {
    const response = await fetch(`${this.baseUrl}/campaigns/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productIds }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch checkout banner: ${response.statusText}`,
      );
    }

    return response.json();
  }
}


export const campaignApi = new CampaignApiClient();
