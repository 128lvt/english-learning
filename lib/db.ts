import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let cachedSql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!cachedSql) {
    const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error(
        'Thiếu biến môi trường DATABASE_URL. Xem .env.example để biết cách cấu hình.',
      );
    }
    cachedSql = neon(connectionString);
  }
  return cachedSql;
}

let schemaReadyPromise: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const sql = getSql();

      // --- Users table ---
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL DEFAULT '',
          password_hash TEXT,
          provider TEXT NOT NULL DEFAULT 'credentials',
          streak_days INTEGER NOT NULL DEFAULT 0,
          last_study_date DATE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;

      // --- Words table (scoped per user) ---
      await sql`
        CREATE TABLE IF NOT EXISTS words (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

      await sql`
        CREATE INDEX IF NOT EXISTS words_user_id_idx ON words(user_id)
      `;
    })();
  }
  return schemaReadyPromise;
}

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  return getSql()(strings, ...values);
}
