import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import CreatePost from "@/components/CreatePost";
import LikeButton from "@/components/LikeButton";

export default async function FeedPage() {
  const user = await getSession();
  if (!user) return null;

  const posts = await prisma.post.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      likes: {
        select: { userId: true },
      },
      _count: {
        select: { comments: true, likes: true },
      },
    },
  });

  return (
    <div className="max-w-[640px] mx-auto space-y-4">
      <CreatePost displayName={user.displayName} avatarUrl={user.avatarUrl} />

      {posts.length === 0 ? (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-12 text-center">
          <p className="text-lg text-[var(--muted)] mb-1">Лента пока пуста</p>
          <p className="text-sm text-[var(--muted-dark)]">
            Напиши первый пост выше
          </p>
        </div>
      ) : (
        posts.map((post) => {
          const isLiked = post.likes.some((l) => l.userId === user.id);

          return (
            <article
              key={post.id}
              className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Link href={`/profile/${post.author.username}`}>
                    {post.author.avatarUrl ? (
                      <img
                        src={post.author.avatarUrl}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold">
                        {post.author.displayName[0]?.toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div>
                    <Link
                      href={`/profile/${post.author.username}`}
                      className="font-semibold text-[15px] hover:underline"
                    >
                      {post.author.displayName}
                    </Link>
                    <div className="text-xs text-[var(--muted)]">
                      @{post.author.username} · {formatRelativeTime(post.createdAt)}
                    </div>
                  </div>
                </div>

                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {post.content}
                </p>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="mt-3 rounded-lg max-h-[420px] w-full object-cover"
                  />
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-[var(--border)] flex items-center gap-1">
                <LikeButton
                  postId={post.id}
                  initialLiked={isLiked}
                  initialCount={post._count.likes}
                />
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] transition">
                  <MessageCircle size={16} />
                  <span>{post._count.comments || ""}</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] transition ml-auto">
                  <Share2 size={16} />
                </button>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
