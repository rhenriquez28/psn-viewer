import type { TRPCClientErrorLike } from "@trpc/client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import type { AppRouter } from "../server/router";

const Error: React.FC<{ error: TRPCClientErrorLike<AppRouter> }> = ({
  error,
}) => {
  const router = useRouter();
  const signOutAndRedirect = async () => {
    await signOut({ redirect: false });
    router.push("/welcome");
  };

  return (
    <div className="flex flex-col items-center justify-center text-3xl">
      <div>{error.message}</div>
      <button
        className="action-button mt-2"
        onClick={() =>
          error.data?.code === "FORBIDDEN"
            ? router.back()
            : signOutAndRedirect()
        }
      >
        {error.data?.code === "FORBIDDEN"
          ? "Go Back"
          : "Authenticate yourself!"}
      </button>
    </div>
  );
};

export default Error;
