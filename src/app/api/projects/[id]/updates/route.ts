import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

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

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (!membership || membership.role !== "OWNER") {
    return NextResponse.json({ error: "Only a project owner can post updates" }, { status: 403 });
  }

  const { content } = (await request.json()) as { content?: string };
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const update = await prisma.projectUpdate.create({
    data: { projectId, authorId: session.user.id, content },
  });

  return NextResponse.json(update, { status: 201 });
}
