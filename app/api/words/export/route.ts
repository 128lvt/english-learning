import { ensureSchema } from '@/lib/db';
import { listWords } from '@/lib/words-repo';
import { buildWorkbookBytes } from '@/lib/excel';

export async function GET() {
  await ensureSchema();
  const words = await listWords();
  const bytes = await buildWorkbookBytes(words);

  return new Response(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="vocanight.xlsx"',
    },
  });
}
