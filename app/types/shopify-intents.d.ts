/**
 * Type definitions for Shopify App Bridge APIs
 * @see https://shopify.dev/docs/api/app-home
 */

interface ShopifyProduct {
  id: string; // GID format: "gid://shopify/Product/123456789"
  title?: string;
  handle?: string;
  images?: Array<{ originalSrc: string }>;
  variants?: Array<{ id: string }>;
  [key: string]: unknown;
}

interface ResourcePickerOptions {
  type: "product" | "collection" | "variant";
  multiple?: boolean;
  action?: "select" | "add";
  filter?: {
    variants?: boolean;
    archived?: boolean;
    draft?: boolean;
    hidden?: boolean;
  };
  initialQuery?: string;
  initialSelectionIds?: Array<{ id: string }>;
}

declare global {
  interface Window {
    shopify?: {
      resourcePicker: (
        options: ResourcePickerOptions,
      ) => Promise<ShopifyProduct[] | undefined>;
      intents?: {
        invoke: (
          query: string,
          options?: { data?: any; value?: string },
        ) => Promise<{
          complete?: Promise<{
            code?: "ok" | "closed" | "error";
            data?: {
              id?: string;
              [key: string]: unknown;
            };
            error?: {
              message?: string;
              [key: string]: unknown;
            };
          }>;
        }>;
      };
    };
  }
}

export {};
