import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";

export default async function FeedPage() {
  const user = await getSession();
  if (!user) return null;

  const posts = await prisma.post.findMany({
    take: 40,
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
      originalPost: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
      likes: {
        select: { userId: true },
      },
      repostRecords: {
        where: { userId: user.id },
        select: { id: true },
      },
      _count: {
        select: { comments: true, likes: true, repostRecords: true },
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
        posts.map((post) => (
          <PostCard
            key={post.id}
            currentUserId={user.id}
            post={{
              ...post,
              createdAt: post.createdAt.toISOString(),
              isRepostedByMe: post.repostRecords.length > 0,
              originalPost: post.originalPost
                ? {
                    id: post.originalPost.id,
                    content: post.originalPost.content,
                    imageUrl: post.originalPost.imageUrl,
                    author: post.originalPost.author,
                  }
                : null,
            }}
          />
        ))
      )}
    </div>
  );
}
