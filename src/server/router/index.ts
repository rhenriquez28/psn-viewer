// src/server/router/index.ts
import { Prisma, PrismaClient } from "@prisma/client";
import * as trpc from "@trpc/server";
import {
  AllCallOptions,
  AuthorizationPayload,
  getProfileFromAccountId,
  getTitleTrophies,
  getUserTitles,
  getUserTrophiesEarnedForTitle,
  getUserTrophyProfileSummary,
  makeUniversalSearch,
  SocialAccountResult,
  TitleThinTrophy,
  Trophy,
  TrophyCounts,
  TrophyRarity,
  UserThinTrophy,
} from "psn-api";
import superjson from "superjson";
import { z } from "zod";
import { Game, GameGenres, GamePlatforms } from "../../types";
import { createProtectedRouter, unauthorizedError } from "./protected-router";

export const appRouter = createProtectedRouter()
  .transformer(superjson)
  .query("user", {
    input: z.object({
      accountId: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      try {
        const [trophySummaryResp, userTitlesResp] = await Promise.all([
          getUserTrophyProfileSummary(
            ctx.session.authPayload,
            input.accountId ?? "me"
          ),
          getUserTitles(ctx.session.authPayload, input.accountId ?? "me"),
        ]);

        if (!trophySummaryResp.accountId) {
          throw trophySummaryResp;
        }

        const userProfileResp = await getProfileFromAccountId(
          ctx.session.authPayload,
          input.accountId ?? ctx.session.accountId
        );

        // Filtering to only show PS4 and PS5 titles due to PlatPrices API limitation
        const currentUserTitles = userTitlesResp.trophyTitles.filter(
          (title) =>
            title.trophyTitlePlatform.includes("PS4") ||
            title.trophyTitlePlatform.includes("PS5")
        );

        const earnedTrophiesKeys = Object.keys(
          trophySummaryResp.earnedTrophies
        );

        const trophyTotal = earnedTrophiesKeys.reduce(
          (previousValue, _, index) => {
            return (
              previousValue +
              trophySummaryResp.earnedTrophies[
                earnedTrophiesKeys[index] as keyof TrophyCounts
              ]
            );
          },
          0
        );

        return {
          profile: {
            onlineId: userProfileResp.onlineId,
            avatarUrl: userProfileResp.avatars[2]?.url,
            isPlus: userProfileResp.isPlus,
            earnedTrophies: trophySummaryResp.earnedTrophies,
            trophyLevel: Number(trophySummaryResp.trophyLevel),
            progress: trophySummaryResp.progress,
            trophyTotal,
          },
          games: currentUserTitles.map((title) => ({
            name: title.trophyTitleName,
            iconUrl: title.trophyTitleIconUrl,
            platforms: title.trophyTitlePlatform.split(","),
            earnedTrophies: title.earnedTrophies,
            progress: title.progress,
            npCommunicationId: title.npCommunicationId,
          })),
        };
      } catch (e) {
        const error = e as PsnApiErrorResponse;
        if (error.error.code === PsnApiErrorCode.ACCESS_CONTROL_ERROR) {
          throw new trpc.TRPCError({
            code: "FORBIDDEN",
            message:
              "This user doesn't allow for their information to be accessed. We're sorry :(",
          });
        }
        throw unauthorizedError;
      }
    },
  })
  .query("game", {
    input: z.object({
      name: z.string(),
      npCommunicationId: z.string(),
      isPS5: z.boolean(),
      accountId: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      const info = await getGameInfo(
        input.npCommunicationId,
        ctx.prisma,
        input.name
      );

      const { onlineId, avatars } = await getProfileFromAccountId(
        ctx.session.authPayload,
        input.accountId ?? ctx.session.accountId
      );

      const [titleTrophies, userTitleTrophies] = await fetchTrophyLists(
        { authPayload: ctx.session.authPayload, ...input },
        {
          npServiceName: input.isPS5 ? "trophy2" : "trophy",
        }
      );

      return {
        info,
        userTitleTrophiesSummary: {
          user: { onlineId, avatarUrl: avatars[2]?.url },
          trophies: getUserTitleTrophiesSummary(userTitleTrophies),
        },
        trophies: mergeTrophyLists(titleTrophies, userTitleTrophies),
      };
    },
  })
  .query("search", {
    input: z.object({
      query: z.string(),
    }),
    async resolve({ ctx, input }) {
      const response = await makeUniversalSearch(
        ctx.session.authPayload,
        input.query,
        "SocialAllAccounts"
      );
      return {
        results: response.domainResponses[0]?.results?.map(
          ({ socialMetadata }: SocialAccountResult) => {
            return {
              accountId: socialMetadata.accountId,
              onlineId: socialMetadata.onlineId,
              avatarUrl: socialMetadata.avatarUrl,
            };
          }
        ),
      };
    },
  });

const getGameInfo = async (
  npCommunicationId: string,
  prisma: PrismaClient,
  name: string
) => {
  //Sanitizing name
  name = name
    .replaceAll("™", "")
    .replaceAll("®", "")
    .replaceAll("Trophies", "");
  const prismaGame = await getGameFromPrisma(prisma, npCommunicationId, name);
  if (prismaGame) {
    return fromPrismaToGame(prismaGame);
  }

  const response = await getPlatPricesResponse(name);
  const game = transformGameInfo(response, npCommunicationId);
  const newPrismaGame = fromGameToPrisma(game);
  await prisma.game.create({
    data: {
      ...newPrismaGame,
      screenshots: {
        create: newPrismaGame.screenshots,
      },
      platforms: {
        connect: newPrismaGame.platforms,
      },
      genres: {
        connect: newPrismaGame.genres,
      },
    },
  });
  return game;
};

const getGameFromPrisma = async (
  prisma: PrismaClient,
  npCommunicationId: string,
  name: string
) => {
  return await prisma.game.findFirst({
    include: {
      screenshots: { select: { url: true } },
      platforms: { select: { name: true } },
      genres: { select: { name: true } },
    },
    where: {
      OR: [{ npCommunicationId }, { name }],
    },
  });
};

type PrismaGame = Prisma.PromiseReturnType<typeof getGameFromPrisma>;

const getPlatPricesResponse = async (name: string) => {
  const res = await fetch(
    `https://platprices.com/api.php?key=${
      process.env.PLATPRICES_APIKEY
    }&name=${encodeURIComponent(name)}`
  );
  const response: PlatPricesAPIResponse = await res.json();
  if (response.error !== 0) {
    throw response.errorDesc;
  }
  return response as PlatPricesAPIResponse;
};

const transformGameInfo = (
  response: PlatPricesAPIResponse,
  npCommunicationId: string
): Game => {
  const screenshotKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
  const platformKeys = ["PS4", "PS5"] as const;
  const screenshots = screenshotKeys
    .map((value) => response[`Screenshot${value}`])
    .filter((value) => value !== "");
  const genres = GameGenres.filter(
    (genre) => response[`Genre${genre}`] === "1"
  );
  const platforms = platformKeys.filter(
    (platform) => response[`Is${platform}`] === "1"
  );

  return {
    npCommunicationId,
    titleId: response.GameID,
    name: response.GameName,
    genres,
    description: response.Desc,
    iconUrl: response.GameImg || response.Img,
    coverUrl: response.CoverArt,
    screenshots,
    previewVideoUrl: response.PreviewVideo || null,
    publisher: response.Publisher,
    developer: response.Developer || null,
    platforms,
    psStoreUrl: response.PSStoreURL,
    platPricesUrl: response.PlatPricesURL,
    rating: response.Rating.startsWith("ESRB") ? response.Rating : null,
    ps4Size: BigInt(response.PS4Size) || null,
    ps5Size: BigInt(response.PS5Size) || null,
  };
};

const fetchTrophyLists = async (
  {
    authPayload,
    npCommunicationId,
    accountId,
  }: {
    authPayload: AuthorizationPayload;
    npCommunicationId: string;
    accountId?: string;
  },
  options: TrophyCallOptions
): Promise<[TitleThinTrophy[], UserThinTrophy[]]> => {
  const [{ trophies: titleTrophies }, { trophies: userTitleTrophies }] =
    await Promise.all([
      getTitleTrophies(authPayload, npCommunicationId, "all", options),
      getUserTrophiesEarnedForTitle(
        authPayload,
        accountId ?? "me",
        npCommunicationId,
        "all",
        options
      ),
    ]);

  return [titleTrophies, userTitleTrophies];
};

const mergeTrophyLists = (
  titleTrophies: Trophy[],
  userTitleTrophies: Trophy[]
) => {
  return userTitleTrophies.map((userTitleTrophy) => {
    const foundTitleTrophy = titleTrophies.find(
      (t) => t.trophyId === userTitleTrophy.trophyId
    );
    const trophy: Trophy = { ...userTitleTrophy, ...foundTitleTrophy };

    return {
      id: trophy.trophyId,
      name: trophy.trophyName!,
      type: trophy.trophyType,
      iconUrl: trophy.trophyIconUrl!,
      detail: trophy.trophyDetail!,
      isEarned: trophy.earned ?? false,
      earnedOn: trophy.earned ? trophy.earnedDateTime! : "",
      rarity: rarityMap[trophy.trophyRare ?? 0],
      earnedRate: Number(trophy.trophyEarnedRate),
    };
  });
};

const getUserTitleTrophiesSummary = (userTitleTrophies: Trophy[]) => {
  const summary: {
    total: number;
    earnedByUser: TrophyCounts & { total: number };
  } = {
    total: userTitleTrophies.length,
    earnedByUser: { bronze: 0, silver: 0, gold: 0, platinum: 0, total: 0 },
  };

  userTitleTrophies.forEach((trophy) => {
    if (trophy.earned) {
      summary.earnedByUser[trophy.trophyType] += 1;
      summary.earnedByUser.total += 1;
    }
  });

  return summary;
};

const mapToPrismaRelationObject = <
  T extends readonly string[],
  U extends string[]
>(
  items: T,
  selectedItems: U
) => {
  return items
    .map((item, index) => {
      if (selectedItems.includes(item)) {
        return { id: ++index };
      }
      return 0;
    })
    .filter((value) => value !== 0) as { id: number }[];
};

const fromPrismaToGame = (prismaObj: NonNullable<PrismaGame>): Game => {
  return {
    ...prismaObj,
    screenshots: prismaObj.screenshots.map((value) => value.url),
    platforms: prismaObj.platforms.map(
      (value) => value.name
    ) as GamePlatforms[],
    genres: prismaObj.genres.map((value) => value.name) as GameGenres[],
  };
};

const fromGameToPrisma = (game: Game) => {
  return {
    ...game,
    screenshots: game.screenshots.map((url) => ({ url })),
    platforms: mapToPrismaRelationObject(GamePlatforms, game.platforms),
    genres: mapToPrismaRelationObject(GameGenres, game.genres),
  };
};

const rarityMap: Record<TrophyRarity, string> = {
  [TrophyRarity.VeryRare]: "Very Rare",
  [TrophyRarity.UltraRare]: "Ultra Rare",
  [TrophyRarity.Rare]: "Rare",
  [TrophyRarity.Common]: "Common",
};

type TrophyCallOptions = Pick<AllCallOptions, "npServiceName">;

type PlatPricesAPIResponse = {
  GameName: string;
  GuidePSNP: string;
  GuidePS3T: string;
  GuidePS3I: string;
  GuidePyx: string;
  GuideKnoef: string;
  GuideYoutube: string;
  GuideDex: string;
  GuideTrophiesDE: string;
  GuideCust: string;
  GuideCustLabel: string;
  GameImg: string;
  UnobtainableTrophies: string;
  GameID: string;
  Desc: string;
  Img: string;
  CoverArt: string;
  LogoImg: string;
  Screenshot1: string;
  Screenshot2: string;
  Screenshot3: string;
  Screenshot4: string;
  Screenshot5: string;
  Screenshot6: string;
  Screenshot7: string;
  Screenshot8: string;
  Screenshot9: string;
  PreviewVideo: string;
  Publisher: string;
  Developer: string;
  IsPS4: string;
  IsPS5: string;
  IsVR: "0" | "1" | "2";
  IsMove: "0" | "1" | "2";
  VitaCB: "0" | "1";
  PS4Size: string;
  PS5Size: string;
  OnlinePlay: "0" | "1" | "2";
  OfflinePlayers: string;
  OnlinePlayers: string;
  PSPlusNeeded: string;
  IsDLC: string;
  VoiceLang: string;
  SubtitleLang: string;
  OpenCriticID: string;
  MetacriticURL: string;
  GenreRPG: "0" | "1";
  GenreAction: "0" | "1";
  GenreAdventure: "0" | "1";
  GenreTPS: "0" | "1";
  GenreFPS: "0" | "1";
  GenreMMO: "0" | "1";
  GenrePlatformer: "0" | "1";
  GenreFighting: "0" | "1";
  GenreSimulation: "0" | "1";
  GenreArcade: "0" | "1";
  GenreStrategy: "0" | "1";
  GenreSports: "0" | "1";
  GenrePuzzle: "0" | "1";
  GenreMusic: "0" | "1";
  GenreRacing: "0" | "1";
  GenreHorror: "0" | "1";
  GenreIntStory: "0" | "1";
  OldDifficulty: string;
  Region: string;
  BasePrice: string;
  PlusPrice: string;
  SalePrice: string;
  LowestEverPrice: string;
  LowestEverPlusPrice: string;
  DiscPerc: string;
  ReleaseDate: string;
  LastDiscounted: string;
  DiscountedUntil: string;
  PSPExPremUntil: string;
  PSPExtra: "0" | "1";
  PSPPremium: "0" | "1";
  PSNID: string;
  ProductName: string;
  PPID: string;
  TrophyListURL: string;
  Rating: string;
  RatingDesc: string;
  IsDemoOrSoundtrack: string;
  Bronze: string;
  Silver: string;
  Gold: string;
  Platinum: string;
  Difficulty: string;
  HoursLow: number;
  HoursHigh: number;
  formattedBasePrice: string;
  formattedSalePrice: string;
  formattedPlusPrice: string;
  PSStoreURL: string;
  PlatPricesURL: string;
  error: number;
  errorDesc: string;
  apiLimit: string;
  apiUsage: string;
};

type PsnApiErrorResponse = {
  error: {
    referenceId: string;
    code: number;
    message: string;
  };
};

enum PsnApiErrorCode {
  ACCESS_CONTROL_ERROR = 2240526,
}

// export type definition of API
export type AppRouter = typeof appRouter;
