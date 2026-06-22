import type { ReactNode } from 'react';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { SyncIndicator } from './SyncIndicator';
import type { ViewKey } from '@/types';

interface AppShellProps {
  active: ViewKey;
  onNavigate: (key: ViewKey) => void;
  children: ReactNode;
}

export function AppShell({ active, onNavigate, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-ink-900 text-paper-100">
      <TopNav active={active} onNavigate={onNavigate} />

      {/* mobile-only brand header */}
      <header className="flex items-center justify-between gap-2.5 px-5 pt-5 md:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber/15 font-display text-sm text-amber-light">
            V
          </span>
          <div className="leading-tight">
            <p className="font-display text-base text-paper-100">VocaNight</p>
            <p className="-mt-0.5 font-sans text-[10px] uppercase tracking-wide text-paper-400">
              Học từ vựng mỗi đêm
            </p>
          </div>
        </div>
        <SyncIndicator />
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-28 pt-6 md:pb-16 md:pt-10">{children}</main>

      <BottomNav active={active} onNavigate={onNavigate} />
    </div>
  );
}
