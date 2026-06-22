'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Pencil, Trash2, Undo2 } from 'lucide-react';
import { useVocab } from '@/context/useVocab';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/EmptyState';
import { EditWordModal } from '@/components/common/EditWordModal';
import type { VocabWord } from '@/types';

function matchesQuery(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

export function LearnedPage() {
  const { learnedWords, markLearning, deleteWord } = useVocab();
  const [query, setQuery] = useState('');
  const [editingWord, setEditingWord] = useState<VocabWord | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return learnedWords;
    return learnedWords.filter((w) => matchesQuery(w.word, query) || matchesQuery(w.meaning, query));
  }, [learnedWords, query]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-paper-100 sm:text-3xl">Đã học</h1>
        <p className="mt-1 font-sans text-sm text-paper-400">
          Bạn đã thuộc tổng cộng <span className="font-semibold text-sage-light">{learnedWords.length}</span> từ.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-card border border-ink-700 bg-ink-800/60 p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage-light">
          <Award className="h-6 w-6" />
        </div>
        <div>
          <p className="font-display text-2xl text-paper-100">{learnedWords.length}</p>
          <p className="font-sans text-xs text-paper-400">từ đã thuộc</p>
        </div>
      </div>

      <SearchBar value={query} onChange={setQuery} placeholder="Tìm trong danh sách đã học..." />

      {filtered.length === 0 ? (
        <EmptyState icon={Award}
          title={query ? 'Không tìm thấy từ phù hợp' : 'Chưa có từ nào được học xong'}
          description={query ? 'Thử một từ khóa khác.' : 'Quay lại tab "Đang học" và đánh dấu "Đã thuộc".'}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((w) => (
            <motion.div key={w.id} layout
              className="flex items-center gap-3 rounded-2xl border border-ink-700 bg-ink-800/60 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base text-paper-100">
                  {w.word} <span className="font-sans text-xs italic text-paper-400">({w.partOfSpeech})</span>
                </p>
                <p className="truncate font-sans text-sm text-paper-400">{w.meaning}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <button onClick={() => setEditingWord(w)}
                  className="rounded-full border border-ink-600 p-2 text-paper-400 transition-colors hover:border-amber/40 hover:text-amber-light"
                  title="Sửa từ">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => deleteWord(w.id)}
                  className="rounded-full border border-ink-600 p-2 text-paper-400 transition-colors hover:border-clay/40 hover:text-clay-light"
                  title="Xoá từ">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => markLearning(w.id)}
                  className="flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/10 px-3 py-1.5 font-sans text-xs font-semibold text-amber-light transition-colors hover:bg-amber/20">
                  <Undo2 className="h-3.5 w-3.5" /> Học lại
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <EditWordModal word={editingWord} onClose={() => setEditingWord(null)} />
    </div>
  );
}
