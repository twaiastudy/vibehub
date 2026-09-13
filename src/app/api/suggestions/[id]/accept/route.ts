import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/points";
import { checkFirstTaskReferral } from "@/lib/referrals";

const SUGGESTION_ACCEPTED_POINTS = 10;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getPrisma();
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: suggestionId } = await params;

  const suggestion = await prisma.suggestion.findUnique({
    where: { id: suggestionId },
    include: { project: { include: { members: true } } },
  });
  if (!suggestion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = suggestion.project.members.some(
    (member) => member.userId === session.user.id && member.role === "OWNER",
  );
  if (!isOwner) {
    return NextResponse.json({ error: "Only a project owner can accept suggestions" }, { status: 403 });
  }
  if (suggestion.status !== "PENDING") {
    return NextResponse.json({ error: "Suggestion already resolved" }, { status: 409 });
  }

  const updated = await prisma.suggestion.update({
    where: { id: suggestionId },
    data: { status: "ACCEPTED" },
  });

  await awardPoints({
    userId: suggestion.authorId,
    amount: SUGGESTION_ACCEPTED_POINTS,
    reason: "SUGGESTION_ACCEPTED",
    refType: "Suggestion",
    refId: suggestion.id,
  });
  await checkFirstTaskReferral(suggestion.authorId);

  return NextResponse.json(updated);
}
