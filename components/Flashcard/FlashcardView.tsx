'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Shuffle, X } from 'lucide-react';
import { Flashcard } from './Flashcard';
import { useVocab } from '@/context/useVocab';
import type { VocabWord } from '@/types';

interface FlashcardViewProps {
  words: VocabWord[];
  onMarkLearned: (id: string) => void;
  onKeepLearning: (id: string) => void;
}

export function FlashcardView({ words, onMarkLearned, onKeepLearning }: FlashcardViewProps) {
  const { shuffleMode, toggleShuffle, sessionCount, incrementSession } = useVocab();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const safeIndex = words.length === 0 ? 0 : Math.min(index, words.length - 1);
  const current = words[safeIndex];

  const goTo = (nextIndex: number) => {
    if (words.length === 0) return;
    const wrapped = (nextIndex + words.length) % words.length;
    setIndex(wrapped);
    setFlipped(false);
    incrementSession();
  };

  const handleUnknown = () => {
    if (!current) return;
    onKeepLearning(current.id);
    goTo(safeIndex + 1);
  };

  const handleKnown = () => {
    if (!current) return;
    onMarkLearned(current.id);
    const newLength = words.length - 1;
    setIndex((prev) => (newLength <= 0 ? 0 : Math.min(prev, newLength - 1)));
    setFlipped(false);
    incrementSession();
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!current) return;
      if (e.key === 'ArrowRight') goTo(safeIndex + 1);
      else if (e.key === 'ArrowLeft') goTo(safeIndex - 1);
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped((f) => !f); }
      else if (e.key === '1') handleUnknown();
      else if (e.key === '2') handleKnown();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, words.length, current]);

  if (!current) return null;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Toolbar */}
      <div className="flex w-full max-w-md items-center justify-between">
        <span className="font-sans text-sm text-paper-400">
          Thẻ <span className="text-paper-100">{safeIndex + 1}</span> / {words.length}
          {sessionCount > 0 && (
            <span className="ml-3 font-mono text-xs text-paper-400">
              phiên: <span className="text-amber-light">{sessionCount}</span>
            </span>
          )}
        </span>

        <button
          onClick={toggleShuffle}
          title="Xáo trộn ngẫu nhiên"
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-xs font-semibold transition-colors ${
            shuffleMode
              ? 'border-amber/60 bg-amber/15 text-amber-light'
              : 'border-ink-600 text-paper-400 hover:border-paper-400/40 hover:text-paper-100'
          }`}
        >
          <Shuffle className="h-3.5 w-3.5" />
          {shuffleMode ? 'Ngẫu nhiên' : 'Theo thứ tự'}
        </button>
      </div>

      <div className="w-full max-w-md">
        <Flashcard word={current} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
      </div>

      <div className="flex w-full max-w-md items-center justify-center gap-3">
        <button
          onClick={() => goTo(safeIndex - 1)}
          aria-label="Thẻ trước"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-ink-600 bg-ink-800 text-paper-300 transition-colors hover:border-paper-400/40 hover:text-paper-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <motion.button whileTap={{ scale: 0.96 }} onClick={handleUnknown}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-clay/40 bg-clay/10 px-4 py-3 font-sans text-sm font-semibold text-clay-light transition-colors hover:bg-clay/20">
          <X className="h-4 w-4" /> Chưa nhớ
        </motion.button>

        <motion.button whileTap={{ scale: 0.96 }} onClick={handleKnown}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-sage/40 bg-sage/10 px-4 py-3 font-sans text-sm font-semibold text-sage-light transition-colors hover:bg-sage/20">
          <Check className="h-4 w-4" /> Đã thuộc
        </motion.button>

        <button
          onClick={() => goTo(safeIndex + 1)}
          aria-label="Thẻ tiếp theo"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-ink-600 bg-ink-800 text-paper-300 transition-colors hover:border-paper-400/40 hover:text-paper-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <p className="font-mono text-xs text-paper-400/70">Space: lật · ←/→: chuyển · 1: chưa nhớ · 2: đã thuộc</p>
    </div>
  );
}
