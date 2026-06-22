'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useVocab } from '@/context/useVocab';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

const TONE_STYLES = {
  success: 'border-sage/40 text-sage-light',
  error: 'border-clay/40 text-clay-light',
  info: 'border-amber/40 text-amber-light',
} as const;

export function ToastStack() {
  const { toasts, dismissToast } = useVocab();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:top-6">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.tone];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className={`pointer-events-auto flex items-center gap-2 rounded-2xl border bg-ink-800/95 px-4 py-2.5 font-sans text-sm shadow-card backdrop-blur ${TONE_STYLES[toast.tone]}`}
              onClick={() => dismissToast(toast.id)}
              role="status"
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-paper-100">{toast.text}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
