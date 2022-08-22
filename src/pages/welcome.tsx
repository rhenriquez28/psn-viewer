import { NextPage } from "next";
import { signIn } from "next-auth/react";
import { useState } from "react";

const Welcome: NextPage = () => {
  const [npsso, setNpsso] = useState("");

  return (
    <div className="flex flex-col justify-center items-center text-lg p-8">
      <div className="font-bold text-4xl">Welcome to PSN Viewer!</div>
      <div>
        In order to use the app we need to authenticate you. Please follow these
        steps:
      </div>
      <ol className="list-decimal flex flex-col justify-center items-center max-w-lg mx-auto mt-4 [&>*]:mb-2">
        <li>
          In your web browser, visit{" "}
          <a
            href="https://www.playstation.com/"
            rel="noreferrer"
            target="_blank"
          >
            https://www.playstation.com/
          </a>
          , click the &quot;Sign In&quot; button, and log in with a PSN account.
        </li>

        <li>
          After that, in the same browser, visit{" "}
          <a
            href="https://ca.account.sony.com/api/v1/ssocookie"
            rel="noreferrer"
            target="_blank"
          >
            https://ca.account.sony.com/api/v1/ssocookie
          </a>
          . You will see something like this:
          <pre className="my-2">
            <code>{`{ "npsso": "<64 character token>" }`}</code>
          </pre>
          Copy your token without the double quotes and come back here.
        </li>

        <li>
          Finally, paste the token in the field below and enjoy the app!
          <form
            className="flex flex-col justify-center items-center mt-2"
            onSubmit={(e) => {
              e.preventDefault();
              signIn("credentials", { npsso, callbackUrl: "/" });
            }}
          >
            <input
              required
              placeholder="Paste your token here"
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
