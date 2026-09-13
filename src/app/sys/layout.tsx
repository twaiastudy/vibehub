import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminUserId } from "@/lib/admin";

// Every /sys/* page goes through this guard — none of them should assume
// the caller is an admin on their own.
export default async function SysLayout({ children }: { children: React.ReactNode }) {
  const adminUserId = await getAdminUserId();
  if (!adminUserId) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <nav className="mb-8 flex gap-4 border-b border-black/10 pb-3 text-sm dark:border-white/10">
        <Link href="/sys" className="font-semibold">
          後台
        </Link>
        <Link href="/sys/users">使用者</Link>
        <Link href="/sys/projects">專案</Link>
        <Link href="/sys/content">內容審核</Link>
      </nav>
      {children}
    </div>
  );
}
