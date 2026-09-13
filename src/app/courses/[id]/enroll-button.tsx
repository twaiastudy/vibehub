"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EnrollButton({
  courseId,
  pointsCost,
  currentBalance,
}: {
  courseId: string;
  pointsCost: number;
  currentBalance: number;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAfford = currentBalance >= pointsCost;

  async function handleEnroll() {
    setSubmitting(true);
    setError(null);
    const response = await fetch(`/api/courses/${courseId}/enroll`, { method: "POST" });
    setSubmitting(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "報名失敗");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={handleEnroll}
        disabled={submitting || !canAfford}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {submitting ? "報名中…" : "報名"}
      </button>
      {!canAfford && (
        <p className="mt-1 text-xs text-red-600">
          點數不足(你有 {currentBalance} VP,需要 {pointsCost} VP)
        </p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
