import { createSSGHelpers } from "@trpc/react/ssg";
import classnames from "classnames";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import superjson from "superjson";
import TrophyIcon from "../components/TrophyIcon";
import { appRouter } from "../server/router";
import { createContext } from "../server/router/context";
import { TrophyType } from "../types";
import { trpc } from "../utils/trpc";
import styles from "./index.module.scss";

export const getServerSideProps: GetServerSideProps = async () => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });

  await ssg.fetchQuery("dashboard");

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

const Home: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const dashboard = trpc.useQuery(["dashboard"]);
  console.log(dashboard);
  return (
    <div className="p-8 flex flex-col items-center">
      <button onClick={() => signIn()}>Sign in</button>
      <button onClick={() => signOut()}>Sign out</button>
      <ProfileSummary className="mb-4 max-w-xl" />

      <div>My Games</div>

      <GameCard className="mb-2 max-w-2xl" gameId="test" isPS5={true} />
      <GameCard className="mb-2 max-w-2xl" gameId="test" />
      <GameCard className="mb-2 max-w-2xl" gameId="test" isPS5={true} />
      <GameCard className="mb-2 max-w-2xl" gameId="test" />
      <GameCard className="mb-2 max-w-2xl" gameId="test" isPS5={true} />
      <GameCard className="mb-2 max-w-2xl" gameId="test" />
      <GameCard className="mb-2 max-w-2xl" gameId="test" isPS5={true} />
    </div>
  );
};

export default Home;

const ProfileSummary: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`p-4 w-full h-fit shadow-md ${className}`}>
      <div className="flex items-center">
        <div
          className={`w-28 h-28 bg-gray-300 rounded-full relative ${styles.psPlus}`}
        />

        <div className="text-lg text-black ml-3">roy5472</div>
      </div>

      <div className="text-md text-black my-4">Trophy Summary</div>

      <div className="flex justify-center">
        <TrophyCounter
          className={styles.trophyCounter}
          type="platinum"
          count={90}
        />
        <TrophyCounter
          className={styles.trophyCounter}
          type="gold"
          count={100}
        />
        <TrophyCounter
          className={styles.trophyCounter}
          type="silver"
          count={250}
        />
        <TrophyCounter
          className={styles.trophyCounter}
          type="bronze"
          count={1050}
        />
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
          "text-black": type === "all",
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
  isPS5?: boolean;
  gameId: string;
}> = ({ className, isPS5, gameId }) => {
  return (
    <Link href={`/game/${gameId}`}>
      <div
        className={`p-4 w-full h-fit shadow-md flex items-center justify-between hover:bg-sky-100 hover:cursor-pointer ${className}`}
      >
        <div className="flex items-center min-w-0">
          {isPS5 ? (
            <div className="w-28 h-28 bg-gray-300 flex-shrink-0" />
          ) : (
            <div className="w-28 h-14 bg-gray-300 flex-shrink-0" />
          )}

          <div className="mx-2 min-w-0">
            <div className="text-black text-base overflow-hidden whitespace-nowrap text-ellipsis mb-2">
              Ratchet &amp; Clank: Rift Apart
            </div>

            <div className="badge badge--platform w-fit">PS5</div>
          </div>
        </div>

        <div className="flex">
          <TrophyCounter
            className={styles.trophyCounter}
            type="platinum"
            count={90}
          />
          <TrophyCounter
            className={styles.trophyCounter}
            type="gold"
            count={100}
          />
          <TrophyCounter
            className={styles.trophyCounter}
            type="silver"
            count={250}
          />
          <TrophyCounter
            className={styles.trophyCounter}
            type="bronze"
            count={1050}
          />
        </div>
      </div>
    </Link>
  );
};
