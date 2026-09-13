import { NextResponse } from "next/server";

import { getAdminUserId } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { checkFirstProjectReferral } from "@/lib/referrals";
import { checkStudyGroupCompletion } from "@/lib/study-groups";

// Same effect as the owner-gated close in /api/projects/[id]/close, but
// callable by an admin on anyone's behalf — still triggers the "first
// project" referral milestone for the real owner(s), since the project
// genuinely did get finished regardless of who clicked the button.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminUserId = await getAdminUserId();
  if (!adminUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const prisma = await getPrisma();

  const project = await prisma.project.update({
    where: { id },
    data: { status: "CLOSED" },
  });

  const owners = await prisma.projectMember.findMany({
    where: { projectId: id, role: "OWNER" },
    select: { userId: true },
  });
  await Promise.all(owners.map((owner) => checkFirstProjectReferral(owner.userId)));
  await checkStudyGroupCompletion(id);

  return NextResponse.json(project);
}
