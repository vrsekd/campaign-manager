import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

const BACKEND_URL =
  process.env.BACKEND_URL_DIRECT || "http://localhost:3001/api";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json",
};

async function handleProxyRequest(request: Request): Promise<Response> {
  // Handle OPTIONS preflight BEFORE authentication (to avoid redirects)
  if (request.method === "OPTIONS") {
    console.log("[app_proxy] Handling OPTIONS preflight");
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Shopify app proxy authentication (only for actual requests, not OPTIONS)
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  console.log("[app_proxy] Shop:", url.searchParams.get("shop"));

  try {
    // Get request body for POST
    let productIds: string[] = [];
    if (request.method === "POST") {
      const body = await request.json();
      productIds = body.productIds || [];
    }

    console.log("[app_proxy] Product IDs:", productIds);

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/campaigns/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds }),
    });

    const data = await response.json();
    console.log("[app_proxy] Response:", data);

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error("[app_proxy] Error:", error);
    return new Response(
      JSON.stringify({ banner: null, error: "Proxy error" }),
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return handleProxyRequest(request);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return handleProxyRequest(request);
};
