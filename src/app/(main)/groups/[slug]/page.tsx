import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function GroupPage({ params }: Props) {
  const { slug } = await params;
  const user = await getSession();
  if (!user) redirect("/login");

  const group = await prisma.group.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      members: {
        take: 20,
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      },
      posts: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          _count: { select: { likes: true, comments: true } },
        },
      },
      _count: { select: { members: true, posts: true } },
    },
  });

  if (!group) notFound();

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-[var(--primary)] to-purple-600" />
        <div className="px-5 pb-5 -mt-10">
          <div className="w-20 h-20 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center text-3xl font-bold border-4 border-[var(--card)]">
            {group.name[0]?.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold mt-3">{group.name}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {group._count.members} участников · {group._count.posts} постов
          </p>
          {group.description && (
            <p className="mt-3 text-[15px]">{group.description}</p>
          )}
          <p className="text-sm text-[var(--muted)] mt-2">
            Создатель:{" "}
            <Link href={`/profile/${group.owner.username}`} className="text-[var(--primary)] hover:underline">
              {group.owner.displayName}
            </Link>
          </p>
        </div>
      </div>

      <h2 className="font-semibold mb-3">Посты группы</h2>
      {group.posts.length === 0 ? (
        <p className="text-[var(--muted)] text-center py-8">Пока нет постов</p>
      ) : (
        <div className="space-y-4">
          {group.posts.map((post) => (
            <div key={post.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{post.author.displayName}</span>
                <span className="text-xs text-[var(--muted)]">@{post.author.username}</span>
              </div>
              <p className="text-[15px] whitespace-pre-wrap">{post.content}</p>
              {post.imageUrl && (
                <img src={post.imageUrl} alt="" className="mt-3 rounded-lg max-h-80 object-cover" />
              )}
              <div className="flex gap-4 mt-3 text-sm text-[var(--muted)]">
                <span>❤️ {post._count.likes}</span>
                <span>💬 {post._count.comments}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
