'use client';

import { Award, BookOpen, Flame, Layers, Zap } from 'lucide-react';
import { useVocab } from '@/context/useVocab';
import { ProgressBar } from '@/components/common/ProgressBar';

export function StatsPage() {
  const { stats, sessionCount } = useVocab();

  const cards = [
    { label: 'Tổng số từ', value: stats.total, icon: Layers, tone: 'text-paper-100', bg: 'bg-ink-700' },
    { label: 'Đang học', value: stats.learning, icon: BookOpen, tone: 'text-amber-light', bg: 'bg-amber/15' },
    { label: 'Đã học', value: stats.learned, icon: Award, tone: 'text-sage-light', bg: 'bg-sage/15' },
    { label: 'Phiên này', value: sessionCount, icon: Zap, tone: 'text-clay-light', bg: 'bg-clay/15' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-paper-100 sm:text-3xl">Thống kê</h1>
        <p className="mt-1 font-sans text-sm text-paper-400">Theo dõi tiến độ học từ vựng của bạn.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-card border border-ink-700 bg-ink-800/60 p-5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${card.bg} ${card.tone}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className={`font-display text-3xl ${card.tone}`}>{card.value}</p>
            <p className="mt-1 font-sans text-sm text-paper-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-card border border-ink-700 bg-ink-800/60 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="h-4 w-4 text-amber-light" />
          <p className="font-sans text-sm font-semibold text-paper-200">Streak học tập</p>
        </div>
        <p className="font-sans text-xs text-paper-400 mb-4">
          Chuỗi ngày học liên tiếp — được tính khi bạn mở trang Đang học. Xem ở icon avatar góc trên phải.
        </p>

        <p className="font-sans text-sm font-semibold text-paper-200 mb-1">Tiến độ tổng thể</p>
        <p className="mt-1 font-mono text-sm text-paper-400">
          {stats.learned} / {stats.total} từ đã học
        </p>
        <div className="mt-4">
          <ProgressBar value={stats.learned} max={stats.total} />
        </div>
      </div>
    </div>
  );
}
