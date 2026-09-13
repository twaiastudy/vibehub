import Link from "next/link";

import { getPrisma } from "@/lib/prisma";

// Rankings shift as points/referrals land, so this can't be frozen at build time.
export const dynamic = "force-dynamic";

const MEDAL = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const prisma = await getPrisma();

  const [topByPoints, topByReferrals] = await Promise.all([
    prisma.user.findMany({
      orderBy: { pointsBalance: "desc" },
      take: 20,
      select: { id: true, name: true, pointsBalance: true },
    }),
    prisma.user.findMany({
      orderBy: { referrals: { _count: "desc" } },
      take: 20,
      select: { id: true, name: true, _count: { select: { referrals: true } } },
    }),
  ]);

  const pointsRanked = topByPoints.filter((user) => user.pointsBalance > 0);
  const referralsRanked = topByReferrals.filter((user) => user._count.referrals > 0);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold">排行榜</h1>

      <section className="mt-6">
        <h2 className="text-lg font-medium">點數排行榜</h2>
        <p className="mt-1 text-sm opacity-70">貢獻建議、幫忙測試、邀請朋友,都能累積 VP。</p>

        {pointsRanked.length === 0 ? (
          <p className="mt-4 text-sm opacity-60">還沒有人累積點數,成為第一個吧!</p>
        ) : (
          <ol className="mt-4 flex flex-col gap-2">
            {pointsRanked.map((user, index) => (
              <li
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm opacity-60">
                    {MEDAL[index] ?? index + 1}
                  </span>
                  <Link href={`/u/${user.id}`} className="font-medium hover:underline">
                    {user.name ?? "匿名"}
                  </Link>
                </span>
                <span className="text-sm opacity-70">{user.pointsBalance} VP</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">邀請排行榜</h2>
        <p className="mt-1 text-sm opacity-70">
          邀請越多人加入 VibeHub 一起貢獻,排名越前面。想上榜?到{" "}
          <Link href="/me" className="underline">
            我的頁面
          </Link>{" "}
          拿你的邀請連結。
        </p>

        {referralsRanked.length === 0 ? (
          <p className="mt-4 text-sm opacity-60">還沒有人邀請成功,成為第一個吧!</p>
        ) : (
          <ol className="mt-4 flex flex-col gap-2">
            {referralsRanked.map((user, index) => (
              <li
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm opacity-60">
                    {MEDAL[index] ?? index + 1}
                  </span>
                  <Link href={`/u/${user.id}`} className="font-medium hover:underline">
                    {user.name ?? "匿名"}
                  </Link>
                </span>
                <span className="text-sm opacity-70">邀請了 {user._count.referrals} 人</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
