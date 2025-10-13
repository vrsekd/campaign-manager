import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session } = await authenticate.webhook(request);

  console.log(`[webhooks] Shop reinstalled: ${shop}`);

  if (session) {
    try {
      const backendUrl = process.env.BACKEND_URL || "http://localhost:3001/api";
      const response = await fetch(`${backendUrl}/shops/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopDomain: shop,
          accessToken: session.accessToken,
          scope: session.scope,
        }),
      });

      if (response.ok) {
        console.log(`[webhooks] Shop ${shop} re-registered successfully`);
      }
    } catch (error) {
      console.error("[webhooks] Error re-registering shop:", error);
    }
  }

  return new Response();
};
