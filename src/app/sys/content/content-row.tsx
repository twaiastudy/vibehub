"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ContentRow({
  kind,
  id,
  author,
  content,
}: {
  kind: "suggestion" | "comment";
  id: string;
  author: string;
  content: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("確定要刪除這則內容嗎?這無法復原。")) return;
    setBusy(true);
    await fetch(`/api/sys/${kind === "suggestion" ? "suggestions" : "comments"}/${id}`, {
      method: "DELETE",
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
      <div>
        <span className="font-medium">{author}</span>
        <p className="mt-1 opacity-80">{content}</p>
      </div>
      <button
        onClick={handleDelete}
        disabled={busy}
        className="shrink-0 rounded border border-red-600/40 px-2 py-1 text-xs text-red-600 disabled:opacity-50"
      >
        刪除
      </button>
    </li>
  );
}
