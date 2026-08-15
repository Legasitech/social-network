"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { connectSocket } from "@/lib/socket";
import { formatRelativeTime } from "@/lib/utils";

export interface ChatMsg {
  id: string;
  content?: string | null;
  imageUrl?: string | null;
  senderId: string;
  createdAt: string;
  pending?: boolean;
}

interface Props {
  conversationId: string;
  currentUserId: string;
  initialMessages: ChatMsg[];
  otherName: string;
}

export default function RealtimeMessages({
  conversationId,
  currentUserId,
  initialMessages,
  otherName,
}: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typing]);

  const addMessage = useCallback((msg: ChatMsg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      // replace optimistic pending with same content/image
      const filtered = prev.filter((m) => {
        if (!m.pending) return true;
        if (msg.imageUrl && m.imageUrl === msg.imageUrl) return false;
        if (msg.content && m.content === msg.content) return false;
        return true;
      });
      return [...filtered, { ...msg, pending: false }];
    });
  }, []);

  useEffect(() => {
    const s = connectSocket(currentUserId);
    s.emit("join:conversation", conversationId);

    const onNew = (msg: any) => {
      if (msg.conversationId && msg.conversationId !== conversationId) return;
      addMessage({
        id: msg.id,
        content: msg.content,
        imageUrl: msg.imageUrl,
        senderId: msg.senderId,
        createdAt: msg.createdAt || new Date().toISOString(),
      });
    };

    const onTypingStart = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId && data.userId !== currentUserId) {
        setTyping(true);
      }
    };
    const onTypingStop = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId && data.userId !== currentUserId) {
        setTyping(false);
      }
    };

    s.on("message:new", onNew);
    s.on("typing:start", onTypingStart);
    s.on("typing:stop", onTypingStop);

    const onLocal = (e: Event) => {
      const detail = (e as CustomEvent).detail as ChatMsg;
      if (detail) addMessage(detail);
    };
    window.addEventListener("chat:local-message", onLocal);

    return () => {
      s.emit("leave:conversation", conversationId);
      s.off("message:new", onNew);
      s.off("typing:start", onTypingStart);
      s.off("typing:stop", onTypingStop);
      window.removeEventListener("chat:local-message", onLocal);
    };
  }, [conversationId, currentUserId, addMessage]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-[var(--muted)] text-sm">
          Начните переписку с {otherName}
        </div>
      ) : (
        messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          // sticker = image without text (or image alone)
          const isStickerOnly = msg.imageUrl && !msg.content;

          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] ${
                  isStickerOnly
                    ? "px-0.5 py-0.5"
                    : isMine
                    ? "bg-[var(--primary)] text-white rounded-2xl rounded-br-sm px-3 py-1.5"
                    : "bg-[var(--card-hover)] text-[var(--foreground)] rounded-2xl rounded-bl-sm px-3 py-1.5"
                } ${msg.pending ? "opacity-50" : ""}`}
              >
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt=""
                    className={
                      isStickerOnly
                        ? "w-28 h-28 object-contain"
                        : "max-w-full rounded-lg max-h-52 object-cover mb-1"
                    }
                    loading="lazy"
                  />
                )}
                {msg.content && (
                  <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                )}
                <p
                  className={`text-[10px] mt-0.5 ${
                    isMine && !isStickerOnly
                      ? "text-white/50 text-right"
                      : "text-[var(--muted-dark)]"
                  }`}
                >
                  {formatRelativeTime(msg.createdAt)}
                  {msg.pending ? " · …" : ""}
                </p>
              </div>
            </div>
          );
        })
      )}
      {typing && (
        <div className="text-xs text-[var(--muted)] px-1">печатает...</div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
