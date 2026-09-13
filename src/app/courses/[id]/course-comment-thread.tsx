"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CourseComment = {
  id: string;
  content: string;
  author: { id: string; name: string | null };
};

export function CourseCommentThread({
  courseId,
  comments,
  isSignedIn,
}: {
  courseId: string;
  comments: CourseComment[];
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    const response = await fetch(`/api/courses/${courseId}/comments`, {
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
    <section className="mt-8">
      <h2 className="text-sm font-medium opacity-70">課程討論區 / Q&A({comments.length})</h2>
      {comments.length === 0 ? (
        <p className="mt-2 text-sm opacity-60">還沒有人發問,登入後可以第一個發問。</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded border border-black/10 px-3 py-2 text-sm dark:border-white/10">
              <span className="font-medium">{comment.author.name ?? "匿名"}</span>
              <span className="opacity-80">:{comment.content}</span>
            </li>
          ))}
        </ul>
      )}
      {isSignedIn && (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="對這堂課有什麼問題?"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded border border-black/20 px-3 py-1 text-sm disabled:opacity-50 dark:border-white/20"
          >
            送出
          </button>
        </form>
      )}
    </section>
  );
}
