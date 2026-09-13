import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

// Anyone signed in can ask/answer, not just enrolled students or the
// instructor — same "open Q&A" pattern as Comment on a Suggestion.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getPrisma();
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: courseId } = await params;
  const { content } = (await request.json()) as { content?: string };
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const comment = await prisma.courseComment.create({
    data: { courseId, authorId: session.user.id, content },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}
