import { motion } from 'framer-motion';

const MOTES = Array.from({ length: 20 }, (_, i) => {
  const r = ((i * 9301 + 49297) % 233280) / 233280;
  const r2 = ((i * 49297 + 9301) % 233280) / 233280;
  return {
    left: `${6 + r * 88}%`,
    top: `${15 + r2 * 78}%`,
    size: 3 + (i % 4),
    dur: 6 + (i % 5) * 1.6,
    delay: `${-(r * 8).toFixed(2)}s`,
    mx: `${20 + r2 * 50}px`,
    my: `${-(30 + r * 60)}px`,
  };
});

/**
 * A breathable atmosphere where progress is clearly visible: a luminous
 * "oxygen" layer rises from the bottom to `pct` of the goal, brightening and
 * thickening as the body gets saturated. Empty + dark at 0, glowing + full at goal.
 */
export function Atmosphere({ pct, height = 130, children }: { pct: number; height?: number; children?: React.ReactNode }) {
  const fill = Math.max(0, Math.min(100, pct)); // visible oxygen level
  const saturated = pct >= 100;
  const light = fill / 100;
  const visibleMotes = Math.max(3, Math.round((MOTES.length * (0.25 + light * 0.75))));

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-neo-inset" style={{ height }}>
      {/* empty night base */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0d1822, #131f29)' }} />

      {/* rising oxygen fog — height shows progress */}
      <motion.div
        className="absolute inset-x-0 bottom-0"
        initial={false}
        animate={{ height: `${fill}%` }}
        transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
        style={{
          background:
            'linear-gradient(0deg, rgba(127,209,232,0.5), rgba(76,201,240,0.22) 55%, rgba(76,201,240,0.04) 100%)',
          boxShadow: saturated ? '0 0 40px 6px rgba(127,209,232,0.45)' : '0 -8px 26px -6px rgba(127,209,232,0.4)',
        }}
      >
        {/* soft luminous crest at the oxygen surface */}
        <div
          className="absolute inset-x-0 -top-2 h-3 blur-[3px]"
          style={{ background: 'linear-gradient(180deg, rgba(180,235,250,0.65), transparent)' }}
        />
      </motion.div>

      {/* breathing field of motes + wind */}
      <motion.div className="absolute inset-0" style={{ animation: `slv-breathe ${saturated ? 4 : 6}s ease-in-out infinite` }}>
        {[18, 46, 74].map((top, i) => (
          <span
            key={top}
            className="absolute h-px w-1/3 rounded-full"
            style={{
              top: `${top}%`,
              background: 'linear-gradient(90deg, transparent, rgba(180,230,245,0.6), transparent)',
              animation: `slv-streak ${7 + i * 2}s linear infinite`,
              animationDelay: `${i * 2.3}s`,
            }}
          />
        ))}
        {MOTES.slice(0, visibleMotes).map((m, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-air blur-[1px]"
            style={{
              left: m.left,
              top: m.top,
              width: m.size,
              height: m.size,
              ['--mote-x' as string]: m.mx,
              ['--mote-y' as string]: m.my,
              ['--mote-opacity' as string]: String(0.35 + light * 0.6),
              animation: `slv-drift ${m.dur}s ease-in-out infinite`,
              animationDelay: m.delay,
            }}
          />
        ))}
      </motion.div>

      <div className="absolute inset-0 grid place-items-center">{children}</div>

      {/* saturation badge */}
      {saturated && (
        <div className="absolute right-2 top-2 rounded-full bg-air/20 px-2 py-0.5 text-[10px] font-bold text-air">
          O₂ насыщен
        </div>
      )}
    </div>
  );
}
