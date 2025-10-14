import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const apiBackend = process.env.API_BACKEND || "http://localhost:3001/api";
  const apiBackendPublic = process.env.API_BACKEND_PUBLIC || apiBackend;

  console.log(
    "[app.tsx loader] API_BACKEND from env:",
    process.env.API_BACKEND,
  );
  console.log(
    "[app.tsx loader] API_BACKEND_PUBLIC from env:",
    process.env.API_BACKEND_PUBLIC,
  );

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shop: session.shop,
    apiBackend,
    apiBackendPublic,
  };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
