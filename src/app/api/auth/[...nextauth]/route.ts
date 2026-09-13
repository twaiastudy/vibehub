import NextAuth from "next-auth";
import type { NextRequest } from "next/server";

import { getAuthOptions } from "@/lib/auth";

async function handler(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> },
) {
  const authOptions = await getAuthOptions();
  return NextAuth(req, context, authOptions);
}

export { handler as GET, handler as POST };
