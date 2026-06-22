'use client';

import { Cloud, Loader2 } from 'lucide-react';
import { useVocab } from '@/context/useVocab';

export function SyncIndicator() {
  const { isSaving } = useVocab();

  return (
    <span
      className="flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-800 px-2.5 py-1 font-mono text-[11px] text-paper-400"
      title={isSaving ? 'Đang lưu vào database...' : 'Đã đồng bộ với database'}
    >
      {isSaving ? <Loader2 className="h-3 w-3 animate-spin text-amber-light" /> : <Cloud className="h-3 w-3 text-sage-light" />}
      {isSaving ? 'Đang lưu...' : 'Đã đồng bộ'}
    </span>
  );
}
