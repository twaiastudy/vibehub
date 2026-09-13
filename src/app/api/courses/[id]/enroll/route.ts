import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { spendPoints } from "@/lib/points";
import { checkFirstCourseReferral } from "@/lib/referrals";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getPrisma();
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: courseId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const alreadyEnrolled = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId, userId: session.user.id } },
  });
  if (alreadyEnrolled) {
    return NextResponse.json({ error: "已經報名過這堂課了" }, { status: 409 });
  }

  const spendResult = await spendPoints({
    userId: session.user.id,
    amount: course.pointsCost,
    reason: "COURSE_ENROLLMENT",
    refType: "Course",
    refId: course.id,
  });
  if (!spendResult) {
    return NextResponse.json({ error: "點數不足" }, { status: 402 });
  }

  const enrollment = await prisma.enrollment.create({
    data: { courseId, userId: session.user.id, pointsPaid: course.pointsCost },
  });

  await checkFirstCourseReferral(session.user.id);

  return NextResponse.json(enrollment, { status: 201 });
}
