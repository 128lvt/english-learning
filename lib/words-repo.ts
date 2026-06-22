import { sql } from './db';
import type { NewWordInput, VocabWord, WordStatus } from '../types';

interface WordRow {
  id: string;
  user_id: string;
  stt: number;
  word: string;
  part_of_speech: string;
  phonetic: string;
  meaning: string;
  example: string;
  status: WordStatus;
  created_at: string;
  updated_at: string;
}

function rowToWord(row: WordRow): VocabWord {
  return {
    id: row.id,
    stt: row.stt,
    word: row.word,
    partOfSpeech: row.part_of_speech,
    phonetic: row.phonetic,
    meaning: row.meaning,
    example: row.example,
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export async function listWords(userId: string): Promise<VocabWord[]> {
  const rows = (await sql`
    SELECT * FROM words WHERE user_id = ${userId} ORDER BY stt ASC, created_at ASC
  `) as WordRow[];
  return rows.map(rowToWord);
}

async function nextStt(userId: string): Promise<number> {
  const [{ next }] = (await sql`
    SELECT COALESCE(MAX(stt), 0) + 1 AS next FROM words WHERE user_id = ${userId}
  `) as Array<{ next: number }>;
  return next;
}

export async function createWord(userId: string, input: NewWordInput): Promise<VocabWord> {
  const id = globalThis.crypto.randomUUID();
  const stt = await nextStt(userId);
  const rows = (await sql`
    INSERT INTO words (id, user_id, stt, word, part_of_speech, phonetic, meaning, example, status)
    VALUES (${id}, ${userId}, ${stt}, ${input.word.trim()}, ${input.partOfSpeech.trim() || 'unknown'},
            ${input.phonetic.trim()}, ${input.meaning.trim()}, ${input.example.trim()}, 'learning')
    RETURNING *
  `) as WordRow[];
  return rowToWord(rows[0]);
}

export async function updateWordStatus(
  id: string,
  userId: string,
  status: WordStatus,
): Promise<VocabWord | null> {
  const rows = (await sql`
    UPDATE words SET status = ${status}, updated_at = now()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `) as WordRow[];
  return rows[0] ? rowToWord(rows[0]) : null;
}

export async function updateWord(
  id: string,
  userId: string,
  input: Partial<NewWordInput>,
): Promise<VocabWord | null> {
  const rows = (await sql`
    UPDATE words SET
      word = COALESCE(NULLIF(${input.word?.trim() ?? ''}, ''), word),
      part_of_speech = COALESCE(NULLIF(${input.partOfSpeech?.trim() ?? ''}, ''), part_of_speech),
      phonetic = COALESCE(${input.phonetic?.trim() ?? null}, phonetic),
      meaning = COALESCE(NULLIF(${input.meaning?.trim() ?? ''}, ''), meaning),
      example = COALESCE(${input.example?.trim() ?? null}, example),
      updated_at = now()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `) as WordRow[];
  return rows[0] ? rowToWord(rows[0]) : null;
}

export async function deleteWord(id: string, userId: string): Promise<boolean> {
  const rows = (await sql`
    DELETE FROM words WHERE id = ${id} AND user_id = ${userId} RETURNING id
  `) as Array<{ id: string }>;
  return rows.length > 0;
}

export interface ImportRow {
  stt?: number;
  word: string;
  partOfSpeech: string;
  phonetic: string;
  meaning: string;
  example: string;
  status?: WordStatus;
}

export async function bulkInsertWords(userId: string, rows: ImportRow[]): Promise<VocabWord[]> {
  const inserted: VocabWord[] = [];
  for (const row of rows) {
    const id = globalThis.crypto.randomUUID();
    const stt = row.stt ?? (await nextStt(userId));
    const result = (await sql`
      INSERT INTO words (id, user_id, stt, word, part_of_speech, phonetic, meaning, example, status)
      VALUES (${id}, ${userId}, ${stt}, ${row.word}, ${row.partOfSpeech || 'unknown'},
              ${row.phonetic}, ${row.meaning}, ${row.example}, ${row.status ?? 'learning'})
      RETURNING *
    `) as WordRow[];
    inserted.push(rowToWord(result[0]));
  }
  return inserted;
}
