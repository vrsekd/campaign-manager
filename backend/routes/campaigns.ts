import type { FastifyInstance, FastifyReply } from "fastify";
import { authenticateShopify } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import {
  checkoutBannerSchema,
  idParamSchema,
  type CheckoutBannerBody,
  type IdParam,
} from "../types/routes.js";
import {
  createCampaignSchema,
  updateCampaignSchema,
  type CreateCampaignBody,
  type UpdateCampaignBody,
} from "../schemas/campaign.js";
import { CampaignService } from "../services/campaign.service.js";
import { ErrorHandler } from "../utils/error-handler.js";

export default async function campaignRoutes(fastify: FastifyInstance) {
  const campaignService = new CampaignService(fastify.prisma);
  fastify.get(
    "/campaigns",
    { preHandler: authenticateShopify },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const campaigns = await campaignService.getAllCampaigns(
          request.shopId!,
        );
        return reply.code(200).send(campaigns);
      } catch (error) {
        return ErrorHandler.handleError(error, reply, fastify.log);
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
        const campaign = await campaignService.getCampaignById(
          id,
          request.shopId!,
        );

        if (!campaign) {
          return ErrorHandler.notFound(reply, "Campaign not found");
        }

        return reply.code(200).send(campaign);
      } catch (error) {
        return ErrorHandler.handleError(error, reply, fastify.log);
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
        const campaign = await campaignService.createCampaign(
          validatedData,
          request.shopId!,
        );

        return reply.code(201).send(campaign);
      } catch (error) {
        return ErrorHandler.handleError(error, reply, fastify.log);
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

        const campaign = await campaignService.updateCampaign(
          id,
          validatedData,
          request.shopId!,
        );

        if (!campaign) {
          return ErrorHandler.notFound(reply, "Campaign not found");
        }

        return reply.code(200).send(campaign);
      } catch (error) {
        return ErrorHandler.handleError(error, reply, fastify.log);
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
        const deleted = await campaignService.deleteCampaign(
          id,
          request.shopId!,
        );

        if (!deleted) {
          return ErrorHandler.notFound(reply, "Campaign not found");
        }

        return reply.code(204).send();
      } catch (error) {
        return ErrorHandler.handleError(error, reply, fastify.log);
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
        const result = await campaignService.getCheckoutBanner(
          productIds,
          request.shopId,
        );

        return reply.code(200).send(result);
      } catch (error) {
        return ErrorHandler.handleError(error, reply, fastify.log);
      }
    },
  );
}
