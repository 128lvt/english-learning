'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { Loader2, PlusCircle } from 'lucide-react';
import { useVocab } from '@/context/useVocab';
import type { NewWordInput } from '@/types';

const EMPTY_FORM: NewWordInput = {
  word: '',
  partOfSpeech: '',
  phonetic: '',
  meaning: '',
  example: '',
};

const PART_OF_SPEECH_OPTIONS = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'phrase'];

export function AddWordPage() {
  const { addWord, isSaving } = useVocab();
  const [form, setForm] = useState<NewWordInput>(EMPTY_FORM);
  const [touched, setTouched] = useState(false);

  const isValid = form.word.trim().length > 0 && form.meaning.trim().length > 0;

  function update<K extends keyof NewWordInput>(key: K, value: NewWordInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    await addWord(form);
    setForm(EMPTY_FORM);
    setTouched(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-paper-100 sm:text-3xl">Thêm từ mới</h1>
        <p className="mt-1 font-sans text-sm text-paper-400">
          Từ mới sẽ được lưu vào database và xuất hiện ngay trong danh sách “Đang học”.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-card border border-ink-700 bg-ink-800/60 p-6 sm:p-8"
      >
        <Field label="Từ vựng" required error={touched && !form.word.trim() ? 'Vui lòng nhập từ vựng.' : undefined}>
          <input
            value={form.word}
            onChange={(e) => update('word', e.target.value)}
            placeholder="ví dụ: discovery"
            className={inputClass}
            autoFocus
          />
        </Field>

        <Field label="Từ loại">
          <div className="flex flex-wrap gap-2">
            {PART_OF_SPEECH_OPTIONS.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => update('partOfSpeech', option)}
                className={`rounded-full border px-3 py-1.5 font-sans text-xs transition-colors ${
                  form.partOfSpeech === option
                    ? 'border-amber bg-amber/15 text-amber-light'
                    : 'border-ink-600 text-paper-400 hover:border-paper-400/40 hover:text-paper-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <input
            value={form.partOfSpeech}
            onChange={(e) => update('partOfSpeech', e.target.value)}
            placeholder="hoặc nhập tự do, ví dụ: noun"
            className={`${inputClass} mt-2`}
          />
        </Field>

        <Field label="Phiên âm">
          <input
            value={form.phonetic}
            onChange={(e) => update('phonetic', e.target.value)}
            placeholder="ví dụ: /dɪˈskʌvəri/"
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field label="Ý nghĩa" required error={touched && !form.meaning.trim() ? 'Vui lòng nhập ý nghĩa.' : undefined}>
          <input
            value={form.meaning}
            onChange={(e) => update('meaning', e.target.value)}
            placeholder="ví dụ: sự khám phá"
            className={inputClass}
          />
        </Field>

        <Field label="Ví dụ minh họa">
          <textarea
            value={form.example}
            onChange={(e) => update('example', e.target.value)}
            placeholder="ví dụ: This discovery changed the world."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-amber px-5 py-3 font-sans text-sm font-semibold text-ink-950 shadow-glow transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
          {isSaving ? 'Đang lưu...' : 'Thêm từ'}
        </button>
      </form>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-ink-600 bg-ink-800 px-4 py-2.5 font-sans text-sm text-paper-100 placeholder:text-paper-400/60 outline-none transition-colors focus:border-amber/60 focus:ring-2 focus:ring-amber/20';

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-sans text-sm font-medium text-paper-200">
        {label} {required ? <span className="text-clay-light">*</span> : null}
      </span>
      {children}
      {error ? <span className="font-sans text-xs text-clay-light">{error}</span> : null}
    </label>
  );
}
