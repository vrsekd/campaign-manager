import type { FastifyReply, FastifyBaseLogger } from "fastify";
import { z } from "zod";

export class ErrorHandler {
  static handleError(
    error: unknown,
    reply: FastifyReply,
    logger: FastifyBaseLogger,
  ) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        error: "Bad Request",
        message: "Validation failed",
        details: error.errors,
      });
    }

    if (error instanceof Error) {
      logger.error(error);
      return reply.code(400).send({
        error: "Bad Request",
        message: error.message,
      });
    }

    logger.error(error);
    return reply.code(500).send({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }

  static notFound(reply: FastifyReply, message: string) {
    return reply.code(404).send({
      error: "Not Found",
      message,
    });
  }
}
