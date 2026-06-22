import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-ink-600 bg-ink-800/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-700 text-amber">
        <Icon className="h-6 w-6" />
      </div>
      <p className="font-display text-lg text-paper-100">{title}</p>
      <p className="max-w-xs font-sans text-sm text-paper-400">{description}</p>
    </div>
  );
}
