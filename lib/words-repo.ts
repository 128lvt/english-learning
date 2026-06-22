import { randomUUID } from 'crypto';
import { sql } from './db';
import type { NewWordInput, VocabWord, WordStatus } from '../types';

interface WordRow {
  id: string;
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

export async function listWords(): Promise<VocabWord[]> {
  const rows = (await sql`SELECT * FROM words ORDER BY stt ASC, created_at ASC`) as WordRow[];
  return rows.map(rowToWord);
}

async function nextStt(): Promise<number> {
  const [{ next }] = (await sql`SELECT COALESCE(MAX(stt), 0) + 1 AS next FROM words`) as Array<{ next: number }>;
  return next;
}

export async function createWord(input: NewWordInput): Promise<VocabWord> {
  const id = randomUUID();
  const stt = await nextStt();
  const rows = (await sql`
    INSERT INTO words (id, stt, word, part_of_speech, phonetic, meaning, example, status)
    VALUES (${id}, ${stt}, ${input.word.trim()}, ${input.partOfSpeech.trim() || 'unknown'}, ${input.phonetic.trim()}, ${input.meaning.trim()}, ${input.example.trim()}, 'learning')
    RETURNING *
  `) as WordRow[];
  return rowToWord(rows[0]);
}

export async function updateWordStatus(id: string, status: WordStatus): Promise<VocabWord | null> {
  const rows = (await sql`
    UPDATE words SET status = ${status}, updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `) as WordRow[];
  return rows[0] ? rowToWord(rows[0]) : null;
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

/** Bulk-inserts rows coming from a parsed Excel file. Server assigns fresh ids/timestamps. */
export async function bulkInsertWords(rows: ImportRow[]): Promise<VocabWord[]> {
  const inserted: VocabWord[] = [];
  for (const row of rows) {
    const id = randomUUID();
    const stt = row.stt ?? (await nextStt());
    const result = (await sql`
      INSERT INTO words (id, stt, word, part_of_speech, phonetic, meaning, example, status)
      VALUES (${id}, ${stt}, ${row.word}, ${row.partOfSpeech || 'unknown'}, ${row.phonetic}, ${row.meaning}, ${row.example}, ${row.status ?? 'learning'})
      RETURNING *
    `) as WordRow[];
    inserted.push(rowToWord(result[0]));
  }
  return inserted;
}
