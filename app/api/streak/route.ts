import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureSchema } from '@/lib/db';
import { touchStudyStreak } from '@/lib/users-repo';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
  }

  await ensureSchema();
  const streakDays = await touchStudyStreak(session.user.id);
  return NextResponse.json({ streakDays });
}
