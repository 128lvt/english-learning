import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureSchema } from '@/lib/db';
import { bulkInsertWords, type ImportRow } from '@/lib/words-repo';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
  }

  await ensureSchema();
  const body = (await request.json()) as { rows?: ImportRow[] };
  const rows = Array.isArray(body.rows) ? body.rows : [];

  const validRows = rows.filter(
    (row): row is ImportRow => typeof row?.word === 'string' && row.word.trim().length > 0,
  );
  if (validRows.length === 0) return NextResponse.json({ words: [], imported: 0 });

  const words = await bulkInsertWords(session.user.id, validRows);
  return NextResponse.json({ words, imported: words.length }, { status: 201 });
}
