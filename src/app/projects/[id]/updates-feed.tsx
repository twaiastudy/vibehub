"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Update = {
  id: string;
  content: string;
  author: { id: string; name: string | null };
};

export function UpdatesFeed({
  projectId,
  updates,
  isOwner,
}: {
  projectId: string;
  updates: Update[];
  isOwner: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    const response = await fetch(`/api/projects/${projectId}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setSubmitting(false);
    if (response.ok) {
      setContent("");
      router.refresh();
    }
  }

  if (updates.length === 0 && !isOwner) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-medium">進度動態</h2>

      {isOwner && (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
          <textarea
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="跟大家回報進度,例如:已修好 XX、資料更新到 XX…"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="self-start rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {submitting ? "發布中…" : "發布進度更新"}
          </button>
        </form>
      )}

      {updates.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3">
          {updates.map((update) => (
            <li key={update.id} className="rounded-lg border border-black/10 p-3 dark:border-white/10">
              <p className="whitespace-pre-wrap text-sm">{update.content}</p>
              <p className="mt-2 text-xs opacity-60">{update.author.name ?? "匿名"}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
