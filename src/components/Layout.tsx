import { Spin } from "antd";
import debounce from "lodash.debounce";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { trpc } from "../utils/trpc";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useSession();
  return (
    <div className="flex flex-col h-screen justify-between">
      <Navbar status={status} />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

const Navbar: React.FC<{
  status: "authenticated" | "loading" | "unauthenticated";
}> = ({ status }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { data, isLoading } = trpc.useQuery(["search", searchQuery], {
    enabled: !!searchQuery,
  });
  const debouncedSetSearchQuery = debounce(
    (e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value),
    500
  );
  const debouncedSetShowSearchResults = debounce(
    (value: boolean) => setShowSearchResults(value),
    200
  );

  useEffect(() => {
    if (searchQuery && !showSearchResults) {
      setShowSearchResults(true);
    }
  }, [searchQuery]);

  return (
    <div className="py-4 px-8 flex justify-between items-center w-full top-0 bg-gray-800 text-zinc-300 shadow-md">
      <Link href={"/"}>
        <div className="font-normal text-2xl cursor-pointer">PSN Viewer</div>
      </Link>

      {status === "authenticated" ? (
        <div className="relative w-96 h-8 mx-3 text-black">
          <input
            placeholder="Search for a user..."
            className="w-full h-full p-4 rounded focus:outline-none focus:shadow-outline"
            type="text"
            onChange={debouncedSetSearchQuery}
            onBlur={() => debouncedSetShowSearchResults(false)}
          />

          {showSearchResults ? (
            <div className="absolute top-9 w-full bg-white z-30 h-48 shadow-md rounded-sm overflow-y-scroll">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Spin size="large" />
                </div>
              ) : (
                data?.results?.map(({ accountId, avatarUrl, onlineId }) => {
                  return (
                    <Link href={`/?id=${accountId}`} key={accountId}>
                      <div className="flex items-center p-3 hover:bg-sky-100 hover:cursor-pointer">
                        <div className="relative h-8 w-8">
                          <Image
                            src={avatarUrl}
                            layout="fill"
                            alt="User Avatar Image"
                            className="rounded-full"
                          />
                        </div>

                        <div className="ml-2">{onlineId}</div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex">
        <div className="w-28">social share placeholder</div>
        {status === "authenticated" ? (
          <button
            className="ml-2"
            onClick={() => signOut({ callbackUrl: "/welcome" })}
          >
            Sign Out
          </button>
        ) : null}
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <div className="bg-gray-800 text-zinc-300 decoration-2 mt-9 p-6">
      <div>Made by Roy Henriquez</div>
      <div>
        Roy Henriquez and PSN Viewer are not affiliated with Sony or PlayStation
        in any way.
      </div>
      <a
        className="block max-w-max underline"
        href="https://platprices.com/"
        target="_blank"
        rel="noreferrer"
      >
        Game info provided by PlatPrices
      </a>
      <a
        className="underline"
        href="https://www.flaticon.com/free-icons/trophy"
        target="_blank"
        title="trophy icons"
        rel="noreferrer"
      >
        Trophy icons created by Creative Stall Premium - Flaticon
      </a>
    </div>
  );
};
