"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function Nav() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/10">
      <Link href="/" className="font-semibold">
        VibeHub
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/projects">需求廣場</Link>
        <Link href="/projects?studyGroup=1">讀書會</Link>
        <Link href="/courses">課程</Link>
        <Link href="/leaderboard">排行榜</Link>
        {session ? (
          <>
            <Link href="/me">
              {session.user?.name ?? "我的點數"}
            </Link>
            <button onClick={() => signOut()}>登出</button>
          </>
        ) : (
          <button onClick={() => signIn("google")}>用 Google 登入</button>
        )}
      </div>
    </nav>
  );
}
