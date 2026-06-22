'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import type { NewWordInput, ToastMessage, VocabWord, WordStatus } from '../types';
import type { ImportRow } from '../lib/words-repo';
import { VocabContext, type VocabContextValue } from './vocabContextDefinition';

async function readJsonError(response: Response): Promise<string> {
  // Guard against HTML responses (e.g. a middleware redirect returning <!DOCTYPE …>)
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return `Lỗi ${response.status} — phản hồi không phải JSON (có thể session chưa sẵn sàng).`;
  }
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `Lỗi ${response.status}`;
  } catch {
    return `Lỗi ${response.status}`;
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function VocabProvider({ children }: { children: ReactNode }) {
  // Wait for NextAuth to confirm the session before fetching words.
  // Without this, the fetch fires while the session cookie is still being
  // written after login → middleware redirects → HTML response → JSON parse error.
  const { status } = useSession();

  const [words, setWords] = useState<VocabWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [shuffledIds, setShuffledIds] = useState<string[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const pendingRevert = useRef<Map<string, WordStatus>>(new Map());

  const pushToast = useCallback((text: string, tone: ToastMessage['tone'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, text, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initial load — only runs once the session is confirmed as authenticated.
  // This prevents the race where the fetch fires before the session cookie is
  // written to the browser (which would return an HTML redirect, not JSON).
  useEffect(() => {
  if (status !== 'authenticated') {
    if (status === 'unauthenticated') setIsLoading(false);
    return;
  }

  // ← hai dòng này bị thiếu trong file của bạn
  let cancelled = false;
  (async () => {
    try {
      const res = await fetch('/api/words', { cache: 'no-store' });
      if (!res.ok) throw new Error(await readJsonError(res));
      const data = (await res.json()) as { words: VocabWord[] };
      if (!cancelled) setWords(data.words);
    } catch (error) {
      if (!cancelled)
        setLoadError(
          error instanceof Error ? error.message : 'Không thể tải dữ liệu từ database.'
        );
    } finally {
      if (!cancelled) setIsLoading(false);
    }
  })();                        // ← đóng IIFE
  return () => { cancelled = true; };
}, [status]);     

  const learningWords = useMemo(() => words.filter((w) => w.status === 'learning'), [words]);
  const learnedWords = useMemo(() => words.filter((w) => w.status === 'learned'), [words]);

  // When shuffleMode turns on, create and cache a shuffled order.
  // New words added later are appended at the end (no re-shuffle).
  const toggleShuffle = useCallback(() => {
    setShuffleMode((prev) => {
      if (!prev) {
        setShuffledIds(shuffleArray(learningWords.map((w) => w.id)));
      } else {
        setShuffledIds([]);
      }
      return !prev;
    });
  }, [learningWords]);

  const displayWords = useMemo(() => {
    if (!shuffleMode) return learningWords;
    // Build ordered list from shuffledIds, appending any new words not yet in the shuffle
    const inShuffle = new Set(shuffledIds);
    const extras = learningWords.filter((w) => !inShuffle.has(w.id));
    const ordered = shuffledIds
      .map((id) => learningWords.find((w) => w.id === id))
      .filter((w): w is VocabWord => !!w);
    return [...ordered, ...extras];
  }, [shuffleMode, shuffledIds, learningWords]);

  const incrementSession = useCallback(() => setSessionCount((n) => n + 1), []);

  const stats = useMemo(() => {
    const total = words.length;
    const learned = learnedWords.length;
    const learning = learningWords.length;
    const percent = total === 0 ? 0 : Math.round((learned / total) * 100);
    return { total, learning, learned, percent };
  }, [words.length, learnedWords.length, learningWords.length]);

  const addWord = useCallback(async (input: NewWordInput) => {
    if (!input.word.trim() || !input.meaning.trim()) {
      pushToast('Vui lòng nhập Từ vựng và Ý nghĩa.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(await readJsonError(res));
      const { word } = (await res.json()) as { word: VocabWord };
      setWords((prev) => [...prev, word]);
      pushToast(`Đã thêm "${word.word}" vào danh sách đang học`, 'success');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Không thể thêm từ mới.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [pushToast]);

  const editWord = useCallback(async (id: string, input: Partial<NewWordInput>) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/words/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(await readJsonError(res));
      const { word } = (await res.json()) as { word: VocabWord };
      setWords((prev) => prev.map((w) => (w.id === id ? word : w)));
      pushToast('Đã cập nhật từ vựng', 'success');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Không thể cập nhật từ.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [pushToast]);

  const deleteWord = useCallback(async (id: string) => {
    const word = words.find((w) => w.id === id);
    // Optimistic remove
    setWords((prev) => prev.filter((w) => w.id !== id));
    try {
      const res = await fetch(`/api/words/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await readJsonError(res));
      pushToast(`Đã xoá "${word?.word ?? 'từ vựng'}"`, 'info');
    } catch (error) {
      // Rollback
      if (word) setWords((prev) => [...prev, word].sort((a, b) => a.stt - b.stt));
      pushToast(error instanceof Error ? error.message : 'Không thể xoá từ.', 'error');
    }
  }, [words, pushToast]);

  const setStatus = useCallback((id: string, status: WordStatus) => {
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
      .then(async (res) => {
        if (!res.ok) throw new Error(await readJsonError(res));
        pendingRevert.current.delete(id);
      })
      .catch((error) => {
        const fallback = pendingRevert.current.get(id);
        if (fallback) setWords((prev) => prev.map((w) => (w.id === id ? { ...w, status: fallback } : w)));
        pushToast(error instanceof Error ? error.message : 'Không thể lưu thay đổi.', 'error');
      });
  }, [pushToast]);

  const markLearned = useCallback((id: string) => setStatus(id, 'learned'), [setStatus]);
  const markLearning = useCallback((id: string) => setStatus(id, 'learning'), [setStatus]);

  const importRows = useCallback(async (rows: ImportRow[]) => {
    if (rows.length === 0) return { imported: 0 };
    setIsSaving(true);
    try {
      const res = await fetch('/api/words/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) throw new Error(await readJsonError(res));
      const data = (await res.json()) as { words: VocabWord[]; imported: number };
      setWords((prev) => [...prev, ...data.words]);
      return { imported: data.imported };
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Không thể import file này.', 'error');
      return { imported: 0 };
    } finally {
      setIsSaving(false);
    }
  }, [pushToast]);

  const exportToExcel = useCallback(() => {
    const link = document.createElement('a');
    link.href = '/api/words/export';
    link.download = 'vocanight.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const value: VocabContextValue = {
    words, learningWords, learnedWords, displayWords, stats,
    isLoading, loadError, isSaving,
    shuffleMode, toggleShuffle, sessionCount, incrementSession,
    addWord, editWord, deleteWord, markLearned, markLearning,
    importRows, exportToExcel,
    toasts, pushToast, dismissToast,
  };

  return <VocabContext.Provider value={value}>{children}</VocabContext.Provider>;
}
