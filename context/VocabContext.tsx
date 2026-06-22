'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { NewWordInput, ToastMessage, VocabWord, WordStatus } from '../types';
import type { ImportRow } from '../lib/words-repo';
import { VocabContext, type VocabContextValue } from './vocabContextDefinition';

async function readJsonError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `Lỗi ${response.status}`;
  } catch {
    return `Lỗi ${response.status}`;
  }
}

export function VocabProvider({ children }: { children: ReactNode }) {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Tracks in-flight status PATCHes so a failed one can be rolled back precisely.
  const pendingRevert = useRef<Map<string, WordStatus>>(new Map());

  const pushToast = useCallback((text: string, tone: ToastMessage['tone'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, text, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initial load from the database.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/words', { cache: 'no-store' });
        if (!response.ok) throw new Error(await readJsonError(response));
        const data = (await response.json()) as { words: VocabWord[] };
        if (!cancelled) setWords(data.words);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Không thể tải dữ liệu từ database.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addWord = useCallback(
    async (input: NewWordInput) => {
      if (!input.word.trim() || !input.meaning.trim()) {
        pushToast('Vui lòng nhập Từ vựng và Ý nghĩa.', 'error');
        return;
      }
      setIsSaving(true);
      try {
        const response = await fetch('/api/words', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (!response.ok) throw new Error(await readJsonError(response));
        const { word } = (await response.json()) as { word: VocabWord };
        setWords((prev) => [...prev, word]);
        pushToast(`Đã thêm "${word.word}" vào danh sách đang học`, 'success');
      } catch (error) {
        pushToast(error instanceof Error ? error.message : 'Không thể thêm từ mới.', 'error');
      } finally {
        setIsSaving(false);
      }
    },
    [pushToast],
  );

  const setStatus = useCallback(
    (id: string, status: WordStatus) => {
      // Optimistic update so the flashcard flow feels instant; rolled back on failure.
      let previousStatus: WordStatus | undefined;
      setWords((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;
          previousStatus = w.status;
          return { ...w, status, updatedAt: Date.now() };
        }),
      );
      if (previousStatus) pendingRevert.current.set(id, previousStatus);

      fetch(`/api/words/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(await readJsonError(response));
          pendingRevert.current.delete(id);
        })
        .catch((error) => {
          const fallback = pendingRevert.current.get(id);
          if (fallback) {
            setWords((prev) => prev.map((w) => (w.id === id ? { ...w, status: fallback } : w)));
          }
          pushToast(error instanceof Error ? error.message : 'Không thể lưu thay đổi.', 'error');
        });
    },
    [pushToast],
  );

  const markLearned = useCallback((id: string) => setStatus(id, 'learned'), [setStatus]);
  const markLearning = useCallback((id: string) => setStatus(id, 'learning'), [setStatus]);

  const importRows = useCallback(
    async (rows: ImportRow[]) => {
      if (rows.length === 0) return { imported: 0 };
      setIsSaving(true);
      try {
        const response = await fetch('/api/words/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows }),
        });
        if (!response.ok) throw new Error(await readJsonError(response));
        const data = (await response.json()) as { words: VocabWord[]; imported: number };
        setWords((prev) => [...prev, ...data.words]);
        return { imported: data.imported };
      } catch (error) {
        pushToast(error instanceof Error ? error.message : 'Không thể import file này.', 'error');
        return { imported: 0 };
      } finally {
        setIsSaving(false);
      }
    },
    [pushToast],
  );

  const exportToExcel = useCallback(() => {
    const link = document.createElement('a');
    link.href = '/api/words/export';
    link.download = 'vocanight.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const learningWords = useMemo(() => words.filter((w) => w.status === 'learning'), [words]);
  const learnedWords = useMemo(() => words.filter((w) => w.status === 'learned'), [words]);

  const stats = useMemo(() => {
    const total = words.length;
    const learned = learnedWords.length;
    const learning = learningWords.length;
    const percent = total === 0 ? 0 : Math.round((learned / total) * 100);
    return { total, learning, learned, percent };
  }, [words.length, learnedWords.length, learningWords.length]);

  const value: VocabContextValue = {
    words,
    learningWords,
    learnedWords,
    stats,
    isLoading,
    loadError,
    isSaving,
    addWord,
    markLearned,
    markLearning,
    importRows,
    exportToExcel,
    toasts,
    pushToast,
    dismissToast,
  };

  return <VocabContext.Provider value={value}>{children}</VocabContext.Provider>;
}
