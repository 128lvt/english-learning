export type WordStatus = 'learning' | 'learned';

export interface VocabWord {
  id: string;
  stt: number;
  word: string;
  partOfSpeech: string;
  phonetic: string;
  meaning: string;
  example: string;
  status: WordStatus;
  createdAt: number;
  updatedAt: number;
}

/** Shape used when a new word is created from a form, before id/timestamps are attached */
export type NewWordInput = {
  word: string;
  partOfSpeech: string;
  phonetic: string;
  meaning: string;
  example: string;
};

export type ViewKey = 'learning' | 'learned' | 'add' | 'import' | 'stats';

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'error' | 'info';
}

/** Augment the NextAuth Session so session.user.id is typed as string */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
