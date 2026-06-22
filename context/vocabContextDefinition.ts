import { createContext } from 'react';
import type { NewWordInput, ToastMessage, VocabWord } from '../types';
import type { ImportRow } from '../lib/words-repo';

export interface VocabContextValue {
  words: VocabWord[];
  learningWords: VocabWord[];
  learnedWords: VocabWord[];
  displayWords: VocabWord[];   // learningWords, shuffled if shuffleMode is on
  stats: { total: number; learning: number; learned: number; percent: number };

  isLoading: boolean;
  loadError: string | null;
  isSaving: boolean;

  // Study session
  shuffleMode: boolean;
  toggleShuffle: () => void;
  sessionCount: number;           // cards reviewed this session
  incrementSession: () => void;

  addWord: (input: NewWordInput) => Promise<void>;
  editWord: (id: string, input: Partial<NewWordInput>) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
  markLearned: (id: string) => void;
  markLearning: (id: string) => void;
  importRows: (rows: ImportRow[]) => Promise<{ imported: number }>;
  exportToExcel: () => void;

  toasts: ToastMessage[];
  pushToast: (text: string, tone?: ToastMessage['tone']) => void;
  dismissToast: (id: string) => void;
}

export const VocabContext = createContext<VocabContextValue | null>(null);
