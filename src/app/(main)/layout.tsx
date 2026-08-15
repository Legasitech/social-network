import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import {
  Home,
  MessageCircle,
  User,
  LogOut,
  Users,
  Search,
  Settings,
  Newspaper,
  Bell,
} from "lucide-react";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  const navItems = [
    { href: "/feed", label: "Лента", icon: Newspaper },
    { href: "/messages", label: "Сообщения", icon: MessageCircle },
    { href: "/friends", label: "Друзья", icon: Users },
    { href: "/groups", label: "Группы", icon: Users },
    { href: `/profile/${user.username}`, label: "Профиль", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Left Sidebar - VK style */}
      <aside className="w-[220px] shrink-0 border-r border-[var(--border)] bg-[var(--sidebar)] sticky top-0 h-screen flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-[var(--border)]">
          <Link href="/feed" className="text-xl font-bold text-[var(--primary)] tracking-tight">
            Social
          </Link>
        </div>

        {/* User mini card */}
        <Link
          href={`/profile/${user.username}`}
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--card-hover)] transition border-b border-[var(--border)]"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-semibold">
              {user.displayName[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{user.displayName}</div>
            <div className="text-xs text-[var(--muted)] truncate">@{user.username}</div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--foreground)] hover:bg-[var(--card-hover)] transition group"
              >
                <Icon
                  size={20}
                  className="text-[var(--muted)] group-hover:text-[var(--primary)] transition shrink-0"
                />
                <span className="text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 border-t border-[var(--border)] space-y-0.5">
          <Link href="/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] transition">
            <Settings size={20} />
            <span className="text-[15px]">Настройки</span>
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-red-400 transition"
            >
              <LogOut size={20} />
              <span className="text-[15px]">Выйти</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 sticky top-0 z-40 bg-[var(--header)] border-b border-[var(--border)] flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-dark)]"
              />
              <input
                type="text"
                placeholder="Поиск"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-9 pr-4 py-1.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-dark)] focus:outline-none focus:border-[var(--primary)] transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] transition relative">
              <Bell size={20} />
            </button>
            <Link
              href={`/profile/${user.username}`}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-[var(--card-hover)] transition"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-semibold">
                  {user.displayName[0]?.toUpperCase()}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
