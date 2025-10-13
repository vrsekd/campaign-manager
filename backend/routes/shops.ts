import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

const registerShopSchema = z.object({
  shopDomain: z.string().min(1, "Shop domain is required"),
  accessToken: z.string().min(1, "Access token is required"),
  scope: z.string().optional(),
});

type RegisterShopBody = z.infer<typeof registerShopSchema>;

export default async function shopRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: RegisterShopBody }>(
    "/shops/register",
    async (
      request: FastifyRequest<{ Body: RegisterShopBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const validatedData = registerShopSchema.parse(request.body);

        const existingShop = await fastify.prisma.shop.findUnique({
          where: { shopDomain: validatedData.shopDomain },
        });

        if (existingShop) {
          const updatedShop = await fastify.prisma.shop.update({
            where: { shopDomain: validatedData.shopDomain },
            data: {
              accessToken: validatedData.accessToken,
              scope: validatedData.scope,
              isActive: true,
            },
          });

          return reply.code(200).send({
            message: "Shop updated",
            shop: {
              id: updatedShop.id,
              shopDomain: updatedShop.shopDomain,
            },
          });
        }

        const shop = await fastify.prisma.shop.create({
          data: {
            shopDomain: validatedData.shopDomain,
            accessToken: validatedData.accessToken,
            scope: validatedData.scope,
          },
        });

        return reply.code(201).send({
          message: "Shop registered",
          shop: {
            id: shop.id,
            shopDomain: shop.shopDomain,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Bad Request",
            message: "Validation failed",
            details: error.errors,
          });
        }
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          message: "Failed to register shop",
        });
      }
    },
  );

  fastify.delete("/shops/:shopDomain", async (request, reply) => {
    try {
      const { shopDomain } = request.params as { shopDomain: string };

      await fastify.prisma.shop.update({
        where: { shopDomain },
        data: { isActive: false },
      });

      return reply.code(200).send({
        message: "Shop deactivated",
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to deactivate shop",
      });
    }
  });
}
