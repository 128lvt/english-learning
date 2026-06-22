import { NextResponse } from 'next/server';
import { ensureSchema } from '@/lib/db';
import { updateWordStatus } from '@/lib/words-repo';
import type { WordStatus } from '@/types';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const { id } = await params;
  const body = (await request.json()) as { status?: WordStatus };

  if (body.status !== 'learning' && body.status !== 'learned') {
    return NextResponse.json({ error: 'status phải là "learning" hoặc "learned".' }, { status: 400 });
  }

  const word = await updateWordStatus(id, body.status);
  if (!word) {
    return NextResponse.json({ error: 'Không tìm thấy từ này.' }, { status: 404 });
  }

  return NextResponse.json({ word });
}
