import { motion } from 'framer-motion';
import type { ReactNode, MouseEvent as ReactMouseEvent } from 'react';
import { cn } from '../../lib/cn';

interface NeoButtonProps {
  children: ReactNode;
  onClick?: (e: ReactMouseEvent) => void;
  className?: string;
  accent?: string;
  variant?: 'raised' | 'flat' | 'accent';
  disabled?: boolean;
  title?: string;
  type?: 'button' | 'submit';
}

export function NeoButton({
  children,
  onClick,
  className,
  accent = '#4cc9f0',
  variant = 'raised',
  disabled,
  title,
  type = 'button',
}: NeoButtonProps) {
  return (
    <motion.button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      className={cn(
        'select-none rounded-2xl px-4 py-2.5 text-sm font-semibold transition-shadow duration-150',
        'shadow-neo-sm active:shadow-neo-inset-sm disabled:opacity-40 disabled:active:shadow-neo-sm',
        variant === 'flat' && 'bg-surface text-ink-soft',
        variant === 'raised' && 'bg-surface text-ink',
        variant === 'accent' && 'text-base',
        className,
      )}
      style={
        variant === 'accent'
          ? { background: accent, color: '#0e141c', boxShadow: `4px 4px 9px #11151c, -4px -4px 9px #252f3e, 0 0 16px -3px ${accent}` }
          : undefined
      }
    >
      {children}
    </motion.button>
  );
}

/** Small round neumorphic icon button (e.g. +/- steppers). */
export function NeoIconButton({
  children,
  onClick,
  accent,
  className,
  disabled,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  accent?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <motion.button
      aria-label={ariaLabel}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      onClick={onClick}
      className={cn(
        'grid h-10 w-10 place-items-center rounded-full bg-surface text-lg font-bold text-ink shadow-neo-sm',
        'active:shadow-neo-inset-sm disabled:opacity-40',
        className,
      )}
      style={accent ? { color: accent } : undefined}
    >
      {children}
    </motion.button>
  );
}
