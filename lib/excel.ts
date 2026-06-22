import type { ImportResult, VocabWord, WordStatus } from '../types';
import type { ImportRow } from './words-repo';

/** Strips Vietnamese diacritics and lowercases, so header matching is forgiving */
function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .trim()
    .toLowerCase();
}

const HEADER_ALIASES: Record<string, string[]> = {
  stt: ['stt', 'so thu tu', '#'],
  word: ['tu vung', 'word', 'vocabulary', 'tu'],
  partOfSpeech: ['tu loai', 'part of speech', 'pos', 'loai tu'],
  phonetic: ['phien am', 'phonetic', 'ipa', 'pronunciation'],
  meaning: ['y nghia', 'nghia', 'meaning', 'dich nghia'],
  example: ['vi du minh hoa', 'vi du', 'example', 'example sentence', 'cau vi du'],
  status: ['trang thai', 'status'],
};

type FieldKey = keyof typeof HEADER_ALIASES;

const LEARNED_VALUES = new Set(['da hoc', 'learned', 'done', 'hoan thanh']);

function parseStatusCell(raw: string): WordStatus {
  return LEARNED_VALUES.has(normalizeHeader(raw)) ? 'learned' : 'learning';
}

function buildColumnMap(headerRow: unknown[]): Partial<Record<FieldKey, number>> {
  const map: Partial<Record<FieldKey, number>> = {};
  headerRow.forEach((cell, columnIndex) => {
    const normalized = normalizeHeader(cell);
    (Object.keys(HEADER_ALIASES) as FieldKey[]).forEach((field) => {
      if (map[field] !== undefined) return;
      if (HEADER_ALIASES[field].includes(normalized)) {
        map[field] = columnIndex;
      }
    });
  });
  return map;
}

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls'];

export function isAcceptedExcelFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

function parseRows(headerRow: unknown[], dataRows: unknown[][]): { rows: ImportRow[]; skipped: number; errors: string[] } {
  const columnMap = buildColumnMap(headerRow);

  if (columnMap.word === undefined) {
    return {
      rows: [],
      skipped: 0,
      errors: [
        'Không tìm thấy cột "Từ vựng" trong file. Vui lòng kiểm tra lại tiêu đề cột (STT, Từ vựng, Từ loại, Phiên âm, Ý nghĩa, Ví dụ minh họa).',
      ],
    };
  }

  const rows: ImportRow[] = [];
  const errors: string[] = [];
  let skipped = 0;

  dataRows.forEach((dataRow, rowIndex) => {
    const sheetRowNumber = rowIndex + 2; // +1 header, +1 for 1-based display
    const cell = (field: FieldKey) => {
      const columnIndex = columnMap[field];
      if (columnIndex === undefined) return '';
      return String(dataRow[columnIndex] ?? '').trim();
    };

    const word = cell('word');
    if (!word) {
      skipped += 1;
      errors.push(`Dòng ${sheetRowNumber}: thiếu "Từ vựng", đã bỏ qua.`);
      return;
    }

    const sttParsed = Number.parseInt(cell('stt'), 10);

    rows.push({
      stt: Number.isFinite(sttParsed) ? sttParsed : undefined,
      word,
      partOfSpeech: cell('partOfSpeech') || 'unknown',
      phonetic: cell('phonetic'),
      meaning: cell('meaning'),
      example: cell('example'),
      status: parseStatusCell(cell('status')),
    });
  });

  return { rows, skipped, errors };
}

async function readSheetRows(buffer: ArrayBuffer): Promise<{ headerRow: unknown[]; dataRows: unknown[][] }> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('File Excel không có sheet nào.');

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '', blankrows: false });
  if (rows.length < 2) {
    throw new Error('File không có dữ liệu (cần ít nhất 1 dòng tiêu đề và 1 dòng từ vựng).');
  }
  const [headerRow, ...dataRows] = rows;
  return { headerRow, dataRows };
}

/**
 * Parses an uploaded Excel file (in the browser) into plain import rows.
 * Expected columns (any order, Vietnamese diacritics optional):
 * STT | Từ vựng | Từ loại | Phiên âm | Ý nghĩa | Ví dụ minh họa | (Trạng thái)
 */
export async function parseExcelFile(file: File): Promise<{ rows: ImportRow[]; result: ImportResult }> {
  if (!isAcceptedExcelFile(file)) {
    return {
      rows: [],
      result: {
        imported: 0,
        skipped: 0,
        errors: [`Định dạng file không hợp lệ: "${file.name}". Chỉ hỗ trợ .xlsx hoặc .xls.`],
      },
    };
  }

  let parsed: { headerRow: unknown[]; dataRows: unknown[][] };
  try {
    parsed = await readSheetRows(await file.arrayBuffer());
  } catch (error) {
    return {
      rows: [],
      result: {
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Không thể đọc file Excel.'],
      },
    };
  }

  const { rows, skipped, errors } = parseRows(parsed.headerRow, parsed.dataRows);
  return { rows, result: { imported: rows.length, skipped, errors } };
}

/** Builds an .xlsx workbook (as bytes) from the current word list — used by the export API route. */
export async function buildWorkbookBytes(words: VocabWord[]): Promise<Uint8Array> {
  const XLSX = await import('xlsx');
  const header = ['STT', 'Từ vựng', 'Từ loại', 'Phiên âm', 'Ý nghĩa', 'Ví dụ minh họa', 'Trạng thái'];
  const rows = [
    header,
    ...words.map((w) => [
      w.stt,
      w.word,
      w.partOfSpeech,
      w.phonetic,
      w.meaning,
      w.example,
      w.status === 'learned' ? 'Đã học' : 'Đang học',
    ]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = [{ wch: 6 }, { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 28 }, { wch: 40 }, { wch: 12 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'VocabList');
  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
}
