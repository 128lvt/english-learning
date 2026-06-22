'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Flashcard } from './Flashcard';
import type { VocabWord } from '@/types';

interface FlashcardViewProps {
  words: VocabWord[];
  onMarkLearned: (id: string) => void;
  onKeepLearning: (id: string) => void;
}

export function FlashcardView({ words, onMarkLearned, onKeepLearning }: FlashcardViewProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // The deck can shrink the instant a card is marked "đã thuộc". Rather than
  // chasing that with an effect, clamp at render time so it's always in sync.
  const safeIndex = words.length === 0 ? 0 : Math.min(index, words.length - 1);
  const current = words[safeIndex];

  const goTo = (nextIndex: number) => {
    if (words.length === 0) return;
    const wrapped = (nextIndex + words.length) % words.length;
    setIndex(wrapped);
    setFlipped(false);
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
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!current) return;
      if (e.key === 'ArrowRight') goTo(safeIndex + 1);
      else if (e.key === 'ArrowLeft') goTo(safeIndex - 1);
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === '1') handleUnknown();
      else if (e.key === '2') handleKnown();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, words.length, current]);

  if (!current) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full max-w-md items-center justify-between font-sans text-sm text-paper-400">
        <span>
          Thẻ <span className="text-paper-100">{safeIndex + 1}</span> / {words.length}
        </span>
        <span className="font-mono text-xs text-paper-400">Space: lật · ←/→: chuyển thẻ</span>
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

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleUnknown}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-clay/40 bg-clay/10 px-4 py-3 font-sans text-sm font-semibold text-clay-light transition-colors hover:bg-clay/20"
        >
          <X className="h-4 w-4" /> Chưa nhớ
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleKnown}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-sage/40 bg-sage/10 px-4 py-3 font-sans text-sm font-semibold text-sage-light transition-colors hover:bg-sage/20"
        >
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
    </div>
  );
}
