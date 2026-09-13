import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { isMentor } from "@/lib/mentor";
import { SUGGESTED_FOUNDATIONAL_COURSE_PRICE } from "@/lib/courses";

export async function GET() {
  const prisma = await getPrisma();
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { instructor: true, _count: { select: { enrollments: true } } },
  });
  return NextResponse.json(courses);
}

export async function POST(request: Request) {
  const prisma = await getPrisma();
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { pointsBalance: true },
  });
  if (!isMentor(user?.pointsBalance ?? 0)) {
    return NextResponse.json({ error: "只有 Mentor 可以開課" }, { status: 403 });
  }

  const { title, description, pointsCost, isFoundational } = (await request.json()) as {
    title?: string;
    description?: string;
    pointsCost?: number;
    isFoundational?: boolean;
  };
  if (!title || !description) {
    return NextResponse.json({ error: "title and description are required" }, { status: 400 });
  }

  const resolvedCost =
    Number.isInteger(pointsCost) && (pointsCost as number) > 0
      ? (pointsCost as number)
      : SUGGESTED_FOUNDATIONAL_COURSE_PRICE;

  const course = await prisma.course.create({
    data: {
      title,
      description,
      pointsCost: resolvedCost,
      isFoundational: Boolean(isFoundational),
      instructorId: session.user.id,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
