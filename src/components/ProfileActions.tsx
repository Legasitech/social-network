"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, UserPlus, Check } from "lucide-react";

interface Props {
  userId: string;
  username: string;
}

export default function ProfileActions({ userId, username }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [friendSent, setFriendSent] = useState(false);

  async function startChat() {
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: userId, content: "Привет!" }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/messages/${data.conversationId}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function addFriend() {
    setLoading(true);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "request" }),
      });
      if (res.ok) {
        setFriendSent(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2 pt-1">
      <button
        onClick={startChat}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
      >
        <MessageCircle size={16} />
        Написать
      </button>
      <button
        onClick={addFriend}
        disabled={loading || friendSent}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--card-hover)] hover:bg-[var(--border)] text-[var(--foreground)] text-sm font-medium rounded-lg border border-[var(--border)] transition disabled:opacity-50"
      >
        {friendSent ? (
          <>
            <Check size={16} />
            Заявка отправлена
          </>
        ) : (
          <>
            <UserPlus size={16} />
            В друзья
          </>
        )}
      </button>
    </div>
  );
}
