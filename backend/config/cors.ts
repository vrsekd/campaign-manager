export const corsConfig = {
  origin: [
    "https://extensions.shopifycdn.com",
    /\.myshopify\.com$/,
    "https://checkout.shopify.com",
    /\.trycloudflare\.com$/,
    /\.ngrok-free\.dev$/,
    /\.ngrok\.io$/,
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Shopify-Access-Token"],
  exposedHeaders: ["Content-Type"],
};
