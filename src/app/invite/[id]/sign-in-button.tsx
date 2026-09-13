"use client";

import { signIn } from "next-auth/react";

export function SignInToAcceptButton({ callbackUrl }: { callbackUrl: string }) {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl })}
      className="mt-4 rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
    >
      用 Google 登入以接受邀請
    </button>
  );
}
