import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NeoCard } from './NeoCard';

/**
 * NeoCard with a centered title, a left-side triangle toggle, an always-visible
 * brief summary, and collapsible detail content underneath.
 */
export function CollapsibleCard({
  icon,
  title,
  accent,
  right,
  summary,
  children,
  defaultOpen = false,
}: {
  icon?: ReactNode;
  title: ReactNode;
  accent: string;
  right?: ReactNode;
  summary?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <NeoCard accent={accent} tilt={false}>
      <div className="relative mb-3 flex items-center">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Свернуть' : 'Развернуть'}
          className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-surface shadow-neo-sm active:shadow-neo-inset-sm"
        >
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          >
            <path d="M3.2 1.4 L9.4 6 L3.2 10.6 Z" fill={accent} />
          </motion.svg>
        </button>
        <h3
          className="pointer-events-none absolute inset-x-0 flex items-center justify-center gap-2 font-display text-[15px] font-bold tracking-wide"
          style={{ color: accent }}
        >
          {icon && <span className="text-lg">{icon}</span>}
          {title}
        </h3>
        <div className="relative z-10 ml-auto flex h-8 items-center">{right}</div>
      </div>

      {summary}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </NeoCard>
  );
}
