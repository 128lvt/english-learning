import { useContext } from 'react';
import { VocabContext, type VocabContextValue } from './vocabContextDefinition';

export function useVocab(): VocabContextValue {
  const ctx = useContext(VocabContext);
  if (!ctx) {
    throw new Error('useVocab phải được dùng bên trong <VocabProvider>');
  }
  return ctx;
}
