import { useState } from 'react';
import { NeoCard } from '../../components/ui/NeoCard';
import { NeoButton } from '../../components/ui/NeoButton';
import { SectionTitle, NeoInput } from '../../components/ui/bits';
import { SleepClock } from '../../components/viz/SleepClock';
import { useData } from '../../store/selectors';
import { saveSleep } from '../../store/actions';
import { todayRu } from '../../lib/date';

const SLEEP = '#9d7be8';

function computeDiff(start: string, end: string): string {
  if (!start || !end) return '-- ч -- мин';
  const s = new Date(`2000-01-01T${start}`);
  const e = new Date(`2000-01-01T${end}`);
  if (e < s) e.setDate(e.getDate() + 1);
  const ms = +e - +s;
  return `${Math.floor(ms / 3600000)} ч ${Math.floor((ms % 3600000) / 60000)} мин`;
}

export function SleepCard() {
  const data = useData();
  const t = todayRu();
  let saved: { start?: string; end?: string; diff?: string } = {};
  try {
    saved = JSON.parse(data[`slv_sleep_${t}`] || '{}');
  } catch { /* ignore */ }
  const [start, setStart] = useState(saved.start || '');
  const [end, setEnd] = useState(saved.end || '');

  const liveDiff = computeDiff(start, end);

  return (
    <NeoCard accent={SLEEP}>
      <SectionTitle icon="💤" color={SLEEP} center>
        Сон (Режим)
      </SectionTitle>
      <SleepClock start={start} end={end} duration={liveDiff} />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs text-ink-faint">🌙 Лёг спать</span>
          <NeoInput type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-ink-faint">☀️ Встал</span>
          <NeoInput type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>
      <NeoButton accent={SLEEP} variant="accent" className="mt-3 w-full" onClick={() => saveSleep(start, end)}>
        💾 Сохранить
      </NeoButton>
    </NeoCard>
  );
}
