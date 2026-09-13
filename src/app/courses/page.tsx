import Link from "next/link";

import { getPrisma } from "@/lib/prisma";

// Prices and enrollment counts change over time.
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const prisma = await getPrisma();
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { instructor: true, _count: { select: { enrollments: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">課程</h1>
        <Link
          href="/courses/new"
          className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          開課
        </Link>
      </div>

      {courses.length === 0 && (
        <p className="mt-6 text-sm opacity-70">還沒有課程,達到 Mentor 門檻的人可以開第一堂課。</p>
      )}

      <ul className="mt-6 flex flex-col gap-4">
        {courses.map((course) => (
          <li key={course.id} className="rounded-lg border border-black/10 p-4 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Link href={`/courses/${course.id}`} className="text-lg font-medium hover:underline">
                {course.title}
              </Link>
              {course.isFoundational && (
                <span className="rounded-full border border-[var(--accent)]/40 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                  基礎課程
                </span>
              )}
            </div>
            <p className="mt-1 text-sm opacity-70">{course.description}</p>
            <div className="mt-2 flex gap-3 text-xs opacity-60">
              <span>講師:{course.instructor.name ?? "匿名"}</span>
              <span>{course.pointsCost} VP</span>
              <span>{course._count.enrollments} 人報名</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
