"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Comment = {
  id: string;
  content: string;
  author: { id: string; name: string | null };
};

export function CommentThread({
  suggestionId,
  comments,
  isSignedIn,
}: {
  suggestionId: string;
  comments: Comment[];
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    const response = await fetch(`/api/suggestions/${suggestionId}/comments`, {
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

  return (
    <div className="mt-3 border-t border-black/10 pt-3 dark:border-white/10">
      {comments.length > 0 && (
        <ul className="flex flex-col gap-2">
          {comments.map((comment) => (
            <li key={comment.id} className="text-sm">
              <span className="font-medium">{comment.author.name ?? "匿名"}</span>
              <span className="opacity-80">:{comment.content}</span>
            </li>
          ))}
        </ul>
      )}
      {isSignedIn && (
        <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
          <input
            className="flex-1 rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="回覆這則建議…"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded border border-black/20 px-2 py-1 text-sm disabled:opacity-50 dark:border-white/20"
          >
            回覆
          </button>
        </form>
      )}
    </div>
  );
}
