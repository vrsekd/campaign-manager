import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  try {
    console.log("[app.install] Registering shop:", session.shop);

    const response = await fetch("http://localhost:3001/api/shops/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shopDomain: session.shop,
        accessToken: session.accessToken,
        scope: session.scope,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[app.install] Backend registration failed:", errorData);
      throw new Error(`Failed to register shop: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[app.install] Shop registered successfully:", data);

    return redirect("/app");
  } catch (error) {
    console.error("[app.install] Error during installation:", error);

    return json(
      {
        error: "Failed to complete installation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
