import { motion } from 'framer-motion';

function Wave({ color, opacity, duration, delay = '0s' }: { color: string; opacity: number; duration: number; delay?: string }) {
  return (
    <svg
      className="absolute -top-[11px] left-0 h-4 w-[200%]"
      viewBox="0 0 1200 30"
      preserveAspectRatio="none"
      style={{ animation: `slv-wave ${duration}s linear infinite`, animationDelay: delay }}
    >
      <path d="M0 15 Q 150 2 300 15 T 600 15 T 900 15 T 1200 15 V30 H0 Z" fill={color} opacity={opacity} />
    </svg>
  );
}

/**
 * A real liquid vessel: fills bottom-up to `pct`, with two layered animated
 * wave crests on the surface and rising bubbles. Reads as water, not a bar.
 */
export function Liquid({
  pct,
  color = '#4cc9f0',
  height = 156,
  label,
}: {
  pct: number;
  color?: string;
  height?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const bubbles = [
    { left: '18%', size: 6, dur: 4.2, delay: '0s' },
    { left: '34%', size: 4, dur: 5.1, delay: '1.4s' },
    { left: '52%', size: 7, dur: 3.6, delay: '0.7s' },
    { left: '68%', size: 5, dur: 4.8, delay: '2.1s' },
    { left: '82%', size: 4, dur: 5.6, delay: '1s' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-sunken shadow-neo-inset" style={{ height }}>
      {/* water body */}
      <motion.div
        className="absolute inset-x-0 bottom-0"
        initial={false}
        animate={{ height: `${clamped}%` }}
        transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
        style={{
          background: `linear-gradient(180deg, ${color}, ${color}aa 40%, ${color}66)`,
          boxShadow: `0 -6px 24px -4px ${color}`,
        }}
      >
        <Wave color={color} opacity={0.55} duration={5} />
        <Wave color="#ffffff" opacity={0.22} duration={3.4} delay="-1.2s" />
        {/* bubbles */}
        {clamped > 6 &&
          bubbles.map((b, i) => (
            <span
              key={i}
              className="absolute bottom-0 rounded-full bg-white/60"
              style={{
                left: b.left,
                width: b.size,
                height: b.size,
                animation: `slv-bubble ${b.dur}s ease-in infinite`,
                animationDelay: b.delay,
              }}
            />
          ))}
      </motion.div>

      {/* glass sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(110deg, rgba(255,255,255,0.06), transparent 40%)' }} />

      {label && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{label}</span>
        </div>
      )}
    </div>
  );
}
