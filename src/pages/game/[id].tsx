import { Tabs } from "antd";
import classNames from "classnames";
import type { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import React from "react";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import { TrophyType } from "../../types";
import styles from "./game.module.scss";

const { TabPane } = Tabs;

type GameImages = string[];

type GameProps = {
  summaryImages: GameImages;
  mediaImages: GameImages;
  description: string;
};

type GameSubProps = { images: GameImages };

export const getServerSideProps: GetServerSideProps = async () => {
  const summaryImages = [
    "https://image.api.playstation.com/vulcan/ap/rnd/202101/2921/x64hEmgvhgxpXc9z9hpyLAyQ.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202101/2921/DwVjpbKOsFOyPdNzmSTSWuxG.png",
  ];

  const mediaImages = [
    "https://image.api.playstation.com/vulcan/ap/rnd/202102/1018/OAa4x7rhbLR89HfMjmNEbHFV.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202102/1018/TkYnDhTj8AVVeMttwkWe2nWX.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202006/1217/ClnHKlWvqhcJvHd3OsiXHuRc.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202006/1217/uhyIltavTLwMyE42Ge3ZAJci.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202006/1217/w6kvRtcc2994kgRrUq4QAcrz.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202006/1217/JK8l3yPGClCmQXjjkjOdAoHB.jpg",
  ];

  const description =
    "BLAST YOUR WAY THROUGH AN INTERDIMENSIONAL ADVENTURE<br /><br />Ratchet and Clank are back! Help them stop a robotic emperor intent on conquering cross-dimensional worlds, with their own universe next in the firing line. Witness the evolution of the dream team as they're joined by Rivet – a Lombax resistance fighter from another dimension.<br /><br />- Blast your way home with an arsenal of outrageous weaponry. <br />- Experience the shuffle of dimensional rifts and dynamic gameplay. <br />- Explore never-before-seen planets and alternate dimension versions of old favorites.<br /><br />PS5 FEATURES: <br />- Feel in-game actions through the haptic feedback of the DualSense wireless controller. <br />- Take full control of advanced weapon mechanics, made possible by adaptive triggers. <br />- Planet-hop at hyper-speed via the near-instant loading of the PS5 console's SSD. <br />- Immerse your ears with Tempest 3D AudioTech* as you work to save the universe. <br />- Enhanced lighting and ray tracing render dazzling in-game worlds – displayed in crisp, dynamic 4K and HDR**. <br />- Choose Performance Mode to enjoy targeted 60 frames per second gameplay***.";

  return {
    props: {
      summaryImages,
      mediaImages,
      description,
    },
  };
};

const Game: NextPage<GameProps> = ({
  summaryImages,
  mediaImages,
  description,
}) => {
  return (
    <>
      <GameSummary images={summaryImages} />
      <Tabs className="px-8" defaultActiveKey="1">
        <TabPane tab="Details" key="1">
          <GameDetails images={mediaImages} description={description} />
        </TabPane>
        <TabPane tab="Trophies" key="2">
          <div className="mb-4">
            <TrophyCard type="bronze" earned={true} />
          </div>
          <div className="mb-4">
            <TrophyCard type="silver" />
          </div>
          <div className="mb-4">
            <TrophyCard type="gold" />
          </div>
          <div className="mb-4">
            <TrophyCard type="platinum" />
          </div>
          <div className="mb-4">
            <TrophyCard type="bronze" />
          </div>
          <div className="mb-4">
            <TrophyCard type="bronze" />
          </div>
          <div className="mb-4">
            <TrophyCard type="bronze" />
          </div>
          <div className="mb-4">
            <TrophyCard type="bronze" />
          </div>
        </TabPane>
      </Tabs>
    </>
  );
};

export default Game;

const GameSummary: React.FC<GameSubProps> = ({ images }) => {
  const [cover, icon] = images;

  return (
    <>
      <div className="w-full h-[50vh] relative">
        <Image
          src={cover!}
          layout="fill"
          objectFit="cover"
          objectPosition="right 33%"
          alt="Game Cover Image"
        />
      </div>

      <div className="p-8 flex z-10">
        <div className="h-[200px] w-[200px] -mt-20 mr-12 relative">
          <Image
            className="rounded-[32px]"
            src={icon!}
            layout="fill"
            alt="Game Icon Image"
          />
        </div>

        <div className="flex flex-col">
          <div className="text-4xl mb-6">Ratchet &amp; Clank: Rift Apart</div>

          <div className="flex">
            <div className={`badge badge--platform ${styles.platformBadge}`}>
              PS4
            </div>

            <div className={`badge badge--platform ${styles.platformBadge}`}>
              PS5
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const GameDetails: React.FC<GameSubProps & { description: string }> = ({
  images,
  description,
}) => {
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

const TrophyCard: React.FC<{ earned?: boolean; type: TrophyType }> = ({
  earned,
  type,
}) => {
  const dateEarned = Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date("2021-08-15T21:22:08Z"));

  const timeEarned = Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date("2021-08-15T21:22:08Z"));

  return (
    <div
      className={classNames(
        "p-4 w-full h-fit shadow-lg flex items-center justify-between hover:bg-sky-100",
        { [styles.earned!]: earned }
      )}
    >
      <div className="flex items-center min-w-0">
        <div
          className={classNames(
            "w-28 h-28 bg-gray-600 flex-shrink-0 border-[8px] border-gray-300",
            { "border-green-500": earned }
          )}
        ></div>

        <div className="mx-4 min-w-0">
          <div className="text-black text-base overflow-hidden whitespace-nowrap text-ellipsis mb-2">
            Rift Apart
          </div>

          <div className="text-black text-base overflow-hidden whitespace-nowrap text-ellipsis">
            Get Separated in Nefarious City
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center">
        {earned ? (
          <div
            className={`flex flex-col text-center ${styles.metadata} ${styles.earnedTime}`}
          >
            <div className="text-base">{dateEarned}</div>
            <div>{timeEarned}</div>
          </div>
        ) : null}

        <div
          className={`${styles.metadata} flex flex-col text-center text-gray-700`}
        >
          <div className="text-3xl">88.4%</div>
          <div className="text-xs uppercase">common</div>
        </div>

        <div
          className={`${styles.metadata} ${styles.trophyType} w-28 h-28 relative`}
        >
          <Image src={`/${type}.png`} layout="fill" alt={`${type} trophy`} />
        </div>
      </div>
    </div>
  );
};
