'use client';

import { useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, ServerCrash } from 'lucide-react';
import { useVocab } from '@/context/useVocab';
import { AppShell } from '@/components/Layout/AppShell';
import { ToastStack } from '@/components/common/ToastStack';
import { LearningPage } from '@/components/Learning/LearningPage';
import { LearnedPage } from '@/components/Learned/LearnedPage';
import { AddWordPage } from '@/components/AddWord/AddWordPage';
import { ImportPage } from '@/components/Import/ImportPage';
import { StatsPage } from '@/components/Stats/StatsPage';
import type { ViewKey } from '@/types';

const PAGES: Record<ViewKey, ComponentType> = {
  learning: LearningPage,
  learned: LearnedPage,
  add: AddWordPage,
  import: ImportPage,
  stats: StatsPage,
};

export function App() {
  const { isLoading, loadError } = useVocab();
  const [view, setView] = useState<ViewKey>('learning');

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ink-900 text-paper-100">
        <Loader2 className="h-6 w-6 animate-spin text-amber-light" />
        <p className="font-sans text-sm text-paper-400">Đang tải dữ liệu từ database...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-900 px-6 text-center text-paper-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-clay/15 text-clay-light">
          <ServerCrash className="h-6 w-6" />
        </div>
        <p className="font-display text-xl">Không thể kết nối database</p>
        <p className="max-w-md font-sans text-sm text-paper-400">{loadError}</p>
        <p className="max-w-md font-sans text-xs text-paper-400">
          Kiểm tra biến môi trường <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono">DATABASE_URL</code> đã
          được cấu hình đúng cho project (xem README.md).
        </p>
      </div>
    );
  }

  const ActivePage = PAGES[view];

  return (
    <AppShell active={view} onNavigate={setView}>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <ActivePage />
        </motion.div>
      </AnimatePresence>
      <ToastStack />
    </AppShell>
  );
}
