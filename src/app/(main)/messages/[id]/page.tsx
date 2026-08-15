import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import ChatInput from "@/components/ChatInput";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect("/login");

  const conversation = await prisma.conversation.findUnique({
    where: { id },
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
        orderBy: { createdAt: "asc" },
        take: 100,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!conversation) notFound();
  if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) {
    notFound();
  }

  const other =
    conversation.user1Id === user.id ? conversation.user2 : conversation.user1;

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: user.id },
      isRead: false,
    },
    data: { isRead: true },
  });

  return (
    <div className="max-w-[720px] mx-auto h-[calc(100vh-7rem)] flex flex-col">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-3 shrink-0">
          <Link
            href="/messages"
            className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--card-hover)] transition lg:hidden"
          >
            <ArrowLeft size={20} />
          </Link>
          <Link href={`/profile/${other.username}`} className="relative shrink-0">
            {other.avatarUrl ? (
              <img
                src={other.avatarUrl}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold">
                {other.displayName[0]?.toUpperCase()}
              </div>
            )}
            {other.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--success)] border-2 border-[var(--card)] rounded-full" />
            )}
          </Link>
          <div className="min-w-0">
            <Link
              href={`/profile/${other.username}`}
              className="font-semibold hover:underline truncate block"
            >
              {other.displayName}
            </Link>
            <p className="text-xs text-[var(--muted)]">
              {other.isOnline ? "онлайн" : "был(а) недавно"}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {conversation.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[var(--muted)] text-sm">
              Начните переписку
            </div>
          ) : (
            conversation.messages.map((msg) => {
              const isMine = msg.senderId === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMine
                        ? "bg-[var(--primary)] text-white rounded-br-md"
                        : "bg-[var(--card-hover)] text-[var(--foreground)] rounded-bl-md"
                    }`}
                  >
                    <p className="text-[15px] whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <p
                      className={`text-[11px] mt-1 ${
                        isMine ? "text-white/60" : "text-[var(--muted-dark)]"
                      }`}
                    >
                      {formatRelativeTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <ChatInput conversationId={id} />
      </div>
    </div>
  );
}
