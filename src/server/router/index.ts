// src/server/router/index.ts
import superjson from "superjson";
import { createRouter } from "./context";

import {
  getProfileFromAccountId,
  getTitleTrophies,
  getUserTitles,
  getUserTrophiesEarnedForTitle,
  getUserTrophyProfileSummary,
  Trophy,
  TrophyRarity,
} from "psn-api";
import { z } from "zod";

export const appRouter = createRouter()
  .transformer(superjson)
  .query("dashboard", {
    async resolve({ ctx }) {
      if (!ctx.session) {
        return {};
      }

      try {
        const [trophySummaryResp, userTitlesResp] = await Promise.all([
          getUserTrophyProfileSummary(ctx.session.authPayload, "me"),
          getUserTitles(ctx.session.authPayload, "me"),
        ]);

        const userProfileResp = await getProfileFromAccountId(
          ctx.session.authPayload,
          trophySummaryResp.accountId
        );

        return {
          profile: {
            username: userProfileResp.onlineId,
            avatar: userProfileResp.avatars[2]?.url,
            isPlus: userProfileResp.isPlus,
            trophySummary: trophySummaryResp.earnedTrophies,
          },
          games: userTitlesResp.trophyTitles.map((title) => ({
            name: title.trophyTitleName,
            iconUrl: title.trophyTitleIconUrl,
            platforms: title.trophyTitlePlatform.split(","),
            trophies: title.definedTrophies,
            npCommunicationId: title.npCommunicationId,
          })),
        };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  })
  .query("game", {
    input: z.object({
      name: z.string(),
      npCommunicationId: z.string(),
      isPS5: z.boolean(),
    }),
    async resolve({ ctx, input }) {
      if (!ctx.session) {
        return {};
      }

      const options: { npServiceName: "trophy" | "trophy2" } = {
        npServiceName: input.isPS5 ? "trophy2" : "trophy",
      };

      const [{ trophies: titleTrophies }, { trophies: userTitleTrophies }] =
        await Promise.all([
          getTitleTrophies(
            ctx.session.authPayload,
            input.npCommunicationId,
            "all",
            options
          ),
          getUserTrophiesEarnedForTitle(
            ctx.session.authPayload,
            "me",
            input.npCommunicationId,
            "all",
            options
          ),
        ]);

      return {
        trophies: mergeTrophyLists(titleTrophies, userTitleTrophies),
      };
    },
  });

const mergeTrophyLists = (
  titleTrophies: Trophy[],
  userTitleTrophies: Trophy[]
) => {
  return userTitleTrophies.map((userTitleTrophy) => {
    const foundTitleTrophy = titleTrophies.find(
      (t) => t.trophyId === userTitleTrophy.trophyId
    );

    return normalizeTrophy({ ...userTitleTrophy, ...foundTitleTrophy });
  });
};

const normalizeTrophy = (trophy: Trophy) => {
  return {
    name: trophy.trophyName!,
    type: trophy.trophyType,
    iconUrl: trophy.trophyIconUrl!,
    detail: trophy.trophyDetail!,
    isEarned: trophy.earned ?? false,
    earnedOn: trophy.earned ? trophy.earnedDateTime! : "",
    rarity: rarityMap[trophy.trophyRare ?? 0],
    earnedRate: Number(trophy.trophyEarnedRate),
  };
};

const rarityMap: Record<TrophyRarity, string> = {
  [TrophyRarity.VeryRare]: "Very Rare",
  [TrophyRarity.UltraRare]: "Ultra Rare",
  [TrophyRarity.Rare]: "Rare",
  [TrophyRarity.Common]: "Common",
};

// export type definition of API
export type AppRouter = typeof appRouter;
