'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Tìm từ vựng hoặc nghĩa...'}
        className="w-full rounded-2xl border border-ink-600 bg-ink-800 py-3 pl-11 pr-10 font-sans text-sm text-paper-100 placeholder:text-paper-400/70 outline-none transition-colors focus:border-amber/60 focus:ring-2 focus:ring-amber/20"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Xóa tìm kiếm"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-paper-400 transition-colors hover:bg-ink-600 hover:text-paper-100"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
