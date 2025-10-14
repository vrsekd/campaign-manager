import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import {
  authenticateShopify,
  type AuthenticatedRequest,
} from "../middleware/auth.js";

const campaignStatusEnum = z.enum(["draft", "active", "paused", "completed"]);

const checkoutBannerSchema = z.object({
  productIds: z.array(z.string()).min(1, "At least one product ID is required"),
});

type CheckoutBannerBody = z.infer<typeof checkoutBannerSchema>;

const createCampaignSchema = z
  .object({
    name: z.string().min(1, "Campaign name is required"),
    description: z.string().optional(),
    checkoutBanner: z.string().min(1, "Checkout banner is required"),
    status: campaignStatusEnum.optional().default("draft"),
    priority: z.number().int().min(1, "Priority must be at least 1").default(1),
    startDate: z.string().datetime("Start date must be a valid date"),
    endDate: z.string().datetime("End date must be a valid date"),
    products: z.string().min(1, "At least one product must be selected"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const now = new Date();
      start.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      return start >= now;
    },
    {
      message: "Start date cannot be in the past (today is allowed)",
      path: ["startDate"],
    },
  )
  .refine(
    (data) => {
      const end = new Date(data.endDate);
      const now = new Date();
      end.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      return end >= now;
    },
    {
      message: "End date cannot be in the past (today is allowed)",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

const updateCampaignSchema = z
  .object({
    name: z.string().min(1, "Campaign name cannot be empty").optional(),
    description: z.string().optional(),
    checkoutBanner: z
      .string()
      .min(1, "Checkout banner cannot be empty")
      .optional(),
    status: campaignStatusEnum.optional(),
    priority: z.number().int().min(1, "Priority must be at least 1").optional(),
    startDate: z.string().datetime("Invalid date format").optional().nullable(),
    endDate: z.string().datetime("Invalid date format").optional().nullable(),
    products: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate) {
        const start = new Date(data.startDate);
        const now = new Date();

        start.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        return start >= now;
      }
      return true;
    },
    {
      message: "Start date cannot be in the past (today is allowed)",
      path: ["startDate"],
    },
  )
  .refine(
    (data) => {
      if (data.endDate) {
        const end = new Date(data.endDate);
        const now = new Date();

        end.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        return end >= now;
      }
      return true;
    },
    {
      message: "End date cannot be in the past (today is allowed)",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end >= start;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

const idParamSchema = z.object({
  id: z.string().uuid(),
});

type CreateCampaignBody = z.infer<typeof createCampaignSchema>;
type UpdateCampaignBody = z.infer<typeof updateCampaignSchema>;
type IdParam = z.infer<typeof idParamSchema>;

export default async function campaignRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/campaigns",
    { preHandler: authenticateShopify },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const campaigns = await fastify.prisma.campaign.findMany({
          where: {
            shopId: request.shopId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        return reply.code(200).send(campaigns);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          message: "Failed to fetch campaigns",
        });
      }
    },
  );

  fastify.get<{ Params: IdParam }>(
    "/campaigns/:id",
    { preHandler: authenticateShopify },
    async (
      request: AuthenticatedRequest<{ Params: IdParam }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = idParamSchema.parse(request.params);

        const campaign = await fastify.prisma.campaign.findFirst({
          where: {
            id,
            shopId: request.shopId,
          },
        });

        if (!campaign) {
          return reply.code(404).send({
            error: "Not Found",
            message: "Campaign not found",
          });
        }

        return reply.code(200).send(campaign);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Bad Request",
            message: "Invalid campaign ID",
            details: error.errors,
          });
        }
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          message: "Failed to fetch campaign",
        });
      }
    },
  );

  fastify.post<{ Body: CreateCampaignBody }>(
    "/campaigns",
    { preHandler: authenticateShopify },
    async (
      request: AuthenticatedRequest<{ Body: CreateCampaignBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const validatedData = createCampaignSchema.parse(request.body);

        const campaign = await fastify.prisma.campaign.create({
          data: {
            shopId: request.shopId!,
            name: validatedData.name,
            description: validatedData.description,
            checkoutBanner: validatedData.checkoutBanner,
            status: validatedData.status,
            priority: validatedData.priority,
            startDate: validatedData.startDate
              ? new Date(validatedData.startDate)
              : null,
            endDate: validatedData.endDate
              ? new Date(validatedData.endDate)
              : null,
            products: validatedData.products,
          },
        });

        return reply.code(201).send(campaign);
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
          message: "Failed to create campaign",
        });
      }
    },
  );

  fastify.put<{ Params: IdParam; Body: UpdateCampaignBody }>(
    "/campaigns/:id",
    { preHandler: authenticateShopify },
    async (
      request: AuthenticatedRequest<{
        Params: IdParam;
        Body: UpdateCampaignBody;
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        const validatedData = updateCampaignSchema.parse(request.body);

        const existingCampaign = await fastify.prisma.campaign.findFirst({
          where: {
            id,
            shopId: request.shopId,
          },
        });

        if (!existingCampaign) {
          return reply.code(404).send({
            error: "Not Found",
            message: "Campaign not found",
          });
        }

        const updateData: any = {};
        if (validatedData.name !== undefined)
          updateData.name = validatedData.name;
        if (validatedData.description !== undefined)
          updateData.description = validatedData.description;
        if (validatedData.checkoutBanner !== undefined)
          updateData.checkoutBanner = validatedData.checkoutBanner;
        if (validatedData.status !== undefined)
          updateData.status = validatedData.status;
        if (validatedData.priority !== undefined)
          updateData.priority = validatedData.priority;
        if (validatedData.startDate !== undefined) {
          updateData.startDate = validatedData.startDate
            ? new Date(validatedData.startDate)
            : null;
        }
        if (validatedData.endDate !== undefined) {
          updateData.endDate = validatedData.endDate
            ? new Date(validatedData.endDate)
            : null;
        }
        if (validatedData.products !== undefined)
          updateData.products = validatedData.products;

        const campaign = await fastify.prisma.campaign.update({
          where: { id },
          data: updateData,
        });

        return reply.code(200).send(campaign);
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
          message: "Failed to update campaign",
        });
      }
    },
  );

  fastify.delete<{ Params: IdParam }>(
    "/campaigns/:id",
    { preHandler: authenticateShopify },
    async (
      request: AuthenticatedRequest<{ Params: IdParam }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = idParamSchema.parse(request.params);

        const existingCampaign = await fastify.prisma.campaign.findFirst({
          where: {
            id,
            shopId: request.shopId,
          },
        });

        if (!existingCampaign) {
          return reply.code(404).send({
            error: "Not Found",
            message: "Campaign not found",
          });
        }

        await fastify.prisma.campaign.delete({
          where: { id: existingCampaign.id },
        });

        return reply.code(204).send();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Bad Request",
            message: "Invalid campaign ID",
            details: error.errors,
          });
        }
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          message: "Failed to delete campaign",
        });
      }
    },
  );

  fastify.post<{ Body: CheckoutBannerBody }>(
    "/campaigns/checkout",
    { preHandler: authenticateShopify },
    async (
      request: AuthenticatedRequest<{ Body: CheckoutBannerBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const { productIds } = checkoutBannerSchema.parse(request.body);
        const currentDate = new Date();

        const whereClause: any = {
          status: "active",
          startDate: {
            lte: currentDate,
          },
          endDate: {
            gte: currentDate,
          },
        };

        if (request.shopId) {
          whereClause.shopId = request.shopId;
        }

        const campaigns = await fastify.prisma.campaign.findMany({
          where: whereClause,
          orderBy: {
            priority: "desc",
          },
        });

        for (const campaign of campaigns) {
          if (campaign.products) {
            try {
              const campaignProducts = JSON.parse(campaign.products);
              const productGids = Array.isArray(campaignProducts)
                ? campaignProducts.map((p: any) =>
                    typeof p === "string" ? p : p.id,
                  )
                : [];

              const hasMatchingProduct = productIds.some((productId) =>
                productGids.some((gid: string) => gid.includes(productId)),
              );

              if (hasMatchingProduct && campaign.checkoutBanner) {
                return reply.code(200).send({
                  banner: campaign.checkoutBanner,
                  campaignId: campaign.id,
                  campaignName: campaign.name,
                  priority: campaign.priority,
                });
              }
            } catch (error) {
              fastify.log.warn(
                `Failed to parse products for campaign ${campaign.id}`,
              );
              continue;
            }
          }
        }

        return reply.code(200).send({
          banner: null,
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
          message: "Failed to fetch checkout banner",
        });
      }
    },
  );
}
