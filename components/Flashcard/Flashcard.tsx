'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { VocabWord } from '@/types';

interface FlashcardProps {
  word: VocabWord;
  flipped: boolean;
  onFlip: () => void;
}

const PUNCH_HOLE = (
  <span className="absolute left-5 top-5 h-3 w-3 rounded-full bg-ink-950 ring-1 ring-inset ring-ink-600/80" />
);

const FACE_TRANSITION = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

export function Flashcard({ word, flipped, onFlip }: FlashcardProps) {
  return (
    <div className="w-full" style={{ perspective: '1600px' }}>
      <div
        className="relative aspect-[4/5] w-full cursor-pointer select-none sm:aspect-[5/4]"
        onClick={onFlip}
        role="button"
        tabIndex={0}
        aria-label="Nhấn để lật thẻ"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onFlip();
          }
        }}
      >
        {/*
          Each face is mounted/unmounted (never both rotated past 90deg at once),
          so the text can never end up mirrored — there is no backface-visibility
          trick here that depends on two opposing rotateY(180deg) transforms
          cancelling each other out.
        */}
        <AnimatePresence initial={false}>
          {!flipped ? (
            <motion.div
              key="front"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={FACE_TRANSITION}
              className="absolute inset-0 flex flex-col rounded-card border border-ink-600 bg-gradient-to-b from-ink-700 to-ink-800 p-7 shadow-card sm:p-9"
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
            >
              {PUNCH_HOLE}
              <div className="flex items-center justify-between border-b border-dashed border-ink-600 pb-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper-400">
                  Thẻ #{word.stt}
                </span>
                <span className="font-display text-xs italic text-amber-light">
                  {word.partOfSpeech || 'unknown'}
                </span>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="break-words font-display text-4xl font-semibold text-paper-100 sm:text-5xl">
                  {word.word}
                </p>
              </div>

              <p className="text-center font-sans text-xs text-paper-400">Nhấn vào thẻ để xem nghĩa</p>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={FACE_TRANSITION}
              className="absolute inset-0 flex flex-col rounded-card border border-amber/30 bg-gradient-to-b from-ink-700 to-ink-800 p-7 shadow-card sm:p-9"
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
            >
              {PUNCH_HOLE}
              <div className="flex items-center justify-between border-b border-dashed border-ink-600 pb-3">
                <span className="font-mono text-sm text-amber-light">{word.phonetic || '—'}</span>
                <span className="font-display text-xs italic text-amber-light">
                  {word.partOfSpeech || 'unknown'}
                </span>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto py-2 text-center">
                <p className="font-display text-2xl font-medium text-paper-100 sm:text-3xl">
                  {word.meaning || '—'}
                </p>
                {word.example ? (
                  <p className="max-w-sm font-sans text-sm italic text-paper-300">“{word.example}”</p>
                ) : null}
              </div>

              <p className="text-center font-sans text-xs text-paper-400">Nhấn vào thẻ để quay lại</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
