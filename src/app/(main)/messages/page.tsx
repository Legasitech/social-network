import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export default async function MessagesPage() {
  const user = await getSession();
  if (!user) return null;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: user.id }, { user2Id: user.id }],
    },
    orderBy: { lastMessageAt: "desc" },
    include: {
      user1: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          isOnline: true,
        },
      },
      user2: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          isOnline: true,
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { content: true, createdAt: true, senderId: true, isRead: true },
      },
    },
  });

  return (
    <div className="max-w-[720px] mx-auto">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h1 className="text-lg font-semibold">Сообщения</h1>
        </div>

        {conversations.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--card-hover)] flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} className="text-[var(--muted)]" />
            </div>
            <p className="text-[var(--muted)] text-lg mb-1">Нет диалогов</p>
            <p className="text-sm text-[var(--muted-dark)]">
              Начни общение с друзьями
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {conversations.map((conv) => {
              const other = conv.user1Id === user.id ? conv.user2 : conv.user1;
              const lastMsg = conv.messages[0];

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--card-hover)] transition"
                >
                  <div className="relative shrink-0">
                    {other.avatarUrl ? (
                      <img
                        src={other.avatarUrl}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold text-lg">
                        {other.displayName[0]?.toUpperCase()}
                      </div>
                    )}
                    {other.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[var(--success)] border-2 border-[var(--card)] rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold truncate text-[15px]">
                        {other.displayName}
                      </span>
                      {lastMsg && (
                        <span className="text-xs text-[var(--muted-dark)] shrink-0">
                          {formatRelativeTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted)] truncate mt-0.5">
                      {lastMsg
                        ? lastMsg.senderId === user.id
                          ? `Вы: ${lastMsg.content || "Стикер"}`
                          : lastMsg.content || "Стикер"
                        : "Нет сообщений"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
