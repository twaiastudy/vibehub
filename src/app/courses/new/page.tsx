import { getServerSession } from "next-auth";
import Link from "next/link";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { isMentor, MENTOR_THRESHOLD_POINTS } from "@/lib/mentor";
import { SUGGESTED_FOUNDATIONAL_COURSE_PRICE } from "@/lib/courses";
import { NewCourseForm } from "./new-course-form";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const session = await getServerSession(await getAuthOptions());

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-xl px-6 py-10">
        <h1 className="text-2xl font-semibold">開課</h1>
        <p className="mt-3 text-sm opacity-70">登入後才能開課。</p>
      </div>
    );
  }

  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { pointsBalance: true },
  });
  const mentor = isMentor(user?.pointsBalance ?? 0);

  if (!mentor) {
    return (
      <div className="mx-auto max-w-xl px-6 py-10">
        <h1 className="text-2xl font-semibold">開課</h1>
        <p className="mt-3 text-sm opacity-70">
          只有累積 {MENTOR_THRESHOLD_POINTS} VP 以上的 Mentor 可以開課。你目前 {user?.pointsBalance ?? 0} VP,
          再累積 {MENTOR_THRESHOLD_POINTS - (user?.pointsBalance ?? 0)} VP 就能成為 Mentor。
        </p>
        <Link href="/me" className="mt-3 inline-block text-sm underline">
          查看我的點數
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">開課</h1>
      <NewCourseForm suggestedFoundationalPrice={SUGGESTED_FOUNDATIONAL_COURSE_PRICE} />
    </div>
  );
}
