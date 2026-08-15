"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, MessageCircle, Share2, Repeat2, Send } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Author {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
}

interface PostData {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string | Date;
  author: Author;
  originalPostId?: string | null;
  originalPost?: {
    id: string;
    content: string;
    imageUrl?: string | null;
    author: Author;
  } | null;
  likes: { userId: string }[];
  _count: { likes: number; comments: number; repostRecords?: number };
  isRepostedByMe?: boolean;
}

interface Props {
  post: PostData;
  currentUserId: string;
}

export default function PostCard({ post, currentUserId }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(
    post.likes.some((l) => l.userId === currentUserId)
  );
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [reposted, setReposted] = useState(!!post.isRepostedByMe);
  const [reposting, setReposting] = useState(false);

  const isRepost = !!post.originalPostId && post.originalPost;
  const displayPost = isRepost ? post.originalPost! : post;
  const displayAuthor = isRepost ? post.originalPost!.author : post.author;

  async function toggleLike() {
    const prev = liked;
    setLiked(!prev);
    setLikeCount((c) => (prev ? c - 1 : c + 1));
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) {
        setLiked(prev);
        setLikeCount((c) => (prev ? c + 1 : c - 1));
      }
    } catch {
      setLiked(prev);
      setLikeCount((c) => (prev ? c + 1 : c - 1));
    }
  }

  async function loadComments() {
    if (comments.length > 0 && showComments) {
      setShowComments(false);
      return;
    }
    setShowComments(true);
    if (comments.length > 0) return;
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/comments?postId=${displayPost.id}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      /* ignore */
    } finally {
      setLoadingComments(false);
    }
  }

  async function sendComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || sendingComment) return;
    setSendingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: displayPost.id,
          content: commentText.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setComments((c) => [...c, data.comment]);
        setCommentCount((n) => n + 1);
        setCommentText("");
      }
    } catch {
      /* ignore */
    } finally {
      setSendingComment(false);
    }
  }

  async function toggleRepost() {
    if (reposting) return;
    setReposting(true);
    const prev = reposted;
    setReposted(!prev);
    try {
      const res = await fetch(`/api/posts/${displayPost.id}/repost`, {
        method: "POST",
      });
      if (!res.ok) setReposted(prev);
      else router.refresh();
    } catch {
      setReposted(prev);
    } finally {
      setReposting(false);
    }
  }

  return (
    <article className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      {isRepost && (
        <div className="px-4 pt-3 flex items-center gap-1.5 text-xs text-[var(--muted)]">
          <Repeat2 size={14} />
          <span>
            <Link
              href={`/profile/${post.author.username}`}
              className="font-medium hover:underline"
            >
              {post.author.displayName}
            </Link>{" "}
            репостнул
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Link href={`/profile/${displayAuthor.username}`}>
            {displayAuthor.avatarUrl ? (
              <img
                src={displayAuthor.avatarUrl}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold">
                {displayAuthor.displayName[0]?.toUpperCase()}
              </div>
            )}
          </Link>
          <div>
            <Link
              href={`/profile/${displayAuthor.username}`}
              className="font-semibold text-[15px] hover:underline"
            >
              {displayAuthor.displayName}
            </Link>
            <div className="text-xs text-[var(--muted)]">
              @{displayAuthor.username} ·{" "}
              {formatRelativeTime(
                typeof post.createdAt === "string"
                  ? new Date(post.createdAt)
                  : post.createdAt
              )}
            </div>
          </div>
        </div>

        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
          {displayPost.content}
        </p>

        {displayPost.imageUrl && (
          <img
            src={displayPost.imageUrl}
            alt=""
            className="mt-3 rounded-lg max-h-[420px] w-full object-cover"
          />
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-[var(--border)] flex items-center gap-1">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
            liked
              ? "text-red-500"
              : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
          }`}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
          <span>{likeCount || ""}</span>
        </button>

        <button
          onClick={loadComments}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
            showComments
              ? "text-[var(--primary)]"
              : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
          }`}
        >
          <MessageCircle size={16} />
          <span>{commentCount || ""}</span>
        </button>

        <button
          onClick={toggleRepost}
          disabled={reposting}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
            reposted
              ? "text-green-500"
              : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
          }`}
        >
          <Repeat2 size={16} />
        </button>
      </div>

      {showComments && (
        <div className="border-t border-[var(--border)] px-4 py-3 space-y-3">
          {loadingComments ? (
            <p className="text-sm text-[var(--muted)]">Загрузка...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Пока нет комментариев</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <Link href={`/profile/${c.author.username}`} className="shrink-0">
                  {c.author.avatarUrl ? (
                    <img
                      src={c.author.avatarUrl}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-semibold">
                      {c.author.displayName[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="bg-[var(--background)] rounded-xl px-3 py-2">
                    <Link
                      href={`/profile/${c.author.username}`}
                      className="font-semibold text-sm hover:underline"
                    >
                      {c.author.displayName}
                    </Link>
                    <p className="text-sm mt-0.5 whitespace-pre-wrap">
                      {c.content}
                    </p>
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1 ml-1">
                    {formatRelativeTime(new Date(c.createdAt))}
                  </div>
                </div>
              </div>
            ))
          )}

          <form onSubmit={sendComment} className="flex gap-2 pt-1">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Написать комментарий..."
              className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || sendingComment}
              className="p-2 bg-[var(--primary)] text-white rounded-xl disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
