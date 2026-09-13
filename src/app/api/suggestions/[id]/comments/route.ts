import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

// Anyone signed in can comment, not just the project owner or members —
// the whole point is domain experts and other developers can weigh in on
// a suggestion, not just a single owner reply.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getPrisma();
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: suggestionId } = await params;
  const { content } = (await request.json()) as { content?: string };
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const suggestion = await prisma.suggestion.findUnique({ where: { id: suggestionId } });
  if (!suggestion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { suggestionId, authorId: session.user.id, content },
  });

  return NextResponse.json(comment, { status: 201 });
}
