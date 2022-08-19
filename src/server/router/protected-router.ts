import * as trpc from "@trpc/server";
import { createRouter } from "./context";

/**
 * Creates a tRPC router that asserts all queries and mutations are from an authorized user. Will throw an unauthorized error if a user is not signed in.
 */
export function createProtectedRouter() {
  return createRouter().middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.authorization) {
      throw new trpc.TRPCError({
        code: "UNAUTHORIZED",
        message: "Your session has expired, please authenticate again.",
      });
    }
    return next({
      ctx: {
        ...ctx,
        // infers that `session` is non-nullable to downstream resolvers
        session: {
          ...ctx.session,
          authorization: ctx.session.authorization,
          authPayload: ctx.session.authPayload,
        },
      },
    });
  });
}
