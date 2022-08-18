import { Progress, Spin } from "antd";
import classnames from "classnames";
import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { TrophyCounts, TrophyType } from "psn-api";
import TrophyIcon from "../components/TrophyIcon";
import styles from "../styles/index.module.scss";
import { ArrayElement } from "../types";
import { inferQueryOutput, trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data, isLoading, error, isIdle } = trpc.useQuery(["user"], {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading || isIdle) {
    return (
      <div className="flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <button
          onClick={() =>
            signIn("credentials", {
              npsso:
                "ookc3hAUJiTccc6MaYAfGcQzV6cHBQjzNM4xwJtnwPRbBeaf0F9H5ESFH4zT0kZs",
            })
          }
        >
          Sign in
        </button>
      </>
    );
  }

  return (
    <div className="p-8 flex flex-col items-center">
      <ProfileSummary className="mb-4 max-w-xl" profile={data.profile} />

      <div>My Games</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 justify-center items-center gap-x-3">
        {data.games.map((game, index) => {
          return (
            <GameCard key={index} className="mb-2 max-w-2xl" game={game} />
          );
        })}
      </div>
    </div>
  );
};

export default Home;

const ProfileSummary: React.FC<{
  className?: string;
  profile: inferQueryOutput<"user">["profile"];
}> = ({ className, profile }) => {
  const trophyLevelRange = findTrophyLevelRange(profile.trophyLevel);

  return (
    <div className={`p-4 w-full h-fit shadow-md ${className}`}>
      <div className="flex justify-between">
        <div className="flex items-center">
          <div
            className={`w-28 h-28 relative ${
              profile.isPlus ? styles.psPlus : ""
            }`}
          >
            <Image
              src={profile.avatar ?? ""}
              layout="fill"
              className="rounded-full"
              priority={true}
              alt="profile avatar"
            />
          </div>

          <div className="text-lg text-black ml-3">{profile.username}</div>
        </div>

        <div className="flex justify-center">
          {profile.earnedTrophies
            ? Object.keys(profile.earnedTrophies)
                .map((trophyType, index) => {
                  return (
                    <TrophyCounter
                      key={index}
                      className={styles.trophyCounter}
                      type={trophyType as TrophyType}
                      count={
                        profile.earnedTrophies[
                          trophyType as keyof TrophyCounts
                        ]!
                      }
                    />
                  );
                })
                .reverse()
            : null}
        </div>
      </div>

      <div className="flex justify-around items-center mt-5">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20">
            <Image
              src={`/trophy-level-${trophyLevelRange}.webp`}
              layout="fill"
              alt="Trophy Level Icon"
            />
          </div>

          <div className="mt-2">Level {profile.trophyLevel}</div>
        </div>

        <Progress
          type="circle"
          percent={profile.progress}
          strokeColor="black"
          width={80}
        />

        <div className="flex flex-col items-center">
          <div className="text-3xl">{profile.trophyTotal}</div>
          <div>Total Trophies</div>
        </div>
      </div>
    </div>
  );
};

const findTrophyLevelRange = (level: number) => {
  if (level >= 1 && level <= 99) {
    return "1-99";
  } else if (level >= 100 && level <= 199) {
    return "100-199";
  } else if (level >= 200 && level <= 299) {
    return "200-299";
  } else if (level >= 300 && level <= 399) {
    return "300-399";
  } else if (level >= 400 && level <= 499) {
    return "400-499";
  } else if (level >= 500 && level <= 599) {
    return "500-599";
  } else if (level >= 600 && level <= 699) {
    return "600-699";
  } else if (level >= 700 && level <= 799) {
    return "700-799";
  } else if (level >= 800 && level <= 998) {
    return "800-998";
  }
  return "999";
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
  game: ArrayElement<inferQueryOutput<"user">["games"]>;
}> = ({ className, game }) => {
  const isPS5 = game.platforms.includes("PS5");

  return (
    <Link
      href={`/game?name=${encodeURIComponent(
        game.name
      )}&npCommunicationId=${encodeURIComponent(
        game.npCommunicationId
      )}&isPS5=${isPS5}`}
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

        <div className="flex flex-col w-52">
          <div className="flex self-end mb-2">
            {Object.keys(game.earnedTrophies)
              .map((trophyType, index) => {
                return (
                  <TrophyCounter
                    key={index}
                    className={styles.trophyCounter}
                    type={trophyType as TrophyType}
                    count={
                      game.earnedTrophies[trophyType as keyof TrophyCounts]!
                    }
                  />
                );
              })
              .reverse()}
          </div>

          <Progress
            type="line"
            size="small"
            strokeColor="black"
            percent={game.progress}
            status="normal"
          />
        </div>
      </div>
    </Link>
  );
};
