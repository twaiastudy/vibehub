"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { JOINABLE_ROLES, ROLE_LABEL } from "@/lib/roles";

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [neededRoles, setNeededRoles] = useState<string[]>([]);
  const [ownerExpertise, setOwnerExpertise] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleRole(role: string) {
    setNeededRoles((current) =>
      current.includes(role) ? current.filter((r) => r !== role) : [...current, role],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        neededRoles,
        ownerExpertise,
        websiteUrl,
      }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "發布失敗,請確認已登入");
      return;
    }

    const project = (await response.json()) as { id: string };
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">發布需求</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">標題</span>
          <input
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">說明</span>
          <textarea
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="這個需求要解決什麼問題?為什麼值得做?"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">網站連結(選填,如果已經有上線的產品)</span>
          <input
            type="url"
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">標籤(逗號分隔)</span>
          <input
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="next.js, testing"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">你的角色與專長(選填)</span>
          <input
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            value={ownerExpertise}
            onChange={(e) => setOwnerExpertise(e.target.value)}
            placeholder="例如:全端工程師,8 年經驗 / 資深採購承辦人員"
          />
        </label>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">這個專案缺哪些角色?(可複選)</span>
          <div className="flex flex-wrap gap-2">
            {JOINABLE_ROLES.map((role) => (
              <label
                key={role}
                className="flex items-center gap-1.5 rounded border border-black/20 px-2.5 py-1.5 text-sm dark:border-white/20"
              >
                <input
                  type="checkbox"
                  checked={neededRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
                {ROLE_LABEL[role]}
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {submitting ? "發布中…" : "發布"}
        </button>
      </form>
    </div>
  );
}
