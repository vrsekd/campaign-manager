import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { registerShopSchema, type RegisterShopBody } from "../schemas/shop.js";
import { ShopService } from "../services/shop.service.js";
import { ErrorHandler } from "../utils/error-handler.js";

export default async function shopRoutes(fastify: FastifyInstance) {
  const shopService = new ShopService(fastify.prisma);
  fastify.post<{ Body: RegisterShopBody }>(
    "/shops/register",
    async (
      request: FastifyRequest<{ Body: RegisterShopBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const validatedData = registerShopSchema.parse(request.body);
        const result = await shopService.registerOrUpdateShop(validatedData);

        const statusCode = result.isNew ? 201 : 200;
        const message = result.isNew ? "Shop registered" : "Shop updated";

        return reply.code(statusCode).send({
          message,
          shop: result.shop,
        });
      } catch (error) {
        return ErrorHandler.handleError(
          error,
          reply,
          fastify.log,
          "Failed to register shop",
        );
      }
    },
  );

  fastify.delete("/shops/:shopDomain", async (request, reply) => {
    try {
      const { shopDomain } = request.params as { shopDomain: string };
      const deactivated = await shopService.deactivateShop(shopDomain);

      if (!deactivated) {
        return ErrorHandler.notFound(reply, "Shop not found");
      }

      return reply.code(200).send({
        message: "Shop deactivated",
      });
    } catch (error) {
      return ErrorHandler.handleError(
        error,
        reply,
        fastify.log,
        "Failed to deactivate shop",
      );
    }
  });
}
