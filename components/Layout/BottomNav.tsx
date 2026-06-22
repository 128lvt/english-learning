'use client';

import { useVocab } from '@/context/useVocab';
import { NAV_ITEMS } from './navConfig';
import type { ViewKey } from '@/types';

interface BottomNavProps {
  active: ViewKey;
  onNavigate: (key: ViewKey) => void;
}

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  const { stats } = useVocab();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-700 bg-ink-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className="relative flex flex-col items-center gap-1 py-2.5 font-sans text-[11px] transition-colors"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  isActive ? 'bg-amber text-ink-950' : 'text-paper-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className={isActive ? 'text-paper-100' : 'text-paper-400'}>{item.shortLabel}</span>
              {item.key === 'learning' && stats.learning > 0 ? (
                <span className="absolute right-[22%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-semibold text-paper-100">
                  {stats.learning}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
