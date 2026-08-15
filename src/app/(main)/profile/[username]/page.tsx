import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { MapPin, Calendar, FileText, MessageCircle } from "lucide-react";
import ProfileActions from "@/components/ProfileActions";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const currentUser = await getSession();

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      coverUrl: true,
      city: true,
      isOnline: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  if (!user) notFound();

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      _count: { select: { likes: true, comments: true } },
    },
  });

  const isOwn = currentUser?.id === user.id;

  return (
    <div className="max-w-[860px] mx-auto space-y-4">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="h-44 bg-gradient-to-br from-[#1a3a5c] via-[#2688eb] to-[#1a6dcc] relative">
          {user.coverUrl && (
            <img src={user.coverUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="px-6 pb-5">
          <div className="flex items-end gap-5 -mt-14">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="w-[120px] h-[120px] rounded-full border-[4px] border-[var(--card)] object-cover shadow-lg"
                />
              ) : (
                <div className="w-[120px] h-[120px] rounded-full border-[4px] border-[var(--card)] bg-[var(--primary)] text-white flex items-center justify-center text-4xl font-bold shadow-lg">
                  {user.displayName[0]?.toUpperCase()}
                </div>
              )}
              {user.isOnline && (
                <span className="absolute bottom-2 right-2 w-4 h-4 bg-[var(--success)] border-[3px] border-[var(--card)] rounded-full" />
              )}
            </div>

            <div className="flex-1 pt-16 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight">{user.displayName}</h1>
                  {user.isOnline && (
                    <span className="text-xs font-medium text-[var(--success)] bg-green-500/10 px-2 py-0.5 rounded-md">
                      онлайн
                    </span>
                  )}
                </div>
                <p className="text-[var(--muted)] text-[15px] mt-0.5">@{user.username}</p>
              </div>

              {!isOwn && currentUser && (
                <ProfileActions userId={user.id} username={user.username} />
              )}
            </div>
          </div>

          {user.bio && (
            <p className="mt-4 text-[15px] text-[var(--foreground)] leading-relaxed">{user.bio}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
            {user.city && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--muted-dark)]" />
                {user.city}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <FileText size={14} className="text-[var(--muted-dark)]" />
              {user._count.posts} {user._count.posts === 1 ? "пост" : "постов"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[var(--muted-dark)]" />
              с{" "}
              {new Date(user.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold px-1">Стена</h2>

        {posts.length === 0 ? (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-12 text-center">
            <p className="text-[var(--muted)]">Пока нет записей</p>
            {isOwn && (
              <p className="text-sm text-[var(--muted-dark)] mt-1">
                Напиши первый пост в ленте
              </p>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5"
            >
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{post.content}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-[var(--muted)]">
                <span>{formatRelativeTime(post.createdAt)}</span>
                <span className="flex items-center gap-1">♥ {post._count.likes}</span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={14} /> {post._count.comments}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
