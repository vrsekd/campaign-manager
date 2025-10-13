import {
  reactExtension,
  Banner,
  useCartLines,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

export default reactExtension("purchase.checkout.header.render-after", () => (
  <Extension />
));

function Extension() {
  const lines = useCartLines();
  const { shop } = useApi();
  const [banner, setBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBanner() {
      try {
        // Extract product IDs from cart lines
        const productIds = lines
          .map((line) => {
            const productId = line.merchandise.product.id;
            // Extract numeric ID from GID (e.g., "gid://shopify/Product/123" -> "123")
            return productId.split("/").pop() || "";
          })
          .filter((id) => id);

        console.log("[Campaign Banner] Cart product IDs:", productIds);

        if (productIds.length === 0) {
          console.log("[Campaign Banner] No products in cart");
          setBanner(null);
          setLoading(false);
          return;
        }

        // Fetch banner through Shopify App Proxy
        // Accessible at: https://shop.myshopify.com/apps/campaign-banner
        const proxyUrl = `https://${shop.myshopifyDomain}/apps/campaign-banner`;
        console.log("[Campaign Banner] Fetching from:", proxyUrl);
        console.log("[Campaign Banner] Request body:", { productIds });

        const response = await fetch(proxyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds }),
        });

        console.log("[Campaign Banner] Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("[Campaign Banner] Response data:", data);
          setBanner(data.banner);

          if (data.banner) {
            console.log(
              `[Campaign Banner] Displaying banner from campaign: ${data.campaignName} (priority: ${data.priority})`,
            );
          } else {
            console.log("[Campaign Banner] No matching campaign found");
          }
        } else {
          console.error(
            "[Campaign Banner] Response not OK:",
            response.statusText,
          );
        }
      } catch (error) {
        console.error("[Campaign Banner] Error fetching banner:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBanner();
  }, [lines]);

  if (loading || !banner) {
    return null;
  }

  return <Banner status="info">{banner}</Banner>;
}
