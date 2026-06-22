'use client';

import { useRef, useState, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Cloud, Download, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { useVocab } from '@/context/useVocab';
import { parseExcelFile, isAcceptedExcelFile } from '@/lib/excel';
import type { ImportResult } from '@/types';

export function ImportPage() {
  const { importRows, exportToExcel, pushToast } = useVocab();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<ImportResult | null>(null);
  const [lastFileName, setLastFileName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLastFileName(file.name);

    if (!isAcceptedExcelFile(file)) {
      setLastResult({
        imported: 0,
        skipped: 0,
        errors: [`Định dạng file không hợp lệ: "${file.name}". Chỉ hỗ trợ .xlsx hoặc .xls.`],
      });
      pushToast('File không đúng định dạng Excel', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const { rows, result } = await parseExcelFile(file);
      if (rows.length > 0) {
        const { imported } = await importRows(rows);
        setLastResult({ ...result, imported });
        if (imported > 0) pushToast(`Đã import ${imported} từ vào database`, 'success');
      } else {
        setLastResult(result);
        pushToast('Không có từ nào được import', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-paper-100 sm:text-3xl">Import Excel</h1>
        <p className="mt-1 font-sans text-sm text-paper-400">
          Dữ liệu của bạn được lưu trên cloud database — dùng được trên mọi thiết bị, kể cả điện thoại. Bạn vẫn có
          thể import thêm từ file Excel hoặc tải dữ liệu hiện tại ra file để lưu trữ/chia sẻ.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-card border border-ink-700 bg-ink-800/60 p-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage-light">
          <Cloud className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base text-paper-100">Đang lưu trên cloud database</p>
          <p className="mt-1 font-sans text-xs text-paper-400">
            Mọi thay đổi (thêm từ, đánh dấu đã học, import...) được ghi thẳng vào Postgres và đồng bộ trên mọi
            thiết bị bạn đăng nhập cùng app này — không phụ thuộc trình duyệt hay máy nào cả.
          </p>
        </div>
        <button
          onClick={exportToExcel}
          className="flex flex-shrink-0 items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-4 py-2.5 font-sans text-sm font-semibold text-paper-200 transition-colors hover:border-paper-400/40 hover:text-paper-100"
        >
          <Download className="h-4 w-4" /> Tải Excel
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-4 rounded-card border-2 border-dashed px-6 py-14 text-center transition-colors ${
          isDragging ? 'border-amber bg-amber/5' : 'border-ink-600 bg-ink-800/50 hover:border-paper-400/40'
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber/15 text-amber-light">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div>
          <p className="font-display text-lg text-paper-100">
            {isProcessing ? 'Đang xử lý file...' : 'Kéo & thả file vào đây'}
          </p>
          <p className="mt-1 font-sans text-sm text-paper-400">hoặc nhấn để chọn file (.xlsx, .xls)</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>

      <div className="rounded-card border border-ink-700 bg-ink-800/40 p-5">
        <p className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold text-paper-200">
          <FileSpreadsheet className="h-4 w-4 text-amber-light" /> Định dạng cột yêu cầu
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left font-mono text-xs text-paper-300">
            <thead>
              <tr className="border-b border-ink-600 text-paper-400">
                <th className="py-1.5 pr-4">STT</th>
                <th className="py-1.5 pr-4">Từ vựng</th>
                <th className="py-1.5 pr-4">Từ loại</th>
                <th className="py-1.5 pr-4">Phiên âm</th>
                <th className="py-1.5 pr-4">Ý nghĩa</th>
                <th className="py-1.5 pr-4">Ví dụ minh họa</th>
                <th className="py-1.5 pr-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-ink-700/60">
                <td className="py-1.5 pr-4">21</td>
                <td className="py-1.5 pr-4">discovery</td>
                <td className="py-1.5 pr-4">noun</td>
                <td className="py-1.5 pr-4">/dɪˈskʌvəri/</td>
                <td className="py-1.5 pr-4">sự khám phá</td>
                <td className="py-1.5 pr-4">This discovery changed the world.</td>
                <td className="py-1.5 pr-4 text-paper-400">Đang học</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4">22</td>
                <td className="py-1.5 pr-4">commercial</td>
                <td className="py-1.5 pr-4">adjective</td>
                <td className="py-1.5 pr-4">/kəˈmɜːʃl/</td>
                <td className="py-1.5 pr-4">thuộc thương mại</td>
                <td className="py-1.5 pr-4">Commercial products are everywhere.</td>
                <td className="py-1.5 pr-4 text-paper-400">Đã học</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-sans text-xs text-paper-400">
          Chỉ cột “Từ vựng” là bắt buộc, các cột khác có thể để trống. Cột “Trạng thái” để trống sẽ được tính là
          “Đang học” — đây cũng là cột app tự ghi khi bạn tải file Excel ra (mục “Tải Excel” phía trên).
        </p>
      </div>

      {lastResult ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-card border border-ink-700 bg-ink-800/60 p-5"
        >
          <p className="flex items-center gap-2 font-sans text-sm font-semibold text-paper-200">
            {lastResult.imported > 0 ? (
              <CheckCircle2 className="h-4 w-4 text-sage-light" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-clay-light" />
            )}
            Kết quả import: <span className="font-mono text-paper-400">{lastFileName}</span>
          </p>
          <div className="mt-3 flex gap-6 font-sans text-sm">
            <span className="text-sage-light">
              Đã import: <strong>{lastResult.imported}</strong>
            </span>
            <span className="text-clay-light">
              Bỏ qua: <strong>{lastResult.skipped}</strong>
            </span>
          </div>
          {lastResult.errors.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-1 border-t border-ink-700 pt-3 font-sans text-xs text-paper-400">
              {lastResult.errors.slice(0, 8).map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
              {lastResult.errors.length > 8 ? <li>… và {lastResult.errors.length - 8} lỗi khác</li> : null}
            </ul>
          ) : null}
        </motion.div>
      ) : null}
    </div>
  );
}
