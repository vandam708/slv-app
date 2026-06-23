import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

interface NeoProgressProps {
  value: number; // 0..100
  color?: string;
  className?: string;
  height?: number;
  label?: string;
}

export function NeoProgress({ value, color = '#4cc9f0', className, height = 16, label }: NeoProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn('relative w-full overflow-hidden rounded-full bg-sunken shadow-neo-inset-sm', className)}
      style={{ height }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', bounce: 0, duration: 0.55 }}
        style={{
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          boxShadow: `0 0 14px -1px ${color}`,
        }}
      />
      {label && (
        <span className="absolute inset-0 grid place-items-center text-[11px] font-bold text-ink/90 mix-blend-screen">
          {label}
        </span>
      )}
    </div>
  );
}
