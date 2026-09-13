import Link from "next/link";
import { notFound } from "next/navigation";

import { isMentor, MENTOR_THRESHOLD_POINTS } from "@/lib/mentor";
import { getPrisma } from "@/lib/prisma";
import { ROLE_LABEL } from "@/lib/roles";

// Points balance and project list change over time, so this can't be
// frozen at build time.
export const dynamic = "force-dynamic";

export default async function VibePassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prisma = await getPrisma();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      pointsBalance: true,
      createdAt: true,
      _count: { select: { referrals: true } },
      memberships: {
        include: { project: { select: { id: true, title: true, status: true } } },
        orderBy: { joinedAt: "asc" },
      },
      suggestions: {
        where: { status: "ACCEPTED" },
        select: { id: true },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const mentor = isMentor(user.pointsBalance);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--accent)]">
        Vibe Passport
      </p>
      <div className="mt-2 flex items-center gap-2">
        <h1 className="text-3xl font-bold">{user.name ?? "匿名"}</h1>
        {mentor && (
          <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
            🎓 Mentor
          </span>
        )}
      </div>
      <p className="mt-1 text-sm opacity-60">
        {new Date(user.createdAt).toLocaleDateString("zh-TW")} 加入 VibeHub
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <p className="text-2xl font-bold">{user.pointsBalance}</p>
          <p className="mt-1 text-xs opacity-60">VP</p>
        </div>
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <p className="text-2xl font-bold">{user.memberships.length}</p>
          <p className="mt-1 text-xs opacity-60">參與專案</p>
        </div>
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <p className="text-2xl font-bold">{user.suggestions.length}</p>
          <p className="mt-1 text-xs opacity-60">建議被採納</p>
        </div>
      </div>

      {user._count.referrals > 0 && (
        <p className="mt-4 text-center text-sm opacity-70">
          已邀請 {user._count.referrals} 人加入 VibeHub
        </p>
      )}

      {!mentor && (
        <p className="mt-2 text-center text-xs opacity-50">
          再累積 {MENTOR_THRESHOLD_POINTS - user.pointsBalance} VP 就能成為 Mentor
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-medium">參與過的專案</h2>
        {user.memberships.length === 0 ? (
          <p className="mt-2 text-sm opacity-60">還沒有參與任何專案。</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {user.memberships.map((membership) => (
              <li
                key={membership.projectId}
                className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
              >
                <Link href={`/projects/${membership.project.id}`} className="font-medium hover:underline">
                  {membership.project.title}
                </Link>
                <span className="text-xs opacity-60">
                  {ROLE_LABEL[membership.role] ?? membership.role}
                  {membership.project.status === "CLOSED" && " · 已結案"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
