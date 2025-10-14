/**
 * Shared Campaign types for frontend and backend
 */

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  checkoutBanner: string | null;
  status: CampaignStatus;
  priority: number;
  startDate: Date | null;
  endDate: Date | null;
  products: string | null; 
  createdAt: Date;
  updatedAt: Date;
}

export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export interface CreateCampaignInput {
  name: string;
  description?: string;
  checkoutBanner?: string;
  status?: CampaignStatus;
  priority?: number;
  startDate?: string; 
  endDate?: string; 
  products?: string; 
}

export interface UpdateCampaignInput {
  name?: string;
  description?: string;
  checkoutBanner?: string;
  status?: CampaignStatus;
  priority?: number;
  startDate?: string | null; 
  endDate?: string | null; 
  products?: string | null; 
}

export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
