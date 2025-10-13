import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import campaignRoutes from "./routes/campaigns.js";
import healthRoutes from "./routes/health.js";

const prisma = new PrismaClient();
const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
});

await fastify.register(cors, {
  origin: [
    "https://extensions.shopifycdn.com",
    /\.myshopify\.com$/,
    "https://checkout.shopify.com",

    /\.trycloudflare\.com$/,
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

fastify.decorate("prisma", prisma);

fastify.register(healthRoutes);
fastify.register(campaignRoutes, { prefix: "/api" });

const closeGracefully = async (signal: string) => {
  fastify.log.info(`Received signal to terminate: ${signal}`);
  await prisma.$disconnect();
  await fastify.close();
  process.exit(0);
};

process.on("SIGINT", () => closeGracefully("SIGINT"));
process.on("SIGTERM", () => closeGracefully("SIGTERM"));

const start = async () => {
  try {
    const port = parseInt(process.env.BACKEND_PORT || "3001", 10);
    const host = process.env.BACKEND_HOST || "0.0.0.0";

    await fastify.listen({ port, host });
    fastify.log.info(`Server listening on ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
