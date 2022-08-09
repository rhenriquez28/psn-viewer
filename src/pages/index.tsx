//import { createSSGHelpers } from "@trpc/react/ssg";
import { Spin } from "antd";
import classnames from "classnames";
import type { NextPage } from "next";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { TrophyCounts, TrophyType } from "psn-api";
import TrophyIcon from "../components/TrophyIcon";
//import { appRouter } from "../server/router";
//import { createContext } from "../server/router/context";
import styles from "../styles/index.module.scss";
import { ArrayElement } from "../types";
import { inferQueryOutput, trpc } from "../utils/trpc";

/*export async function getServerSideProps() {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
  });

  await ssg.fetchQuery("dashboard");

  return {
    props: {
      trpcState: ssg.dehydrate(),
      revalidate: 1,
    },
  };
}*/

const Home: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["dashboard"], {
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <button onClick={() => signIn()}>Sign in</button>
        <button onClick={() => signOut()}>Sign out</button>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col items-center">
      <button onClick={() => signIn()}>Sign in</button>
      <button onClick={() => signOut()}>Sign out</button>

      <ProfileSummary className="mb-4 max-w-xl" profile={data?.profile} />

      <div>My Games</div>

      {data?.games?.map((game, index) => {
        return <GameCard key={index} className="mb-2 max-w-2xl" game={game} />;
      })}
    </div>
  );
};

export default Home;

const ProfileSummary: React.FC<{
  className?: string;
  profile: inferQueryOutput<"dashboard">["profile"];
}> = ({ className, profile }) => {
  return (
    <div className={`p-4 w-full h-fit shadow-md ${className}`}>
      <div className="flex items-center">
        <div
          className={`w-28 h-28 relative ${
            profile?.isPlus ? styles.psPlus : ""
          }`}
        >
          <Image
            src={profile?.avatar ?? ""}
            layout="fill"
            className="rounded-full"
            priority={true}
            alt="profile avatar"
          />
        </div>

        <div className="text-lg text-black ml-3">{profile?.username}</div>
      </div>

      <div className="text-md text-black my-4">Trophy Summary</div>

      <div className="flex justify-center">
        {profile?.trophySummary
          ? Object.keys(profile.trophySummary)
              .map((trophyType, index) => {
                return (
                  <TrophyCounter
                    key={index}
                    className={styles.trophyCounter}
                    type={trophyType as TrophyType}
                    count={
                      profile.trophySummary[trophyType as keyof TrophyCounts]!
                    }
                  />
                );
              })
              .reverse()
          : null}
      </div>
    </div>
  );
};

const TrophyCounter: React.FC<{
  count: number;
  type: TrophyType;
  className?: string;
}> = ({ count, type, className }) => {
  return (
    <div
      className={classnames(
        "flex items-center justify-center",
        {
          "text-sky-700": type === "platinum",
          "text-amber-400": type === "gold",
          "text-slate-400": type === "silver",
          "text-amber-700": type === "bronze",
        },
        className
      )}
    >
      <TrophyIcon className="w-4 h-4" />

      <div className="text-base ml-2">{count}</div>
    </div>
  );
};

const GameCard: React.FC<{
  className?: string;
  game: ArrayElement<NonNullable<inferQueryOutput<"dashboard">["games"]>>;
}> = ({ className, game }) => {
  const isPS5 = game.platforms.includes("PS5");

  return (
    <Link
      href={`/game?name=${game.name}&npCommunicationId=${game.npCommunicationId}&isPS5=${isPS5}`}
    >
      <div
        className={`p-4 w-full h-fit shadow-md flex items-center justify-between hover:bg-sky-100 hover:cursor-pointer ${className}`}
      >
        <div className="flex items-center min-w-0">
          <div
            className={`w-28 ${isPS5 ? "h-28" : "h-14"} flex-shrink-0 relative`}
          >
            <Image src={game.iconUrl} layout="fill" alt="game icon" />
          </div>

          <div className="mx-2 min-w-0">
            <div className="text-black text-base overflow-hidden whitespace-nowrap text-ellipsis mb-2">
              {game.name}
            </div>

            <div className="flex">
              {game.platforms.map((platform, index) => (
                <div
                  key={index}
                  className="badge badge--platform w-fit ml-2 first:ml-0"
                >
                  {platform}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex">
          {Object.keys(game.trophies)
            .map((trophyType, index) => {
              return (
                <TrophyCounter
                  key={index}
                  className={styles.trophyCounter}
                  type={trophyType as TrophyType}
                  count={game.trophies[trophyType as keyof TrophyCounts]!}
                />
              );
            })
            .reverse()}
        </div>
      </div>
    </Link>
  );
};
