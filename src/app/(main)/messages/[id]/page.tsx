import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import ChatInput from "@/components/ChatInput";
import { ArrowLeft } from "lucide-react";
import RealtimeMessages from "@/components/RealtimeMessages";

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
          sticker: true,
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

  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: user.id },
      isRead: false,
    },
    data: { isRead: true },
  });

  const initialMessages = conversation.messages.map((m) => ({
    id: m.id,
    content: m.content,
    imageUrl: m.imageUrl,
    stickerId: m.stickerId,
    sticker: m.sticker
      ? { id: m.sticker.id, imageUrl: m.sticker.imageUrl, emoji: m.sticker.emoji }
      : null,
    senderId: m.senderId,
    createdAt: m.createdAt.toISOString(),
    sender: m.sender,
  }));

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

        <RealtimeMessages
          conversationId={id}
          currentUserId={user.id}
          initialMessages={initialMessages}
        />

        <ChatInput conversationId={id} userId={user.id} />
      </div>
    </div>
  );
}
