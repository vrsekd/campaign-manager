/**
 * Shared Campaign types for frontend and backend
 */

export interface Campaign {
  id: string;
  name: string;
  banner: string | null;
  status: CampaignStatus;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export interface CreateCampaignInput {
  name: string;
  banner?: string;
  status?: CampaignStatus;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
}

export interface UpdateCampaignInput {
  name?: string;
  banner?: string;
  status?: CampaignStatus;
  startDate?: string | null; // ISO string
  endDate?: string | null; // ISO string
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
