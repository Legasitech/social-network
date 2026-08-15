"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Search, UserPlus, Check, X, MessageCircle } from "lucide-react";

interface UserItem {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  city?: string | null;
  isOnline?: boolean;
}

export default function FriendsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserItem[]>([]);
  const [friends, setFriends] = useState<UserItem[]>([]);
  const [incoming, setIncoming] = useState<UserItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  async function loadFriends() {
    try {
      const res = await fetch("/api/friends");
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
        setIncoming(data.incoming || []);
      }
    } finally {
      setLoadingFriends(false);
    }
  }

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.users || []);
        }
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  async function handleAction(userId: string, action: string) {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) {
        loadFriends();
        // Refresh search results state visually
        setResults((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch {}
  }

  async function startChat(userId: string) {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: userId, content: "Привет!" }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = `/messages/${data.conversationId}`;
      }
    } catch {}
  }

  function UserCard({
    u,
    actions,
  }: {
    u: UserItem;
    actions?: React.ReactNode;
  }) {
    return (
      <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--card-hover)] transition">
        <Link href={`/profile/${u.username}`} className="relative shrink-0">
          {u.avatarUrl ? (
            <img src={u.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold">
              {u.displayName[0]?.toUpperCase()}
            </div>
          )}
          {u.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--success)] border-2 border-[var(--card)] rounded-full" />
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${u.username}`} className="font-semibold text-[15px] hover:underline truncate block">
            {u.displayName}
          </Link>
          <p className="text-sm text-[var(--muted)] truncate">@{u.username}</p>
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto space-y-4">
      {/* Search */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-dark)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти людей по имени или @username"
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-dark)] focus:outline-none focus:border-[var(--primary)] transition"
          />
        </div>

        {query.trim() && (
          <div className="mt-3 border-t border-[var(--border)] -mx-4">
            {searching ? (
              <p className="px-5 py-4 text-sm text-[var(--muted)]">Ищем...</p>
            ) : results.length === 0 ? (
              <p className="px-5 py-4 text-sm text-[var(--muted)]">Никого не найдено</p>
            ) : (
              results.map((u) => (
                <UserCard
                  key={u.id}
                  u={u}
                  actions={
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleAction(u.id, "request")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm rounded-lg transition"
                      >
                        <UserPlus size={14} />
                        В друзья
                      </button>
                      <button
                        onClick={() => startChat(u.id)}
                        className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] transition"
                        title="Написать"
                      >
                        <MessageCircle size={18} />
                      </button>
                    </div>
                  }
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)]">
            <h2 className="font-semibold">Заявки в друзья</h2>
          </div>
          {incoming.map((u) => (
            <UserCard
              key={u.id}
              u={u}
              actions={
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleAction(u.id, "accept")}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--success)]/20 text-[var(--success)] text-sm rounded-lg hover:bg-[var(--success)]/30 transition"
                  >
                    <Check size={14} />
                    Принять
                  </button>
                  <button
                    onClick={() => handleAction(u.id, "reject")}
                    className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-red-500/10 hover:text-red-400 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Friends list */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)]">
          <h2 className="font-semibold">Друзья {friends.length > 0 && `(${friends.length})`}</h2>
        </div>

        {loadingFriends ? (
          <p className="px-5 py-8 text-center text-[var(--muted)]">Загрузка...</p>
        ) : friends.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--card-hover)] flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-[var(--muted)]" />
            </div>
            <p className="text-[var(--muted)] text-lg mb-1">Пока нет друзей</p>
            <p className="text-sm text-[var(--muted-dark)]">
              Найди людей через поиск выше
            </p>
          </div>
        ) : (
          friends.map((u) => (
            <UserCard
              key={u.id}
              u={u}
              actions={
                <button
                  onClick={() => startChat(u.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--card-hover)] hover:bg-[var(--border)] text-sm rounded-lg transition"
                >
                  <MessageCircle size={14} />
                  Написать
                </button>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
