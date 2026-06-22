import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureSchema } from '@/lib/db';
import { updateWordStatus, updateWord, deleteWord } from '@/lib/words-repo';
import type { NewWordInput, WordStatus } from '@/types';

type Params = { params: Promise<{ id: string }> };

function unauthorised() {
  return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorised();

  await ensureSchema();
  const { id } = await params;
  const body = (await request.json()) as { status?: WordStatus } & Partial<NewWordInput>;

  // Distinguish between a status-flip and a full field edit by checking which keys are present.
  if (body.status !== undefined && Object.keys(body).length === 1) {
    if (body.status !== 'learning' && body.status !== 'learned') {
      return NextResponse.json({ error: 'status phải là "learning" hoặc "learned".' }, { status: 400 });
    }
    const word = await updateWordStatus(id, session.user.id, body.status);
    if (!word) return NextResponse.json({ error: 'Không tìm thấy từ này.' }, { status: 404 });
    return NextResponse.json({ word });
  }

  // Full field edit
  const word = await updateWord(id, session.user.id, body);
  if (!word) return NextResponse.json({ error: 'Không tìm thấy từ này.' }, { status: 404 });
  return NextResponse.json({ word });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorised();

  await ensureSchema();
  const { id } = await params;
  const deleted = await deleteWord(id, session.user.id);
  if (!deleted) return NextResponse.json({ error: 'Không tìm thấy từ này.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
