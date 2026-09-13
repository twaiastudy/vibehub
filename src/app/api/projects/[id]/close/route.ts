import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { checkFirstProjectReferral } from "@/lib/referrals";
import { checkStudyGroupCompletion } from "@/lib/study-groups";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getPrisma();
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: projectId } = await params;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (!membership || membership.role !== "OWNER") {
    return NextResponse.json({ error: "Only a project owner can close it" }, { status: 403 });
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status: "CLOSED" },
  });

  const owners = await prisma.projectMember.findMany({
    where: { projectId, role: "OWNER" },
    select: { userId: true },
  });
  await Promise.all(owners.map((owner) => checkFirstProjectReferral(owner.userId)));
  await checkStudyGroupCompletion(projectId);

  return NextResponse.json(project);
}
