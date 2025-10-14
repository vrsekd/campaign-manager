import type { FastifyRequest, FastifyReply } from "fastify";
import { createHmac } from "crypto";
import jwt from "jsonwebtoken";

export type AuthenticatedRequest<T = any> = FastifyRequest<T> & {
  shopDomain?: string;
  shopId?: string;
};

interface ShopifyJWTPayload {
  iss: string;
  dest: string;
  aud: string;
  sub: string;
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
  sid: string;
}

async function verifyShopifyJWT(
  token: string,
  apiSecret: string,
): Promise<ShopifyJWTPayload | null> {
  try {
    const decoded = jwt.verify(token, apiSecret, {
      algorithms: ["HS256"],
    }) as ShopifyJWTPayload;

    return decoded;
  } catch (error) {
    console.error("[verifyShopifyJWT] Error:", error);
    return null;
  }
}

export async function authenticateShopify(
  request: AuthenticatedRequest,
  reply: FastifyReply,
) {
  const authHeader = request.headers.authorization;
  const apiSecret = process.env.SHOPIFY_API_SECRET;

  console.log("[auth] Request to:", request.url);
  console.log("[auth] Has Authorization header:", !!authHeader);

  if (!apiSecret) {
    console.error("[auth] SHOPIFY_API_SECRET not configured");
    return reply.code(500).send({
      error: "Internal Server Error",
      message: "Server configuration error",
    });
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[auth] No valid Bearer token in header");
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Missing or invalid Authorization header",
    });
  }

  const token = authHeader.substring(7);
  console.log("[auth] Token length:", token.length);

  const payload = await verifyShopifyJWT(token, apiSecret);

  if (!payload) {
    console.log("[auth] JWT verification failed");
    return reply.code(401).send({
      error: "Unauthorized",
      message:
        "Invalid session token - check SHOPIFY_API_SECRET matches your app",
    });
  }

  console.log("[auth] JWT verified successfully for:", payload.dest);

  // Extract shop domain from JWT (dest field contains https://shop-domain.myshopify.com)
  const shopDomain = payload.dest.replace("https://", "");

  // Find or create shop
  let shop = await request.server.prisma.shop.findUnique({
    where: { shopDomain },
  });

  if (!shop) {
    // Auto-create shop on first request with valid JWT
    shop = await request.server.prisma.shop.create({
      data: {
        shopDomain,
        accessToken: "", // Will be updated via OAuth afterAuth hook
        scope: "",
        isActive: true,
      },
    });
    console.log("[auth] Auto-created shop:", shopDomain);
  }

  if (!shop.isActive) {
    // Reactivate shop if they have a valid JWT
    console.log("[auth] Reactivating shop:", shopDomain);
    shop = await request.server.prisma.shop.update({
      where: { shopDomain },
      data: { isActive: true },
    });
  }

  request.shopDomain = shopDomain;
  request.shopId = shop.id;
}

export function verifyShopifyWebhook(
  body: string,
  hmacHeader: string,
  secret: string,
): boolean {
  const hash = createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");
  return hash === hmacHeader;
}
