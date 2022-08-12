import { Spin, Tabs } from "antd";
import classNames from "classnames";
import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import styles from "../styles/game.module.scss";
import { ArrayElement, GamePlatforms } from "../types";
import { inferQueryOutput, trpc } from "../utils/trpc";

const { TabPane } = Tabs;

type GameImages = string[];

const Game: NextPage = () => {
  const { query } = useRouter();
  const { name, npCommunicationId, isPS5 } = query;
  const { data, isLoading } = trpc.useQuery([
    "game",
    {
      name: name as string,
      npCommunicationId: npCommunicationId as string,
      isPS5: isPS5 === "true",
    },
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const summaryImages: [string, string] = [
    data?.info?.coverUrl!,
    data?.info?.iconUrl!,
  ];

  return (
    <>
      <GameSummary
        images={summaryImages}
        name={data?.info?.name!}
        platforms={data?.info?.platforms!}
      />
      <Tabs className="px-8" defaultActiveKey="1">
        <TabPane tab="Details" key="1">
          <GameDetails
            images={data?.info?.screenshots!}
            description={data?.info?.description!}
          />
        </TabPane>
        <TabPane tab="Trophies" key="2">
          {data?.trophies?.map((trophy, index) => (
            <div key={index} className="mb-4">
              <TrophyCard trophy={trophy} />
            </div>
          ))}
        </TabPane>
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

      <div className="p-8 flex z-10">
        <div className="h-[200px] w-[200px] -mt-20 mr-12 relative">
          <Image
            className="rounded-[32px]"
            src={icon}
            layout="fill"
            alt="Game Icon Image"
          />
        </div>

        <div className="flex flex-col">
          <div className="text-4xl mb-6">{name}</div>

          <div className="flex">
            {platforms?.map((platform, index) => {
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

const GameDetails: React.FC<{ images: GameImages; description: string }> = ({
  images,
  description,
}) => {
  const items: ReactImageGalleryItem[] = images?.map((image) => {
    return {
      original: image,
      thumbnail: image,
    };
  });

  return (
    <>
      <div className="mb-12">
        <div className="text-3xl text-black mb-4 text-center">Media</div>

        <div className="w-full max-w-5xl flex mx-auto">
          <ImageGallery items={items} />
        </div>
      </div>

      <div className="text-3xl text-black mb-4 text-center">Game Info</div>

      <div className="max-w-2xl text-base bg-gray-800 text-zinc-300 shadow-xl flex flex-col mx-auto px-8">
        <p
          className="py-6 mb-6 border-b border-zinc-400"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        <div className="grid grid-flow-col grid-cols-2 justify-center pb-6">
          <div className={styles.metadataCell}>
            <div className={styles.metadataCellLabel}>Platforms:</div>

            <div className={styles.metadataCellData}>PS5</div>
          </div>
        </div>
      </div>
    </>
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
        { [styles.earned!]: isEarned }
      )}
    >
      <div className="flex items-center min-w-0">
        <div
          className={classNames(
            "w-28 h-28 relative flex-shrink-0 border-[8px] border-gray-300",
            { "border-green-500": isEarned }
          )}
        >
          <Image src={iconUrl} layout="fill" />
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

      <div className="flex justify-end items-center">
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
