import "next-auth";
import { AuthorizationPayload, AuthTokensResponse } from "psn-api";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    authorization: AuthTokensResponse;
    authPayload: AuthorizationPayload;
  }

  interface User {
    authorization: AuthTokensResponse;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    authorization: AuthTokensResponse;
  }
}
