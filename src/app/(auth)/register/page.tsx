"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    displayName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка регистрации");
        return;
      }

      router.push("/feed");
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--primary)]">Social</h1>
          <p className="text-[var(--muted)] mt-1">Создание аккаунта</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">
              Имя (ник)
            </label>
            <input
              type="text"
              required
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-dark)] focus:outline-none focus:border-[var(--primary)] transition"
              placeholder="Как тебя зовут?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">
              Юзернейм
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-dark)]">
                @
              </span>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value.toLowerCase() })
                }
                className="w-full pl-8 pr-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-dark)] focus:outline-none focus:border-[var(--primary)] transition"
                placeholder="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">
              Пароль
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-dark)] focus:outline-none focus:border-[var(--primary)] transition"
              placeholder="Минимум 6 символов"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Создаём..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted)] mt-6">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
