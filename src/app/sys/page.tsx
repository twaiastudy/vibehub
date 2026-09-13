import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SysDashboardPage() {
  const prisma = await getPrisma();

  const [userCount, projectCount, referralCount, pointsIssued] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.user.count({ where: { referredById: { not: null } } }),
    prisma.pointsLedgerEntry.aggregate({
      _sum: { amount: true },
      where: { amount: { gt: 0 } },
    }),
  ]);

  const stats = [
    { label: "使用者", value: userCount },
    { label: "專案", value: projectCount },
    { label: "成功邀請", value: referralCount },
    { label: "累積發放點數", value: pointsIssued._sum.amount ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">後台總覽</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-black/10 p-4 text-center dark:border-white/10">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs opacity-60">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
