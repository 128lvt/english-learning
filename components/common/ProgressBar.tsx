interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));

  return (
    <div>
      {label ? (
        <div className="mb-2 flex items-baseline justify-between font-sans text-sm text-paper-400">
          <span>{label}</span>
          <span className="font-mono text-amber-light">{percent}%</span>
        </div>
      ) : null}
      <div className="h-3 w-full overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-dark via-amber to-amber-light transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
