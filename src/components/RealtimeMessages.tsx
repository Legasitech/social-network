"use client";

import { useState, useEffect, useRef } from "react";
import { formatRelativeTime } from "@/lib/utils";
import { connectSocket } from "@/lib/socket";

interface Msg {
  id: string;
  content?: string | null;
  imageUrl?: string | null;
  stickerId?: string | null;
  sticker?: { id: string; imageUrl: string; emoji?: string | null } | null;
  senderId: string;
  createdAt: string;
  sender?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

interface Props {
  conversationId: string;
  currentUserId: string;
  initialMessages: Msg[];
}

export default function RealtimeMessages({
  conversationId,
  currentUserId,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    const s = connectSocket(currentUserId);
    s.emit("join:conversation", conversationId);

    const onNew = (msg: Msg & { conversationId?: string }) => {
      if (msg.conversationId && msg.conversationId !== conversationId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const onTypingStart = (data: { conversationId: string; userId: string }) => {
      if (
        data.conversationId === conversationId &&
        data.userId !== currentUserId
      ) {
        setTyping(true);
      }
    };
    const onTypingStop = (data: { conversationId: string; userId: string }) => {
      if (
        data.conversationId === conversationId &&
        data.userId !== currentUserId
      ) {
        setTyping(false);
      }
    };

    s.on("message:new", onNew);
    s.on("typing:start", onTypingStart);
    s.on("typing:stop", onTypingStop);

    return () => {
      s.emit("leave:conversation", conversationId);
      s.off("message:new", onNew);
      s.off("typing:start", onTypingStart);
      s.off("typing:stop", onTypingStop);
    };
  }, [conversationId, currentUserId]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-[var(--muted)] text-sm">
          Начните переписку
        </div>
      ) : (
        messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
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
                {msg.sticker && (
                  <img
                    src={msg.sticker.imageUrl}
                    alt={msg.sticker.emoji || "sticker"}
                    className="w-28 h-28 object-contain"
                  />
                )}
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt=""
                    className="max-w-full rounded-lg max-h-60 object-cover mb-1"
                  />
                )}
                {msg.content && (
                  <p className="text-[15px] whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                )}
                <p
                  className={`text-[11px] mt-1 ${
                    isMine ? "text-white/60" : "text-[var(--muted-dark)]"
                  }`}
                >
                  {formatRelativeTime(new Date(msg.createdAt))}
                </p>
              </div>
            </div>
          );
        })
      )}
      {typing && (
        <div className="text-xs text-[var(--muted)] px-2">печатает...</div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
