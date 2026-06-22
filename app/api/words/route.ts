import { NextResponse } from 'next/server';
import { ensureSchema } from '@/lib/db';
import { createWord, listWords } from '@/lib/words-repo';
import type { NewWordInput } from '@/types';

export async function GET() {
  await ensureSchema();
  const words = await listWords();
  return NextResponse.json({ words });
}

export async function POST(request: Request) {
  await ensureSchema();
  const body = (await request.json()) as Partial<NewWordInput>;

  if (!body.word?.trim() || !body.meaning?.trim()) {
    return NextResponse.json({ error: 'Thiếu "Từ vựng" hoặc "Ý nghĩa".' }, { status: 400 });
  }

  const word = await createWord({
    word: body.word,
    partOfSpeech: body.partOfSpeech ?? '',
    phonetic: body.phonetic ?? '',
    meaning: body.meaning,
    example: body.example ?? '',
  });

  return NextResponse.json({ word }, { status: 201 });
}
