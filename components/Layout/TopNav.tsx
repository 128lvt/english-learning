'use client';

import { useVocab } from '@/context/useVocab';
import { NAV_ITEMS } from './navConfig';
import { SyncIndicator } from './SyncIndicator';
import type { ViewKey } from '@/types';

interface TopNavProps {
  active: ViewKey;
  onNavigate: (key: ViewKey) => void;
}

export function TopNav({ active, onNavigate }: TopNavProps) {
  const { stats } = useVocab();

  return (
    <header className="sticky top-0 z-30 hidden border-b border-ink-700 bg-ink-900/90 backdrop-blur md:block">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber/15 font-display text-base text-amber-light">
            V
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg text-paper-100">VocaNight</p>
            <p className="-mt-0.5 font-sans text-[11px] uppercase tracking-wide text-paper-400">
              Học từ vựng mỗi đêm
            </p>
          </div>
          <SyncIndicator />
        </div>

        <nav className="flex items-center gap-1 rounded-full border border-ink-700 bg-ink-800/60 p-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === active;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`flex items-center gap-2 rounded-full px-3.5 py-2 font-sans text-sm transition-colors ${
                  isActive ? 'bg-amber text-ink-950 shadow-glow' : 'text-paper-300 hover:bg-ink-700 hover:text-paper-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.key === 'learning' && stats.learning > 0 ? (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                      isActive ? 'bg-ink-950/20' : 'bg-ink-700 text-paper-300'
                    }`}
                  >
                    {stats.learning}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
