'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check, Pencil, Trash2 } from 'lucide-react';
import { useVocab } from '@/context/useVocab';
import { FlashcardView } from '@/components/Flashcard/FlashcardView';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/EmptyState';
import { EditWordModal } from '@/components/common/EditWordModal';
import type { VocabWord } from '@/types';

function matchesQuery(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

export function LearningPage() {
  const { displayWords, learningWords, markLearned, markLearning, deleteWord } = useVocab();
  const [query, setQuery] = useState('');
  const [editingWord, setEditingWord] = useState<VocabWord | null>(null);

  const filteredDisplay = useMemo(() => {
    if (!query.trim()) return displayWords;
    return displayWords.filter((w) => matchesQuery(w.word, query) || matchesQuery(w.meaning, query));
  }, [displayWords, query]);

  const filteredList = useMemo(() => {
    if (!query.trim()) return learningWords;
    return learningWords.filter((w) => matchesQuery(w.word, query) || matchesQuery(w.meaning, query));
  }, [learningWords, query]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-paper-100 sm:text-3xl">Đang học</h1>
        <p className="mt-1 font-sans text-sm text-paper-400">
          {learningWords.length} từ đang chờ bạn ôn lại hôm nay.
        </p>
      </div>

      <SearchBar value={query} onChange={setQuery} placeholder="Tìm trong danh sách đang học..." />

      {filteredDisplay.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={query ? 'Không tìm thấy từ phù hợp' : 'Không còn từ nào để học'}
          description={query ? 'Thử một từ khóa khác.' : 'Hãy thêm từ mới hoặc import file Excel.'}
        />
      ) : (
        <FlashcardView words={filteredDisplay} onMarkLearned={markLearned} onKeepLearning={markLearning} />
      )}

      {learningWords.length > 0 && (
        <section className="mt-2">
          <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wide text-paper-400">
            Danh sách đang học ({filteredList.length})
          </h2>
          <div className="flex flex-col gap-2">
            {filteredList.map((w) => (
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
                  <button onClick={() => markLearned(w.id)}
                    className="flex items-center gap-1.5 rounded-full border border-sage/40 bg-sage/10 px-3 py-1.5 font-sans text-xs font-semibold text-sage-light transition-colors hover:bg-sage/20">
                    <Check className="h-3.5 w-3.5" /> Đã thuộc
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <EditWordModal word={editingWord} onClose={() => setEditingWord(null)} />
    </div>
  );
}
