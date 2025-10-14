import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../../backend/types/campaign";

async function fetchWithAuth(
  url: string,
  idToken: string,
  options: RequestInit = {},
) {
  if (!url) {
    throw new Error("URL is required");
  }
  if (!idToken) {
    throw new Error("ID token is required");
  }

  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

export async function getAllCampaigns(
  baseUrl: string,
  idToken: string,
): Promise<Campaign[]> {
  const response = await fetchWithAuth(`${baseUrl}/campaigns`, idToken);

  if (!response.ok) {
    throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
  }

  return response.json();
}

export async function getCampaign(
  baseUrl: string,
  id: string,
  idToken: string,
): Promise<Campaign> {
  if (!id) {
    throw new Error("Campaign ID is required");
  }

  const response = await fetchWithAuth(`${baseUrl}/campaigns/${id}`, idToken);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Campaign not found");
    }
    throw new Error(`Failed to fetch campaign: ${response.statusText}`);
  }

  return response.json();
}

export async function createCampaign(
  baseUrl: string,
  data: CreateCampaignInput,
  idToken: string,
): Promise<Campaign> {
  if (!data) {
    throw new Error("Campaign data is required");
  }

  const response = await fetchWithAuth(`${baseUrl}/campaigns`, idToken, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create campaign");
  }

  return response.json();
}

export async function updateCampaign(
  baseUrl: string,
  id: string,
  data: UpdateCampaignInput,
  idToken: string,
): Promise<Campaign> {
  if (!id) {
    throw new Error("Campaign ID is required");
  }
  if (!data) {
    throw new Error("Campaign data is required");
  }

  const response = await fetchWithAuth(`${baseUrl}/campaigns/${id}`, idToken, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Campaign not found");
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update campaign");
  }

  return response.json();
}

export async function deleteCampaign(
  baseUrl: string,
  id: string,
  idToken: string,
): Promise<void> {
  if (!id) {
    throw new Error("Campaign ID is required");
  }

  const response = await fetchWithAuth(`${baseUrl}/campaigns/${id}`, idToken, {
    method: "DELETE",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Campaign not found");
    }
    throw new Error(`Failed to delete campaign: ${response.statusText}`);
  }
}
