import type { FastifyInstance, FastifyReply } from "fastify";

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", async (_, reply: FastifyReply) => {
    return reply.code(200).send({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });
}
