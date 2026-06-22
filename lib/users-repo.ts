import { sql } from './db';

export interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  provider: string;
  streak_days: number;
  last_study_date: string | null;
  created_at: string;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const rows = (await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`) as UserRow[];
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const rows = (await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`) as UserRow[];
  return rows[0] ?? null;
}

export async function createUserWithCredentials(
  email: string,
  name: string,
  passwordHash: string,
): Promise<UserRow> {
  const id = globalThis.crypto.randomUUID();
  const rows = (await sql`
    INSERT INTO users (id, email, name, password_hash, provider)
    VALUES (${id}, ${email.toLowerCase().trim()}, ${name.trim()}, ${passwordHash}, 'credentials')
    RETURNING *
  `) as UserRow[];
  return rows[0];
}

export async function findOrCreateOAuthUser(
  email: string,
  name: string,
  provider: string,
): Promise<UserRow> {
  const existing = await findUserByEmail(email);
  if (existing) {
    // If user originally signed up with credentials, still allow OAuth login.
    return existing;
  }
  const id = globalThis.crypto.randomUUID();
  const rows = (await sql`
    INSERT INTO users (id, email, name, provider)
    VALUES (${id}, ${email.toLowerCase().trim()}, ${name.trim()}, ${provider})
    RETURNING *
  `) as UserRow[];
  return rows[0];
}

/**
 * Seeds the starter deck for a brand-new user (called once right after
 * account creation, inside register/OAuth-first-login handlers).
 */
export async function seedWordsForUser(userId: string): Promise<void> {
  const { buildSampleWords } = await import('./sampleData');
  const seedWords = buildSampleWords();
  for (const w of seedWords) {
    await sql`
      INSERT INTO words (id, user_id, stt, word, part_of_speech, phonetic, meaning, example, status, created_at, updated_at)
      VALUES (${w.id + '-' + userId.slice(0, 8)}, ${userId}, ${w.stt}, ${w.word}, ${w.partOfSpeech},
              ${w.phonetic}, ${w.meaning}, ${w.example}, ${w.status},
              to_timestamp(${w.createdAt / 1000}), to_timestamp(${w.updatedAt / 1000}))
    `;
  }
}

/**
 * Updates the user's study streak:
 * - Studied yesterday → increment streak
 * - Studied today already → no change
 * - Gap > 1 day → reset streak to 1
 */
export async function touchStudyStreak(userId: string): Promise<number> {
  const rows = (await sql`
    SELECT streak_days, last_study_date FROM users WHERE id = ${userId}
  `) as Array<{ streak_days: number; last_study_date: string | null }>;

  if (!rows[0]) return 0;
  const { streak_days, last_study_date } = rows[0];

  const todayUtc = new Date().toISOString().slice(0, 10);
  if (last_study_date === todayUtc) return streak_days; // already counted today

  const yesterdayUtc = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = last_study_date === yesterdayUtc ? streak_days + 1 : 1;

  await sql`
    UPDATE users SET streak_days = ${newStreak}, last_study_date = ${todayUtc}
    WHERE id = ${userId}
  `;
  return newStreak;
}
