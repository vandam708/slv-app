import { motion } from 'framer-motion';
import { ScreenTitle } from '../components/ui/bits';
import { NeoCard } from '../components/ui/NeoCard';
import { MASTERS } from '../domain/config';

export function Masters() {
  return (
    <div className="mx-auto max-w-3xl">
      <ScreenTitle icon="👥">Совет Мастеров</ScreenTitle>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MASTERS.map((m, i) => (
          <motion.div key={m.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <NeoCard accent={m.color}>
              <div className="flex items-center gap-4">
                <div
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sunken text-2xl shadow-neo-inset-sm"
                  style={{ boxShadow: `inset 3px 3px 6px #11151c, inset -3px -3px 6px #252f3e, 0 0 16px -4px ${m.color}` }}
                >
                  {m.emoji}
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-ink">{m.name}</div>
                  <div className="text-sm" style={{ color: m.color }}>
                    {m.role}
                  </div>
                </div>
              </div>
            </NeoCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
