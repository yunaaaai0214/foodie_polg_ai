"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { mockUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/today", label: "今日打卡" },
  { href: "/calendar", label: "日历" },
  { href: "/history/2026-05-12", label: "打卡记录" },
  { href: "/settings", label: "设置" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isTodayPage = pathname === "/today";
  const hideCalendarInHeader = pathname.startsWith("/history") || pathname.startsWith("/settings");
  const visibleNavItems = hideCalendarInHeader
    ? navItems.filter((item) => item.href !== "/calendar")
    : navItems;

  return (
    <div className="min-h-screen pb-28">
      {!isTodayPage ? (
        <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(255,248,238,0.9)] backdrop-blur-md">
          <div className="container flex h-16 items-center justify-between gap-4">
            <Link href="/today" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-xs font-extrabold text-[var(--primary)]">FP</div>
              <div>
                <p className="text-sm text-[var(--ink-subtle)]" translate="no">Foodie Plog</p>
                <p className="text-base font-bold text-[var(--olive)]">AI Studio</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <nav className={cn("hidden items-center gap-2 md:flex", isTodayPage && "md:hidden")}>
                {visibleNavItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8f76] focus-visible:ring-offset-2",
                        active
                          ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/25"
                          : "bg-white/70 text-[var(--ink-subtle)] hover:bg-white"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-white/85 p-1.5 pr-3">
                <img
                  src={mockUser.avatar}
                  alt={mockUser.nickname}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="leading-tight">
                  <p className="text-xs text-[var(--ink-subtle)]">Hi, {mockUser.nickname}</p>
                  <p className="text-xs font-semibold text-[var(--olive)]">连续 {mockUser.streakDays} 天</p>
                </div>
              </div>
            </div>
          </div>
        </header>
      ) : null}

      <main className={isTodayPage ? "" : "container py-6"}>{children}</main>

      <Link
        href="/today"
        className="fixed bottom-6 right-6 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-xl shadow-[var(--primary)]/35 md:hidden"
      >
        + 新建打卡
      </Link>
    </div>
  );
}
