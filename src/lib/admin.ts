import { getServerSession } from "next-auth";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

/** Returns the signed-in admin's user id, or null if not an admin. */
export async function getAdminUserId(): Promise<string | null> {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.id) return null;

  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });
  return user?.isAdmin ? session.user.id : null;
}
