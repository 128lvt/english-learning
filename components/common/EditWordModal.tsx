'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Save, X } from 'lucide-react';
import { useVocab } from '@/context/useVocab';
import type { VocabWord, NewWordInput } from '@/types';

interface EditWordModalProps {
  word: VocabWord | null;
  onClose: () => void;
}

const PART_OF_SPEECH_OPTIONS = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'phrase'];

const inputClass =
  'w-full rounded-xl border border-ink-600 bg-ink-800 px-4 py-2.5 font-sans text-sm text-paper-100 placeholder:text-paper-400/60 outline-none transition-colors focus:border-amber/60 focus:ring-2 focus:ring-amber/20';

export function EditWordModal({ word, onClose }: EditWordModalProps) {
  const { editWord, isSaving } = useVocab();
  const initialForm = useMemo<NewWordInput>(
    () =>
      word
        ? {
            word: word.word,
            partOfSpeech: word.partOfSpeech,
            phonetic: word.phonetic,
            meaning: word.meaning,
            example: word.example,
          }
        : { word: '', partOfSpeech: '', phonetic: '', meaning: '', example: '' },
    // Re-compute only when the actual word id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [word?.id],
  );

  // Each time word.id changes, React re-mounts the inner form via the key trick (see JSX below)
  const [form, setForm] = useState<NewWordInput>(initialForm);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!word) return;
    await editWord(word.id, form);
    onClose();
  }

  function update<K extends keyof NewWordInput>(key: K, value: NewWordInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <AnimatePresence>
      {word && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-ink-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-card border-t border-ink-700 bg-ink-900 px-5 pb-[env(safe-area-inset-bottom)] pt-5 md:left-auto md:right-6 md:w-[480px] md:rounded-card md:border md:bottom-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg text-paper-100">Sửa từ vựng</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-paper-400 hover:bg-ink-800 hover:text-paper-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* key resets useState(initialForm) whenever the target word changes */}
            <form key={word?.id} onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-sans text-xs font-medium text-paper-300">Từ vựng <span className="text-clay-light">*</span></span>
                <input value={form.word} onChange={(e) => update('word', e.target.value)} className={inputClass} required />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-sans text-xs font-medium text-paper-300">Từ loại</span>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {PART_OF_SPEECH_OPTIONS.map((opt) => (
                    <button type="button" key={opt} onClick={() => update('partOfSpeech', opt)}
                      className={`rounded-full border px-3 py-1 font-sans text-xs transition-colors ${
                        form.partOfSpeech === opt
                          ? 'border-amber bg-amber/15 text-amber-light'
                          : 'border-ink-600 text-paper-400 hover:text-paper-100'
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
                <input value={form.partOfSpeech} onChange={(e) => update('partOfSpeech', e.target.value)}
                  placeholder="noun, verb, adjective..." className={inputClass} />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-sans text-xs font-medium text-paper-300">Phiên âm</span>
                <input value={form.phonetic} onChange={(e) => update('phonetic', e.target.value)}
                  placeholder="/dɪˈskʌvəri/" className={`${inputClass} font-mono`} />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-sans text-xs font-medium text-paper-300">Ý nghĩa <span className="text-clay-light">*</span></span>
                <input value={form.meaning} onChange={(e) => update('meaning', e.target.value)}
                  placeholder="sự khám phá" className={inputClass} required />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-sans text-xs font-medium text-paper-300">Ví dụ minh họa</span>
                <textarea value={form.example} onChange={(e) => update('example', e.target.value)}
                  rows={2} className={`${inputClass} resize-none`} />
              </label>

              <div className="mt-1 flex gap-3">
                <button type="button" onClick={onClose}
                  className="flex-1 rounded-full border border-ink-600 py-2.5 font-sans text-sm text-paper-300 hover:border-paper-400/40 hover:text-paper-100">
                  Huỷ
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber py-2.5 font-sans text-sm font-semibold text-ink-950 shadow-glow disabled:opacity-60">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Lưu
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
