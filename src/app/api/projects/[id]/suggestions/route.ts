import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getPrisma();
  const { id: projectId } = await params;
  const suggestions = await prisma.suggestion.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true, image: true } } },
  });
  return NextResponse.json(suggestions);
}

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
  const { content } = (await request.json()) as { content?: string };
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const suggestion = await prisma.suggestion.create({
    data: { projectId, authorId: session.user.id, content },
  });

  return NextResponse.json(suggestion, { status: 201 });
}
