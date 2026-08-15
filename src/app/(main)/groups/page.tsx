"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  avatarUrl?: string | null;
  isPrivate: boolean;
  owner: { username: string; displayName: string };
  _count: { members: number; posts: number };
}

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((d) => setGroups(d.groups || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка");
        return;
      }
      setShowCreate(false);
      setForm({ name: "", slug: "", description: "" });
      router.push(`/groups/${data.group.slug}`);
    } catch {
      setError("Ошибка сети");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Группы / Сообщества</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-hover)] transition"
        >
          {showCreate ? "Отмена" : "Создать группу"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-6 space-y-3">
          <input
            required
            placeholder="Название группы"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)]"
          />
          <input
            required
            placeholder="slug (латиница)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
            className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)]"
          />
          <textarea
            placeholder="Описание"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] resize-none"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={creating}
            className="w-full py-2.5 bg-[var(--primary)] text-white rounded-xl font-medium disabled:opacity-50"
          >
            {creating ? "Создаём..." : "Создать"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-[var(--muted)]">Загрузка...</p>
      ) : groups.length === 0 ? (
        <p className="text-[var(--muted)] text-center py-10">Пока нет групп. Создай первую!</p>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.slug}`}
              className="block bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:bg-[var(--card-hover)] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg">
                  {g.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{g.name}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {g._count.members} участников · {g._count.posts} постов
                  </div>
                </div>
              </div>
              {g.description && (
                <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">{g.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
