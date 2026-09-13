"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  pointsBalance: number;
  isAdmin: boolean;
  _count: { referrals: number };
};

export function UserRow({ user, currentAdminId }: { user: User; currentAdminId: string }) {
  const router = useRouter();
  const [pointsInput, setPointsInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleAdmin() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/sys/users/${user.id}/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: !user.isAdmin }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "操作失敗");
      return;
    }
    router.refresh();
  }

  async function adjustPoints(event: React.FormEvent) {
    event.preventDefault();
    const amount = Number(pointsInput);
    if (!Number.isInteger(amount) || amount === 0) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/sys/users/${user.id}/points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "操作失敗");
      return;
    }
    setPointsInput("");
    router.refresh();
  }

  return (
    <li className="rounded-lg border border-black/10 p-3 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-medium">{user.name ?? "匿名"}</span>
          <span className="ml-2 text-xs opacity-60">{user.email}</span>
          {user.isAdmin && (
            <span className="ml-2 rounded-full bg-black px-2 py-0.5 text-xs text-white dark:bg-white dark:text-black">
              管理員
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm opacity-70">
          <span>{user.pointsBalance} VP</span>
          <span>邀請 {user._count.referrals} 人</span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <form onSubmit={adjustPoints} className="flex items-center gap-1.5">
          <input
            type="number"
            value={pointsInput}
            onChange={(e) => setPointsInput(e.target.value)}
            placeholder="±點數"
            className="w-24 rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded border border-black/20 px-2 py-1 text-sm disabled:opacity-50 dark:border-white/20"
          >
            調整
          </button>
        </form>
        <button
          onClick={toggleAdmin}
          disabled={busy}
          className="rounded border border-black/20 px-2 py-1 text-sm disabled:opacity-50 dark:border-white/20"
        >
          {user.isAdmin ? "移除管理員" : "設為管理員"}
        </button>
        {user.id === currentAdminId && <span className="text-xs opacity-50">(你自己)</span>}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </li>
  );
}
