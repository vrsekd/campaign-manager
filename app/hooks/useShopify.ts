import { useMatches } from "@remix-run/react";

interface ShopifyContext {
  shop: string;
  apiKey?: string;
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
    };
  }

  return {
    shop: "development.myshopify.com",
    apiKey: "",
  };
}
