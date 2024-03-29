import { Tabs } from "antd";
import classNames from "classnames";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { TrophyType } from "psn-api";
import React from "react";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import Error from "../components/Error";
import LoadingSpinner from "../components/LoadingSpinner";
import styles from "../styles/game.module.scss";
import { ArrayElement, Game, GamePlatforms } from "../types";
import { inferQueryOutput, trpc } from "../utils/trpc";

const Game: NextPage = () => {
  const { status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/welcome");
  }

  const { name, npCommunicationId, isPS5, userId } = router.query;
  const { data, isLoading, isIdle, error } = trpc.useQuery(
    [
      "game",
      {
        name: name as string,
        npCommunicationId: npCommunicationId as string,
        isPS5: isPS5 === "true",
        accountId: userId as string,
      },
    ],
    { refetchOnWindowFocus: false }
  );

  if (isLoading || isIdle) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Error error={error} />;
  }

  const summaryImages: [string, string] = [
    data.info.coverUrl,
    data.info.iconUrl,
  ];

  const metadata = (({
    platforms,
    genres,
    publisher,
    developer,
    rating,
    ps4Size,
    ps5Size,
    platPricesUrl,
    psStoreUrl,
  }) => ({
    platforms,
    genres,
    publisher,
    developer,
    rating,
    ps4Size,
    ps5Size,
    platPricesUrl,
    psStoreUrl,
  }))(data.info);

  return (
    <>
      <Head>
        <title>{`${data.userTitleTrophiesSummary.user.onlineId}'s ${data.info.name} Trophies - PSN Viewer`}</title>
      </Head>
      <GameSummary
        images={summaryImages}
        name={data.info.name}
        platforms={data.info.platforms}
      />

      <Tabs className="px-8" defaultActiveKey={userId ? "2" : "1"}>
        <Tabs.TabPane tab="Details" key="1">
          <GameDetails
            images={data.info.screenshots}
            description={data.info.description}
            metadata={metadata}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Trophies" key="2">
          <UserTrophySummary summary={data.userTitleTrophiesSummary} />

          {data.trophies.map((trophy) => (
            <div key={trophy.id} className="mb-4">
              <TrophyCard trophy={trophy} />
            </div>
          ))}
        </Tabs.TabPane>
      </Tabs>
    </>
  );
};

export default Game;

const GameSummary: React.FC<{
  images: [string, string];
  name: string;
  platforms: GamePlatforms[];
}> = ({ images, name, platforms }) => {
  const [cover, icon] = images;

  return (
    <>
      <div className="w-full h-[50vh] relative">
        <Image
          src={cover}
          layout="fill"
          objectFit="cover"
          objectPosition="right 33%"
          priority={true}
          alt="Game Cover Image"
        />
      </div>

      <div className="p-8 flex flex-col z-10 sm:flex-row items-center sm:items-start">
        <div className="h-[200px] w-[200px] -mt-20 sm:mr-12 sm:mb-0 mb-6 relative">
          <Image
            className="rounded-[32px]"
            src={icon}
            layout="fill"
            alt="Game Icon Image"
          />
        </div>

        <div className="flex flex-col">
          <div className="text-4xl mb-6">{name}</div>

          <div className="flex justify-center sm:justify-start">
            {platforms.map((platform, index) => {
              return (
                <div
                  key={index}
                  className={`badge badge--platform ${styles.platformBadge}`}
                >
                  {platform}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

const GameDetails: React.FC<{
  images: GameImages;
  description: string;
  metadata: GameMetadata;
}> = ({ images, description, metadata }) => {
  const items: ReactImageGalleryItem[] = images.map((image) => {
    return {
      original: image,
      thumbnail: image,
    };
  });

  return (
    <>
      <div className="mb-12">
        <div className="text-3xl text-black mb-4 text-center">Media</div>

        <div className="w-full max-w-5xl mx-auto">
          <ImageGallery items={items} />
        </div>
      </div>

      <div className="text-3xl text-black mb-4 text-center">Game Info</div>

      <div className="max-w-2xl text-base bg-gray-800 text-zinc-300 shadow-xl flex flex-col mx-auto px-8">
        <p
          className="py-6 mb-6 border-b border-zinc-400"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 justify-center pb-6 gap-2">
          {metadata
            ? Object.keys(metadata).map((key, index) => {
                return (
                  <MetadataCell
                    key={index}
                    labelKey={key as keyof GameMetadata}
                    value={metadata[key as keyof GameMetadata]}
                  />
                );
              })
            : null}
        </div>
      </div>
    </>
  );
};

const MetadataCell: React.FC<{
  labelKey: keyof GameMetadata;
  value: string | string[] | bigint | null;
}> = ({ labelKey, value }) => {
  if (!value) {
    return null;
  }

  let data: string;

  if (Array.isArray(value)) {
    data = value.join(", ");
  } else if (typeof value === "bigint") {
    data = `${(Number(value) / Math.pow(1024, 3)).toFixed(2)} GB`;
  } else {
    data = value;
  }

  return (
    <div className={styles.metadataCell}>
      <div className={styles.metadataCellLabel}>{labelMap[labelKey]}</div>

      {data.startsWith("http") ? (
        <a
          href={data}
          target="_blank"
          rel="noreferrer"
          className={`${styles.metadataCellData}`}
        >
          {data}
        </a>
      ) : (
        <div className={styles.metadataCellData}>{data}</div>
      )}
    </div>
  );
};

const UserTrophySummary: React.FC<{
  summary: inferQueryOutput<"game">["userTitleTrophiesSummary"];
}> = ({ summary }) => {
  return (
    <div className="flex items-center justify-between shadow-md p-2 max-w-4xl mx-auto mb-4 text-lg">
      <div className="flex items-center">
        <div className="w-14 h-14 relative">
          <Image
            src={summary.user.avatarUrl ?? ""}
            layout="fill"
            className="rounded-full"
            priority={true}
            alt="profile avatar"
          />
        </div>

        <div className="text-black ml-3">{summary.user.onlineId}</div>
      </div>
      <div className="hidden sm:flex items-center justify-around text-base">
        <div className="mr-4">
          {`${summary.trophies.earnedByUser.total}/${summary.trophies.total} Trophies`}
        </div>
        {Object.keys(summary.trophies.earnedByUser)
          .filter((key) => key !== "total")
          .map((key, index) => {
            const trophyType = key as TrophyType;
            return (
              <TrophySummaryCounter
                key={index}
                type={trophyType}
                userTotal={summary.trophies.earnedByUser[trophyType]}
              />
            );
          })
          .reverse()}
      </div>
    </div>
  );
};

const TrophySummaryCounter: React.FC<{
  userTotal: number;
  type: TrophyType;
}> = ({ userTotal, type }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="ml-2">{`${userTotal}`}</div>

      <div className="h-16 w-16 relative">
        <Image src={`/${type}.png`} layout="fill" alt={`${type} trophy`} />
      </div>
    </div>
  );
};

const TrophyCard: React.FC<{
  trophy: ArrayElement<inferQueryOutput<"game">["trophies"]>;
}> = ({
  trophy: {
    name,
    detail,
    isEarned,
    earnedOn,
    earnedRate,
    iconUrl,
    rarity,
    type,
  },
}) => {
  return (
    <div
      className={classNames(
        "p-4 w-full h-fit shadow-lg flex items-center justify-between hover:bg-sky-100",
        { "bg-green-100 hover:bg-green-200": isEarned }
      )}
    >
      <div className="flex items-center min-w-0">
        <div
          className={classNames(
            "w-28 h-28 relative flex-shrink-0 border-[8px] border-gray-300",
            { "border-green-500": isEarned }
          )}
        >
          <Image src={iconUrl} layout="fill" alt="Trophy Icon" />
        </div>

        <div className="mx-4 min-w-0">
          <div className="text-black text-base overflow-hidden whitespace-nowrap text-ellipsis mb-2">
            {name}
          </div>

          <div className="text-black text-base overflow-hidden whitespace-nowrap text-ellipsis">
            {detail}
          </div>
        </div>
      </div>

      <div className="hidden sm:flex justify-end items-center">
        {isEarned && earnedOn !== "unearned" ? (
          <div
            className={`flex flex-col text-center ${styles.metadata} ${styles.earnedTime}`}
          >
            <div className="text-base">{dateEarned(earnedOn)}</div>
            <div>{timeEarned(earnedOn)}</div>
          </div>
        ) : null}

        <div
          className={`${styles.metadata} flex flex-col text-center text-gray-700`}
        >
          <div className="text-3xl">{`${earnedRate}%`}</div>
          <div className="text-xs uppercase">{rarity}</div>
        </div>

        <div
          className={`${styles.metadata} ${styles.trophyType} w-28 h-28 relative flex-shrink-0`}
        >
          <Image src={`/${type}.png`} layout="fill" alt={`${type} trophy`} />
        </div>
      </div>
    </div>
  );
};

const dateEarned = (earnedOn: string) =>
  Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(earnedOn));

const timeEarned = (earnedOn: string) =>
  Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date(earnedOn));

const labelMap: Record<keyof GameMetadata, string> = {
  developer: "Developer:",
  publisher: "Publisher:",
  ps4Size: "PS4 Size:",
  ps5Size: "PS5 Size:",
  rating: "Rating:",
  platPricesUrl: "PlatPrices URL:",
  psStoreUrl: "PS Store URL:",
  platforms: "Platforms:",
  genres: "Genres:",
};

type GameImages = string[];

type GameMetadata = Pick<
  Game,
  | "publisher"
  | "developer"
  | "platforms"
  | "genres"
  | "platPricesUrl"
  | "psStoreUrl"
  | "ps4Size"
  | "ps5Size"
  | "rating"
>;
