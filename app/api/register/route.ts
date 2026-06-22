import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ensureSchema } from '@/lib/db';
import { findUserByEmail, createUserWithCredentials, seedWordsForUser } from '@/lib/users-repo';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    name?: string;
  };

  const email = body.email?.toLowerCase().trim() ?? '';
  const password = body.password ?? '';
  const name = body.name?.trim() ?? '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email không hợp lệ.' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: 'Vui lòng nhập tên hiển thị.' }, { status: 400 });
  }

  await ensureSchema();

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'Email này đã được đăng ký.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUserWithCredentials(email, name, passwordHash);
  await seedWordsForUser(user.id);

  return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
}
