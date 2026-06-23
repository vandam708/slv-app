import { useState } from 'react';
import { motion } from 'framer-motion';
import { NeoCard } from '../../components/ui/NeoCard';
import { NeoButton } from '../../components/ui/NeoButton';
import { SectionTitle } from '../../components/ui/bits';
import { Orb } from '../../components/three/Orb';
import { useData } from '../../store/selectors';
import { energyText } from '../../domain/logic';
import { logEnergy } from '../../store/actions';
import { todayRu } from '../../lib/date';

function energyColor(v: number): string {
  if (v <= 2) return '#ef6f6f';
  if (v <= 4) return '#f5984c';
  if (v <= 6) return '#f5d04c';
  if (v <= 8) return '#5fd38a';
  return '#4cc9f0';
}

interface LogItem {
  time: string;
  val: number;
}

export function EnergyCard() {
  const data = useData();
  const t = todayRu();
  let log: LogItem[] = [];
  try {
    log = JSON.parse(data[`slv_energy_log_${t}`] || '[]');
  } catch { /* ignore */ }
  const last = log.length ? log[log.length - 1].val : 5;
  const [val, setVal] = useState(last);
  const color = energyColor(val);

  return (
    <NeoCard accent={color}>
      <SectionTitle icon="🔋" color={color} center>
        Моя Энергия
      </SectionTitle>
      <div className="flex items-center gap-4">
        <div className="relative grid shrink-0 place-items-center">
          <div
            className="absolute h-28 w-28 rounded-full"
            style={{ background: `radial-gradient(circle, ${color}22, transparent 70%)` }}
          />
          <Orb color={color} intensity={val / 10} size={130} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold" style={{ color }}>
              {val}
            </span>
            <span className="text-sm font-semibold text-ink-soft">{energyText(val)}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={val}
            onChange={(e) => setVal(+e.target.value)}
            className="neo-range w-full"
            style={{ ['--range-glow' as string]: color }}
          />
          <NeoButton accent={color} variant="accent" className="mt-3 w-full" onClick={() => logEnergy(val)}>
            ⏱ Записать состояние
          </NeoButton>
        </div>
      </div>
      {log.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {log.slice(-4).reverse().map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between rounded-xl bg-sunken px-3 py-1.5 text-xs shadow-neo-inset-sm"
            >
              <span className="text-ink-faint">{e.time}</span>
              <span style={{ color: energyColor(e.val) }} className="font-semibold">
                {energyText(e.val)}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </NeoCard>
  );
}
