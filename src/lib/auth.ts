import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { getPrisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/points";

const WELCOME_BONUS_POINTS = 10;

// The Prisma client depends on the current request's D1 binding, so the
// adapter (and therefore the whole options object) has to be built fresh
// per request rather than once at module load.
export async function getAuthOptions(): Promise<NextAuthOptions> {
  const prisma = await getPrisma();

  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        // We sometimes pre-create a User row (e.g. attributing a seeded
        // project to a known email) before that person ever signs in.
        // Without this, NextAuth refuses to link their first real Google
        // sign-in to that pre-existing row and errors with
        // OAuthAccountNotLinked. Safe here because Google already verifies
        // the email.
        allowDangerousEmailAccountLinking: true,
      }),
    ],
    session: {
      strategy: "database",
    },
    events: {
      // Fires exactly once, right when the adapter first creates the row
      // for a brand-new Google account — never on subsequent sign-ins.
      async createUser({ user }) {
        await awardPoints({
          userId: user.id,
          amount: WELCOME_BONUS_POINTS,
          reason: "WELCOME_BONUS",
          refType: "User",
          refId: user.id,
        });
      },
    },
    callbacks: {
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
  };
}
