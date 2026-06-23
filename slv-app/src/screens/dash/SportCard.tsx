import { useState } from 'react';
import { NeoCard } from '../../components/ui/NeoCard';
import { SectionTitle } from '../../components/ui/bits';
import { useConfig, useData } from '../../store/selectors';
import { intNum } from '../../domain/logic';
import { changeSport } from '../../store/actions';
import { fireXP } from '../../lib/fx';
import { todayRu } from '../../lib/date';
import type { SportExercise } from '../../domain/config';

const SPORT = '#ef6f6f';

/**
 * One exercise row. The input is a *buffer*: you type what you just did, hit ✓,
 * the amount is added to today's stored total (which Stats sums per day) and the
 * input resets to 0 — so a morning 50 + a lunch 50 accumulate to 100.
 */
function ExerciseRow({ ex, total }: { ex: SportExercise; total: number }) {
  const [buf, setBuf] = useState('');

  function commit(x: number, y: number) {
    const amt = parseInt(buf, 10);
    if (!amt) return;
    changeSport(ex.id, amt, ex.rate);
    if (amt > 0) fireXP(x, y, Math.max(1, Math.floor(amt * ex.rate)), SPORT);
    setBuf('');
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 shadow-neo-sm">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-ink">{ex.text}</div>
        <div className="text-[11px] text-ink-faint">
          сегодня:{' '}
          <span className="font-bold" style={{ color: SPORT }}>
            {total}
          </span>
        </div>
      </div>
      <input
        type="number"
        inputMode="numeric"
        value={buf}
        placeholder="0"
        onChange={(e) => setBuf(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const r = e.currentTarget.getBoundingClientRect();
            commit(r.right, r.top + r.height / 2);
          }
        }}
        className="w-16 rounded-xl bg-sunken py-1.5 text-center text-sm font-bold text-ink shadow-neo-inset-sm outline-none"
      />
      <button
        title="Записать в статистику"
        aria-label="Записать"
        onClick={(e) => commit(e.clientX, e.clientY)}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-bold transition-shadow active:shadow-neo-inset-sm"
        style={{
          background: SPORT,
          color: '#0e141c',
          boxShadow: `2px 2px 6px #11151c, -2px -2px 6px #252f3e, 0 0 14px -3px ${SPORT}`,
        }}
      >
        ✓
      </button>
    </div>
  );
}

export function SportCard() {
  const data = useData();
  const { sport } = useConfig();
  const t = todayRu();

  return (
    <NeoCard accent={SPORT}>
      <SectionTitle icon="🥋" color={SPORT} center>
        Тренировка БимПаста
      </SectionTitle>
      <p className="mb-2 text-center text-[11px] text-ink-faint">Введи сделанное и нажми ✓ — улетит в дневной итог</p>
      <div className="space-y-2">
        {sport.length === 0 && <p className="py-4 text-center text-sm text-ink-faint">Добавь упражнения в Редакторе.</p>}
        {sport.map((ex) => (
          <ExerciseRow key={ex.id} ex={ex} total={intNum(data[`slv_sport_${t}_${ex.id}`])} />
        ))}
      </div>
    </NeoCard>
  );
}
