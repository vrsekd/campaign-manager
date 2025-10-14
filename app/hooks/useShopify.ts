import { useMatches } from "@remix-run/react";

interface ShopifyContext {
  shop: string;
  apiKey?: string;
  apiBackend?: string;
  apiBackendPublic?: string;
}

/**
 * Hook to get Shopify shop context from the app loader
 */
export function useShopify(): ShopifyContext {
  const matches = useMatches();
  const appMatch = matches.find((match) => match.id === "routes/app");

  if (appMatch && appMatch.data) {
    const data = appMatch.data as any;
    return {
      shop: data.shop || "development.myshopify.com",
      apiKey: data.apiKey,
      apiBackend: data.apiBackend || "http://localhost:3001/api",
      apiBackendPublic:
        data.apiBackendPublic || data.apiBackend || "http://localhost:3001/api",
    };
  }

  return {
    shop: "development.myshopify.com",
    apiKey: "",
    apiBackend: "http://localhost:3001/api",
    apiBackendPublic: "http://localhost:3001/api",
  };
}
