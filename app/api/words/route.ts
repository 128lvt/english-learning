import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureSchema } from '@/lib/db';
import { createWord, listWords } from '@/lib/words-repo';
import type { NewWordInput } from '@/types';

function unauthorised() {
  return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorised();

  await ensureSchema();
  const words = await listWords(session.user.id);
  return NextResponse.json({ words });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return unauthorised();

  await ensureSchema();
  const body = (await request.json()) as Partial<NewWordInput>;

  if (!body.word?.trim() || !body.meaning?.trim()) {
    return NextResponse.json({ error: 'Thiếu "Từ vựng" hoặc "Ý nghĩa".' }, { status: 400 });
  }

  const word = await createWord(session.user.id, {
    word: body.word,
    partOfSpeech: body.partOfSpeech ?? '',
    phonetic: body.phonetic ?? '',
    meaning: body.meaning,
    example: body.example ?? '',
  });

  return NextResponse.json({ word }, { status: 201 });
}
