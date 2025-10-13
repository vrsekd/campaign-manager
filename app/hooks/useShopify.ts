import { useMatches } from "@remix-run/react";

interface ShopifyContext {
  shop: string;
  apiKey?: string;
  backendUrl?: string;
}

/**
 * Hook to get Shopify shop context from the app loader
 */
export function useShopify(): ShopifyContext {
  const matches = useMatches();
  const appMatch = matches.find((match) => match.id === "routes/app");

  if (appMatch && appMatch.data) {
    const data = appMatch.data as any;
    console.log("[useShopify] Loader data:", data);
    const backendUrl = data.backendUrl || "/api/backend";
    console.log("[useShopify] Backend URL:", backendUrl);

    return {
      shop: data.shop || "development.myshopify.com",
      apiKey: data.apiKey,
      backendUrl,
    };
  }

  console.warn("[useShopify] No app match found");
  return {
    shop: "development.myshopify.com",
    apiKey: "",
    backendUrl: "/api/backend",
  };
}
