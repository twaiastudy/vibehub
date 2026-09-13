import { getAdminUserId } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { UserRow } from "./user-row";

export const dynamic = "force-dynamic";

export default async function SysUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const adminUserId = await getAdminUserId();
  const prisma = await getPrisma();

  const users = await prisma.user.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      pointsBalance: true,
      isAdmin: true,
      _count: { select: { referrals: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">使用者</h1>
      <form className="mt-4 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="搜尋姓名或 email…"
          className="flex-1 rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black">
          搜尋
        </button>
      </form>

      <ul className="mt-6 flex flex-col gap-2">
        {users.map((user) => (
          <UserRow key={user.id} user={user} currentAdminId={adminUserId ?? ""} />
        ))}
      </ul>
    </div>
  );
}
