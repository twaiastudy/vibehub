import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { JOINABLE_ROLES } from "@/lib/roles";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getPrisma();
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: projectId } = await params;

  const { role, expertise } = (await request.json().catch(() => ({}))) as {
    role?: string;
    expertise?: string;
  };
  const chosenRole = JOINABLE_ROLES.includes(role as (typeof JOINABLE_ROLES)[number])
    ? (role as (typeof JOINABLE_ROLES)[number])
    : "DEVELOPER";

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { capacity: true, _count: { select: { members: true } } },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const alreadyMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (!alreadyMember && project.capacity !== null && project._count.members >= project.capacity) {
    return NextResponse.json({ error: "這個讀書會已經額滿了" }, { status: 409 });
  }

  const membership = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId: session.user.id } },
    create: {
      projectId,
      userId: session.user.id,
      role: chosenRole,
      expertise: expertise?.trim() || null,
    },
    update: {},
  });

  return NextResponse.json(membership, { status: 201 });
}
