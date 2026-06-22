'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Flame, LogOut } from 'lucide-react';

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Load streak once on mount
  useEffect(() => {
    fetch('/api/streak', { method: 'POST' })
      .then((r) => r.json())
      .then((data: { streakDays?: number }) => {
        if (typeof data.streakDays === 'number') setStreak(data.streakDays);
      })
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-amber/20 font-sans text-sm font-bold text-amber-light ring-2 ring-transparent transition hover:ring-amber/40"
        aria-label="Menu tài khoản"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 min-w-[200px] rounded-2xl border border-ink-700 bg-ink-800 py-2 shadow-card">
          <div className="border-b border-ink-700 px-4 py-3">
            <p className="font-sans text-sm font-semibold text-paper-100 truncate">
              {session?.user?.name ?? 'Người dùng'}
            </p>
            <p className="font-sans text-xs text-paper-400 truncate">{session?.user?.email}</p>
          </div>

          {streak !== null && (
            <div className="flex items-center gap-2 px-4 py-2.5 font-sans text-sm">
              <Flame className={`h-4 w-4 ${streak > 0 ? 'text-amber-light' : 'text-paper-400'}`} />
              <span className={streak > 0 ? 'text-paper-100' : 'text-paper-400'}>
                {streak > 0 ? `${streak} ngày liên tiếp 🔥` : 'Chưa có streak'}
              </span>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 font-sans text-sm text-clay-light transition-colors hover:bg-ink-700"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
