"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Project = {
  id: string;
  title: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  ownerName: string;
};

export function ProjectRow({ project }: { project: Project }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClose() {
    setBusy(true);
    await fetch(`/api/sys/projects/${project.id}/close`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`確定要刪除「${project.title}」嗎?這無法復原。`)) return;
    setBusy(true);
    await fetch(`/api/sys/projects/${project.id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-black/10 p-3 dark:border-white/10">
      <div>
        <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
          {project.title}
        </Link>
        <span className="ml-2 text-xs opacity-60">
          {project.ownerName} · {project.status}
        </span>
      </div>
      <div className="flex gap-2">
        {project.status !== "CLOSED" && (
          <button
            onClick={handleClose}
            disabled={busy}
            className="rounded border border-black/20 px-2 py-1 text-sm disabled:opacity-50 dark:border-white/20"
          >
            強制結案
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={busy}
          className="rounded border border-red-600/40 px-2 py-1 text-sm text-red-600 disabled:opacity-50"
        >
          刪除
        </button>
      </div>
    </li>
  );
}
