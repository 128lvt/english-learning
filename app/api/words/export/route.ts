import { auth } from '@/auth';
import { ensureSchema } from '@/lib/db';
import { listWords } from '@/lib/words-repo';
import { buildWorkbookBytes } from '@/lib/excel';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Chưa đăng nhập.', { status: 401 });
  }

  await ensureSchema();
  const words = await listWords(session.user.id);
  const bytes = await buildWorkbookBytes(words);

  return new Response(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="vocanight.xlsx"',
    },
  });
}
