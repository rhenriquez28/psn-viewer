// src/server/router/index.ts
import superjson from "superjson";
import { createRouter } from "./context";

import { getProfileFromAccountId, getUserTrophyProfileSummary } from "psn-api";

export const appRouter = createRouter()
  .transformer(superjson)
  .query("dashboard", {
    async resolve({ ctx }) {
      if (!ctx.session) {
        return null;
      }

      try {
        const profileSummaryResp = await getUserTrophyProfileSummary(
          ctx.session.authPayload,
          "me"
        );
        const userProfileResp = await getProfileFromAccountId(
          ctx.session.authPayload,
          profileSummaryResp.accountId
        );
        return { profileSummaryResp, userProfileResp };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
