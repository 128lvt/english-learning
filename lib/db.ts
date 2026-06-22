import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let cachedSql: NeonQueryFunction<false, false> | null = null;

/**
 * Lazily creates the Neon SQL client on first real use (inside a request),
 * rather than at module-load time — Next.js evaluates route module top-level
 * code while collecting page data during `next build`, so throwing eagerly
 * here would break every build that doesn't have DATABASE_URL available yet.
 */
function getSql(): NeonQueryFunction<false, false> {
  if (!cachedSql) {
    const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error(
        'Thiếu biến môi trường DATABASE_URL (hoặc POSTGRES_URL). Hãy kết nối một Postgres database (Neon) cho project trên Vercel, hoặc tạo file .env.local khi chạy ở máy — xem .env.example.',
      );
    }
    cachedSql = neon(connectionString);
  }
  return cachedSql;
}

let schemaReadyPromise: Promise<void> | null = null;

/**
 * Creates the `words` table on first use and seeds it with the starter deck
 * if it's empty. Safe to call on every request — the heavy lifting only runs
 * once per warm serverless instance thanks to the cached promise below.
 */
export function ensureSchema(): Promise<void> {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS words (
          id TEXT PRIMARY KEY,
          stt INTEGER NOT NULL,
          word TEXT NOT NULL,
          part_of_speech TEXT NOT NULL DEFAULT 'unknown',
          phonetic TEXT NOT NULL DEFAULT '',
          meaning TEXT NOT NULL DEFAULT '',
          example TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'learning',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;

      const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM words`) as Array<{ count: number }>;
      if (count === 0) {
        const { buildSampleWords } = await import('./sampleData');
        const seedWords = buildSampleWords();
        for (const w of seedWords) {
          await sql`
            INSERT INTO words (id, stt, word, part_of_speech, phonetic, meaning, example, status, created_at, updated_at)
            VALUES (${w.id}, ${w.stt}, ${w.word}, ${w.partOfSpeech}, ${w.phonetic}, ${w.meaning}, ${w.example}, ${w.status}, to_timestamp(${w.createdAt / 1000}), to_timestamp(${w.updatedAt / 1000}))
          `;
        }
      }
    })();
  }
  return schemaReadyPromise;
}

/** Exposed for the repo layer — always call this from inside a function body, never at module scope. */
export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  return getSql()(strings, ...values);
}
