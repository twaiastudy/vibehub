"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { JOINABLE_ROLES, ROLE_LABEL } from "@/lib/roles";
import { CommentThread } from "./comment-thread";
import { UpdatesFeed } from "./updates-feed";

type Member = {
  userId: string;
  role: string;
  expertise: string | null;
  user: { id: string; name: string | null; image: string | null };
};

type Comment = {
  id: string;
  content: string;
  author: { id: string; name: string | null };
};

type Suggestion = {
  id: string;
  content: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  author: { id: string; name: string | null; image: string | null };
  comments: Comment[];
};

type Update = {
  id: string;
  content: string;
  author: { id: string; name: string | null };
};

type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  neededRoles: string[];
  websiteUrl: string | null;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  members: Member[];
  suggestions: Suggestion[];
  updates: Update[];
};

export function ProjectDetail({
  project,
  isSignedIn,
  isMember,
  isOwner,
}: {
  project: Project;
  isSignedIn: boolean;
  isMember: boolean;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinExpertise, setJoinExpertise] = useState("");

  const filledRoles = new Set(project.members.map((m) => m.role));
  const openRoles = project.neededRoles.filter((role) => !filledRoles.has(role));
  const [joinRole, setJoinRole] = useState<(typeof JOINABLE_ROLES)[number]>(
    (openRoles[0] as (typeof JOINABLE_ROLES)[number]) ?? "DEVELOPER",
  );

  async function handleJoin() {
    await fetch(`/api/projects/${project.id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: joinRole, expertise: joinExpertise }),
    });
    router.refresh();
  }

  async function handleAddSuggestion(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch(`/api/projects/${project.id}/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setSubmitting(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "送出失敗");
      return;
    }

    setContent("");
    router.refresh();
  }

  async function handleAccept(suggestionId: string) {
    await fetch(`/api/suggestions/${suggestionId}/accept`, { method: "POST" });
    router.refresh();
  }

  async function handleClose() {
    await fetch(`/api/projects/${project.id}/close`, { method: "POST" });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">{project.title}</h1>
        {isOwner && project.status !== "CLOSED" && (
          <button
            onClick={handleClose}
            className="shrink-0 rounded border border-black/20 px-3 py-1 text-sm dark:border-white/20"
          >
            標記完成 / 結案
          </button>
        )}
        {project.status === "CLOSED" && (
          <span className="shrink-0 rounded-full border border-black/10 px-2 py-1 text-xs opacity-60 dark:border-white/10">
            已結案
          </span>
        )}
      </div>
      <p className="mt-2 whitespace-pre-wrap opacity-80">{project.description}</p>
      {project.websiteUrl && (
        <a
          href={project.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-[var(--accent)] underline"
        >
          🔗 {project.websiteUrl}
        </a>
      )}
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {project.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-black/10 px-2 py-1 dark:border-white/10">
            {tag}
          </span>
        ))}
      </div>

      {project.neededRoles.length > 0 && (
        <section className="mt-6 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-4">
          <h2 className="text-sm font-medium text-[var(--accent)]">招募中</h2>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {project.neededRoles.map((role) => {
              const filled = filledRoles.has(role);
              return (
                <li
                  key={role}
                  className={`rounded-full border px-3 py-1 ${
                    filled
                      ? "border-black/10 opacity-60 line-through dark:border-white/10"
                      : "border-[var(--accent)]/40 font-medium"
                  }`}
                >
                  {filled ? "✅" : "🔲"} {ROLE_LABEL[role] ?? role}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-sm font-medium opacity-70">
          參與者({project.members.length})
        </h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {project.members.map((member) => (
            <li key={member.userId} className="rounded border border-black/10 px-2 py-1 dark:border-white/10">
              {member.user.name ?? "匿名"} · {ROLE_LABEL[member.role] ?? member.role}
              {member.expertise && <span className="opacity-60"> · {member.expertise}</span>}
            </li>
          ))}
        </ul>
        {isSignedIn && !isMember && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={joinRole}
              onChange={(e) => setJoinRole(e.target.value as (typeof JOINABLE_ROLES)[number])}
              className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20 dark:bg-black"
            >
              {JOINABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABEL[role]}
                </option>
              ))}
            </select>
            <input
              value={joinExpertise}
              onChange={(e) => setJoinExpertise(e.target.value)}
              placeholder="你的專長(選填)"
              className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20"
            />
            <button onClick={handleJoin} className="rounded border border-black/20 px-3 py-1 text-sm dark:border-white/20">
              以此身份加入
            </button>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">建議 / 回饋</h2>

        {isSignedIn ? (
          <form onSubmit={handleAddSuggestion} className="mt-3 flex flex-col gap-2">
            <textarea
              className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="給這個專案的建議…"
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="self-start rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {submitting ? "送出中…" : "送出建議"}
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm opacity-70">登入後即可留下建議。</p>
        )}

        <ul className="mt-6 flex flex-col gap-3">
          {project.suggestions.map((suggestion) => (
            <li key={suggestion.id} className="rounded-lg border border-black/10 p-3 dark:border-white/10">
              <p>{suggestion.content}</p>
              <div className="mt-2 flex items-center justify-between text-xs opacity-60">
                <span>{suggestion.author.name ?? "匿名"} · {suggestion.status}</span>
                {isOwner && suggestion.status === "PENDING" && (
                  <button
                    onClick={() => handleAccept(suggestion.id)}
                    className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
                  >
                    採納並發放點數
                  </button>
                )}
              </div>
              <CommentThread
                suggestionId={suggestion.id}
                comments={suggestion.comments}
                isSignedIn={isSignedIn}
              />
            </li>
          ))}
        </ul>
      </section>

      <UpdatesFeed projectId={project.id} updates={project.updates} isOwner={isOwner} />
    </div>
  );
}
