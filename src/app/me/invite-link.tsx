"use client";

import { useState } from "react";

export function InviteLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        readOnly
        value={url}
        className="flex-1 rounded border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        onFocus={(e) => e.currentTarget.select()}
      />
      <button
        onClick={handleCopy}
        className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
      >
        {copied ? "已複製" : "複製連結"}
      </button>
    </div>
  );
}
