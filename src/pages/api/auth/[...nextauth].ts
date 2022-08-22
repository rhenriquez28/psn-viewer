import NextAuth, { type NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  exchangeCodeForAccessToken,
  exchangeNpssoForCode,
  exchangeRefreshTokenForAuthTokens,
} from "psn-api";

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const authorization = await exchangeRefreshTokenForAuthTokens(
      token.authorization.refreshToken
    );

    return {
      ...token,
      authorization,
      accessTokenExpiresIn: Date.now() + authorization.expiresIn * 1000,
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.authorization = user.authorization;
        token.accessTokenExpiresIn =
          Date.now() + token.authorization.expiresIn * 1000;
      }

      if (Date.now() < token.accessTokenExpiresIn) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.authorization = token.authorization;
        session.authPayload = {
          accessToken: session.authorization.accessToken,
        };
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        npsso: { label: "NPSSO", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.npsso) {
          return null;
        }

        try {
          const accessCode = await exchangeNpssoForCode(credentials.npsso);
          const authorization = await exchangeCodeForAccessToken(accessCode);
          const user = { authorization };
          return user;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
};

export default NextAuth(authOptions);
