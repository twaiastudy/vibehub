import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { EnrollButton } from "./enroll-button";
import { CourseCommentThread } from "./course-comment-thread";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(await getAuthOptions());
  const prisma = await getPrisma();

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: true,
      enrollments: { include: { user: { select: { id: true, name: true } } } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
      },
    },
  });
  if (!course) {
    notFound();
  }

  const currentUserId = session?.user?.id ?? null;
  const currentUser = currentUserId
    ? await prisma.user.findUnique({ where: { id: currentUserId }, select: { pointsBalance: true } })
    : null;
  const alreadyEnrolled = currentUserId
    ? course.enrollments.some((e) => e.userId === currentUserId)
    : false;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        {course.isFoundational && (
          <span className="rounded-full border border-[var(--accent)]/40 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
            基礎課程
          </span>
        )}
      </div>
      <p className="mt-1 text-sm opacity-60">講師:{course.instructor.name ?? "匿名"}</p>
      <p className="mt-4 whitespace-pre-wrap opacity-80">{course.description}</p>

      <div className="mt-6 flex items-center gap-4">
        <span className="text-2xl font-bold">{course.pointsCost} VP</span>
        {!session?.user?.id ? (
          <span className="text-sm opacity-60">登入後才能報名</span>
        ) : alreadyEnrolled ? (
          <span className="text-sm opacity-60">你已經報名這堂課了</span>
        ) : (
          <EnrollButton
            courseId={course.id}
            pointsCost={course.pointsCost}
            currentBalance={currentUser?.pointsBalance ?? 0}
          />
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-medium opacity-70">已報名({course.enrollments.length})</h2>
        <ul className="mt-2 flex flex-wrap gap-2 text-sm">
          {course.enrollments.map((e) => (
            <li key={e.id} className="rounded border border-black/10 px-2 py-1 dark:border-white/10">
              {e.user.name ?? "匿名"}
            </li>
          ))}
        </ul>
      </section>

      <CourseCommentThread
        courseId={course.id}
        comments={course.comments}
        isSignedIn={Boolean(currentUserId)}
      />
    </div>
  );
}
