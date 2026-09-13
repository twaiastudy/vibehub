import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { acceptReferral } from "@/lib/referrals";

export async function POST(request: Request) {
  const prisma = await getPrisma();
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviterId } = (await request.json()) as { inviterId?: string };
  if (!inviterId || typeof inviterId !== "string") {
    return NextResponse.json({ error: "inviterId is required" }, { status: 400 });
  }
  if (inviterId === session.user.id) {
    return NextResponse.json({ error: "Cannot accept your own invite" }, { status: 400 });
  }

  const inviter = await prisma.user.findUnique({ where: { id: inviterId }, select: { id: true } });
  if (!inviter) {
    return NextResponse.json({ error: "Invite link is invalid" }, { status: 404 });
  }

  const result = await acceptReferral(session.user.id, inviterId);
  if (!result) {
    return NextResponse.json({ error: "You already have an inviter" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
