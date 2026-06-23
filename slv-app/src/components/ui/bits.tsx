import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function SectionTitle({
  icon,
  children,
  color = '#4cc9f0',
  right,
  center = false,
}: {
  icon?: ReactNode;
  children: ReactNode;
  color?: string;
  right?: ReactNode;
  center?: boolean;
}) {
  if (center) {
    return (
      <div className="relative mb-3 flex items-center justify-center">
        <h3 className="flex items-center gap-2 font-display text-[15px] font-bold tracking-wide" style={{ color }}>
          {icon && <span className="text-lg">{icon}</span>}
          {children}
        </h3>
        {right && <div className="absolute right-0">{right}</div>}
      </div>
    );
  }
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 font-display text-[15px] font-bold tracking-wide" style={{ color }}>
        {icon && <span className="text-lg">{icon}</span>}
        {children}
      </h3>
      {right}
    </div>
  );
}

export function ScreenTitle({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-1 flex items-center gap-3 font-display text-2xl font-bold text-ink"
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.h2>
  );
}

/** Neumorphic toggle pill used as a task checkbox. */
export function NeoCheck({
  checked,
  onChange,
  color = '#4cc9f0',
}: {
  checked: boolean;
  onChange: () => void;
  color?: string;
}) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative grid h-7 w-7 shrink-0 place-items-center rounded-xl transition-all duration-200',
        checked ? 'shadow-neo-inset-sm' : 'bg-surface shadow-neo-sm',
      )}
      style={checked ? { background: color, boxShadow: `inset 2px 2px 5px rgba(0,0,0,.4), 0 0 12px -2px ${color}` } : undefined}
    >
      {checked && (
        <motion.svg
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0e141c"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </motion.svg>
      )}
    </button>
  );
}

export function Pill({ children, color = '#4cc9f0' }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={{ color, background: `${color}1a` }}
    >
      {children}
    </span>
  );
}

export function NeoInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-xl bg-sunken px-3.5 py-2.5 text-sm text-ink shadow-neo-inset-sm outline-none',
        'placeholder:text-ink-faint focus:ring-1 focus:ring-accent/40',
        props.className,
      )}
    />
  );
}
