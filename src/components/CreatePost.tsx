"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  displayName: string;
  avatarUrl?: string | null;
}

export default function CreatePost({ displayName, avatarUrl }: Props) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка");
        return;
      }

      setContent("");
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold shrink-0">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Что у вас нового?"
              rows={3}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-dark)] focus:outline-none focus:border-[var(--primary)] resize-none transition"
            />
            {error && (
              <p className="text-sm text-red-400 mt-1.5">{error}</p>
            )}
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!content.trim() || loading}
                className="px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Публикуем..." : "Опубликовать"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
