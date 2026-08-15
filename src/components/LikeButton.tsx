"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface Props {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({ postId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    if (loading) return;
    setLoading(true);

    // Optimistic
    setLiked(!liked);
    setCount((c) => (liked ? c - 1 : c + 1));

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) {
        // Revert
        setLiked(liked);
        setCount(initialCount);
      }
    } catch {
      setLiked(liked);
      setCount(initialCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
        liked
          ? "text-red-400 bg-red-500/10"
          : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
      }`}
    >
      <Heart size={16} fill={liked ? "currentColor" : "none"} />
      <span>{count || ""}</span>
    </button>
  );
}
