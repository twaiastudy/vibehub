import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthOptions } from "@/lib/auth";
import { isMentor, MENTOR_THRESHOLD_POINTS } from "@/lib/mentor";
import { getPrisma } from "@/lib/prisma";
import { InviteLink } from "./invite-link";

const REASON_LABEL: Record<string, string> = {
  SUGGESTION_ACCEPTED: "建議被採納",
  MANUAL_ADJUSTMENT: "手動調整",
  WELCOME_BONUS: "新手禮包",
  REFERRAL_SIGNUP: "邀請成功",
  REFERRAL_FIRST_TASK: "受邀者完成第一次任務",
  REFERRAL_FIRST_PROJECT: "受邀者完成第一個專案",
  REFERRAL_FIRST_COURSE: "受邀者完成第一次報名課程",
  COURSE_ENROLLMENT: "報名課程",
  STUDY_GROUP_COMPLETED: "讀書會結案獎勵",
};

const REFERRAL_STAGE_LABEL: Record<string, string> = {
  REFERRAL_SIGNUP: "已加入",
  REFERRAL_FIRST_TASK: "完成第一次任務",
  REFERRAL_FIRST_PROJECT: "完成第一個專案",
};

export default async function MePage() {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.id) {
    redirect("/");
  }

  const prisma = await getPrisma();
  const [user, ledgerEntries, referredUsers, enrollments, host] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.pointsLedgerEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { referredById: session.user.id },
      select: { id: true, name: true },
    }),
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      orderBy: { enrolledAt: "desc" },
      include: { course: { select: { id: true, title: true, isFoundational: true } } },
    }),
    headers().then((h) => h.get("host")),
  ]);

  const referralEntriesByInvitee = new Map<string, string[]>();
  for (const entry of ledgerEntries) {
    if (entry.refType !== "Referral" || !entry.refId) continue;
    const stages = referralEntriesByInvitee.get(entry.refId) ?? [];
    stages.push(entry.reason);
    referralEntriesByInvitee.set(entry.refId, stages);
  }

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const inviteUrl = `${protocol}://${host}/invite/${session.user.id}`;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold">我的點數</h1>
      <p className="mt-2 text-4xl font-bold">{user?.pointsBalance ?? 0}</p>
      {isMentor(user?.pointsBalance ?? 0) ? (
        <p className="mt-1 text-sm font-medium text-[var(--accent)]">🎓 你已經是 Mentor 了</p>
      ) : (
        <p className="mt-1 text-sm opacity-60">
          再累積 {MENTOR_THRESHOLD_POINTS - (user?.pointsBalance ?? 0)} VP 就能成為 Mentor
        </p>
      )}
      <Link href={`/u/${session.user.id}`} className="mt-2 inline-block text-sm underline opacity-70">
        查看我的 Vibe Passport(可分享的公開頁面)
      </Link>

      <section className="mt-8">
        <h2 className="text-sm font-medium opacity-70">我的邀請連結</h2>
        <InviteLink url={inviteUrl} />
        <p className="mt-2 text-xs opacity-60">
          邀請成功 +{20} VP,對方完成第一次任務再 +{50} VP,完成第一個專案再 +{100} VP。
        </p>
      </section>

      {referredUsers.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium opacity-70">我邀請的人({referredUsers.length})</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {referredUsers.map((referred) => {
              const stages = referralEntriesByInvitee.get(referred.id) ?? [];
              const latestStage = stages[0] ? REFERRAL_STAGE_LABEL[stages[0]] : "已加入";
              return (
                <li
                  key={referred.id}
                  className="flex items-center justify-between rounded border border-black/10 px-3 py-2 text-sm dark:border-white/10"
                >
                  <span>{referred.name ?? "匿名"}</span>
                  <span className="opacity-60">{latestStage}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium opacity-70">我報名的課程({enrollments.length})</h2>
        {enrollments.length === 0 ? (
          <p className="mt-2 text-sm opacity-60">
            還沒有報名任何課程,<Link href="/courses" className="underline">去看看課程</Link>吧。
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {enrollments.map((enrollment) => (
              <li
                key={enrollment.id}
                className="flex items-center justify-between rounded border border-black/10 px-3 py-2 text-sm dark:border-white/10"
              >
                <Link href={`/courses/${enrollment.course.id}`} className="hover:underline">
                  {enrollment.course.title}
                  {enrollment.course.isFoundational && (
                    <span className="ml-1.5 rounded-full border border-[var(--accent)]/40 px-1.5 py-0.5 text-xs text-[var(--accent)]">
                      基礎課程
                    </span>
                  )}
                </Link>
                <span className="opacity-60">花費 {enrollment.pointsPaid} VP</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <h2 className="mt-8 text-sm font-medium opacity-70">點數紀錄</h2>
      {ledgerEntries.length === 0 ? (
        <p className="mt-2 text-sm opacity-60">還沒有任何點數紀錄。</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {ledgerEntries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded border border-black/10 px-3 py-2 text-sm dark:border-white/10"
            >
              <span>{REASON_LABEL[entry.reason] ?? entry.reason}</span>
              <span className={entry.amount >= 0 ? "text-green-600" : "text-red-600"}>
                {entry.amount >= 0 ? `+${entry.amount}` : entry.amount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
