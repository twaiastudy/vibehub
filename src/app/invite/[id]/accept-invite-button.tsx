"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AcceptInviteButton({ inviterId }: { inviterId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/referrals/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviterId }),
    });

    setSubmitting(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "接受邀請失敗");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleAccept}
        disabled={submitting}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {submitting ? "處理中…" : "接受邀請,加入 VibeHub"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
