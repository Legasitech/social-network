"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";

interface Props {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    bio?: string | null;
    city?: string | null;
    status?: string | null;
  };
}

export default function SettingsForm({ user }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: user.displayName || "",
    bio: user.bio || "",
    city: user.city || "",
    status: user.status || "",
    avatarUrl: user.avatarUrl || "",
    coverUrl: user.coverUrl || "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File, type: "avatar" | "cover") {
    setUploading(type);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка загрузки");
        return;
      }
      if (type === "avatar") {
        setForm((f) => ({ ...f, avatarUrl: data.url }));
      } else {
        setForm((f) => ({ ...f, coverUrl: data.url }));
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setUploading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/profile/${user.username}`}
          className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Настройки профиля</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">Имя (ник)</label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">Статус</label>
          <input
            type="text"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            placeholder="Что у вас на уме?"
            maxLength={100}
            className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">О себе</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">Город</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">Аватар</label>
          <div className="flex items-center gap-4">
            {form.avatarUrl ? (
              <img src={form.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xl font-bold">
                {form.displayName[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f, "avatar");
                }}
              />
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                disabled={uploading === "avatar"}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)] transition"
              >
                <Upload size={16} />
                {uploading === "avatar" ? "Загрузка..." : "Загрузить"}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">Обложка</label>
          {form.coverUrl && (
            <img src={form.coverUrl} alt="" className="w-full h-28 object-cover rounded-lg mb-2" />
          )}
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f, "cover");
            }}
          />
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            disabled={uploading === "cover"}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)] transition"
          >
            <Upload size={16} />
            {uploading === "cover" ? "Загрузка..." : "Загрузить обложку"}
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">Сохранено!</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Сохраняем..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
