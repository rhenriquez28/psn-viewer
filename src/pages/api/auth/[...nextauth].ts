import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { exchangeCodeForAccessToken, exchangeNpssoForCode } from "psn-api";

export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.authorization = user.authorization;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.authorization = token.authorization;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        npsso: { label: "NPSSO", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.npsso) {
          return null;
        }

        try {
          const accessCode = await exchangeNpssoForCode(credentials.npsso);
          const authorization = await exchangeCodeForAccessToken(accessCode);
          const user = { id: 1, authorization };
          return user;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
};

export default NextAuth(authOptions);
