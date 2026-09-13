"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewCourseForm({ suggestedFoundationalPrice }: { suggestedFoundationalPrice: number }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFoundational, setIsFoundational] = useState(false);
  const [pointsCost, setPointsCost] = useState(String(suggestedFoundationalPrice));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleFoundational(checked: boolean) {
    setIsFoundational(checked);
    if (checked) setPointsCost(String(suggestedFoundationalPrice));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        isFoundational,
        pointsCost: Number(pointsCost),
      }),
    });

    setSubmitting(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "開課失敗");
      return;
    }

    const course = (await response.json()) as { id: string };
    router.push(`/courses/${course.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">課程名稱</span>
        <input
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">課程說明</span>
        <textarea
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isFoundational}
          onChange={(e) => toggleFoundational(e.target.checked)}
        />
        這是通識/基礎課程(例如「Vibe Coding 基礎」)
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          報名點數
          {isFoundational && (
            <span className="ml-1 font-normal opacity-60">(基礎課建議定價 {suggestedFoundationalPrice} VP)</span>
          )}
        </span>
        <input
          type="number"
          min={1}
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          value={pointsCost}
          onChange={(e) => setPointsCost(e.target.value)}
          required
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {submitting ? "建立中…" : "建立課程"}
      </button>
    </form>
  );
}
