import { NextPage } from "next";
import { signIn } from "next-auth/react";
import { useState } from "react";

const Welcome: NextPage = () => {
  const [npsso, setNpsso] = useState("");

  return (
    <div className="flex flex-col justify-center items-center text-lg">
      <div className="font-bold text-4xl">Welcome to PSN Viewer!</div>
      <div>
        In order to use the app we need to authenticate you. Please follow this
        steps:
      </div>
      <ol className="list-decimal flex flex-col justify-center items-center max-w-lg mx-auto mt-4 [&>*]:mb-2">
        <li>
          In your web browser, visit{" "}
          <a
            className="underline"
            href="https://www.playstation.com/"
            rel="noreferrer"
            target="_blank"
          >
            the PlayStation homepage
          </a>
          , click the &quot;Sign In&quot; button, and log in with a PSN account.
          After that, come back here and refresh the page.
        </li>

        <li>
          Copy the characters between the doble quotes:
          <iframe
            src="https://ca.account.sony.com/api/v1/ssocookie"
            width={620}
            height={100}
          ></iframe>
        </li>

        <li>
          Paste the characters in the field below and enjoy the app!
          <form
            className="flex flex-col justify-center items-center"
            onSubmit={(e) => {
              e.preventDefault();
              signIn("credentials", { npsso, callbackUrl: "/" });
            }}
          >
            {npsso}
            <input
              required
              placeholder="Paste your NPSSO here"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              onChange={(e) => setNpsso(e.target.value)}
            />
            <button className="action-button mt-2" type="submit">
              Sign In
            </button>
          </form>
        </li>
      </ol>
    </div>
  );
};
export default Welcome;
