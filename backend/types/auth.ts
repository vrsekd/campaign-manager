import type { FastifyRequest, RouteGenericInterface } from "fastify";

export type AuthenticatedRequest<
  T extends RouteGenericInterface = RouteGenericInterface,
> = FastifyRequest<T> & {
  shopDomain?: string;
  shopId?: string;
};

export interface ShopifyJWTPayload {
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
