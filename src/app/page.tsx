import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function HomePage() {
  const user = await getSession();
  if (user) {
    redirect("/feed");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-[var(--primary)] mb-3">
            Social
          </h1>
          <p className="text-lg text-[var(--muted)]">
            Твоя новая социальная сеть
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/register"
            className="block w-full py-3.5 px-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold rounded-xl transition shadow-lg shadow-blue-500/20"
          >
            Создать аккаунт
          </Link>
          <Link
            href="/login"
            className="block w-full py-3.5 px-6 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-xl hover:bg-[var(--card-hover)] transition"
          >
            Войти
          </Link>
        </div>

        <p className="text-sm text-[var(--muted-dark)]">
          Стена · Чаты · Стикеры · Друзья
        </p>
      </div>
    </div>
  );
}
