import { useEffect, useMemo, useState } from 'react';
import { motion, animate, useMotionValue } from 'framer-motion';
import { NeoCard } from './ui/NeoCard';
import { NeoProgress } from './ui/NeoProgress';
import { SectionTitle } from './ui/bits';
import { CollapsibleCard } from './ui/CollapsibleCard';
import { MetricBarChart, MetricLineChart } from './XPChart';
import { useConfig, useData } from '../store/selectors';
import { buildSportStats } from '../domain/logic';

const SPORT = '#ef6f6f';
const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
type Period = 'days' | 'months' | 'all';

/** Smooth count-up number — futuristic odometer feel. */
function Counter({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const [d, setD] = useState(value);
  useEffect(() => {
    // A correct number matters more than the count-up: if the tab is in the
    // background (rAF frozen) or the user prefers reduced motion, snap to final.
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.hidden || reduced) {
      setD(value);
      return;
    }
    mv.set(0);
    const controls = animate(mv, value, {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setD(Math.round(v)),
    });
    return () => controls.stop();
    // mv is stable across renders
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return <>{d.toLocaleString('ru-RU')}</>;
}

function StatTile({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-2xl bg-sunken px-3 py-3 text-center shadow-neo-inset-sm">
      <div className="font-display text-2xl font-bold leading-none" style={{ color: accent }}>
        <Counter value={value} />
      </div>
      <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</div>
    </div>
  );
}

function parseRu(d: string): Date {
  const [dd, mm, yyyy] = d.split('.');
  return new Date(`${yyyy}-${mm}-${dd}`);
}

export function SportDash() {
  const data = useData();
  const { sport } = useConfig();
  const [period, setPeriod] = useState<Period>('days');

  const s = useMemo(() => buildSportStats(data, sport), [data, sport]);

  // --- chart series per period ---
  const chart = useMemo(() => {
    if (period === 'days') {
      const last = s.heat.slice(-21);
      return { kind: 'bar' as const, labels: last.map((h) => h.date.slice(0, 5)), values: last.map((h) => h.reps) };
    }
    if (period === 'months') {
      return { kind: 'bar' as const, labels: s.monthly.map((m) => m.label), values: s.monthly.map((m) => m.reps) };
    }
    return { kind: 'line' as const, labels: s.monthly.map((m) => m.label), values: s.monthly.map((m) => m.cumulative) };
  }, [period, s]);

  const maxHeat = Math.max(1, ...s.heat.map((h) => h.reps));
  const maxWd = Math.max(1, ...s.weekday);
  const maxEx = Math.max(1, ...s.perExercise.map((e) => e.total));

  // pad heat so first column starts on Monday
  const heatCells = useMemo(() => {
    if (!s.heat.length) return [];
    const lead = (parseRu(s.heat[0].date).getDay() + 6) % 7;
    return [...Array(lead).fill(null), ...s.heat];
  }, [s.heat]);

  if (s.totalAll === 0) {
    return (
      <NeoCard accent={SPORT} tilt={false}>
        <SectionTitle icon="🥋" color={SPORT}>
          Спорт-трекер
        </SectionTitle>
        <p className="py-6 text-center text-sm text-ink-faint">
          Пока нет тренировок. Добавь повторения на Дашборде — и здесь оживёт прогресс.
        </p>
      </NeoCard>
    );
  }

  return (
    <CollapsibleCard
      icon="🥋"
      title="Спорт-трекер"
      accent={SPORT}
      right={
        s.streak > 0 ? (
          <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold" style={{ color: SPORT, background: `${SPORT}1a` }}>
            🔥 {s.streak} дн
          </span>
        ) : undefined
      }
      summary={
        <>
          {/* Hero: all-time reps */}
          <div className="relative mb-4 overflow-hidden rounded-2xl bg-sunken px-4 py-5 text-center shadow-neo-inset-sm">
            <div
              className="pointer-events-none absolute -inset-10 opacity-40 blur-3xl"
              style={{ background: `radial-gradient(circle at 50% 120%, ${SPORT}, transparent 60%)` }}
            />
            <div className="relative">
              <div className="font-display text-5xl font-bold tracking-tight" style={{ color: SPORT, textShadow: `0 0 24px ${SPORT}66` }}>
                <Counter value={s.totalAll} />
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">повторений всего</div>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-4 gap-2">
            <StatTile label="Сегодня" value={s.totalToday} accent="#5fd38a" />
            <StatTile label="Неделя" value={s.totalWeek} accent="#4cc9f0" />
            <StatTile label="Месяц" value={s.totalMonth} accent="#f5b14c" />
            <StatTile label="Рекорд" value={s.bestDay?.reps ?? 0} accent="#9d7be8" />
          </div>
        </>
      }
    >
      {/* Period toggle + chart */}
      <div className="h-4" />
      <div className="mb-3 flex gap-1 rounded-2xl bg-sunken p-1 shadow-neo-inset-sm">
        {(['days', 'months', 'all'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="relative flex-1 rounded-xl py-1.5 text-xs font-semibold"
            style={{ color: period === p ? '#0e141c' : '#9fb0c6' }}
          >
            {period === p && (
              <motion.span layoutId="sport-tab" className="absolute inset-0 rounded-xl" style={{ background: SPORT, boxShadow: `0 0 14px -3px ${SPORT}` }} />
            )}
            <span className="relative z-10">{p === 'days' ? 'Дни' : p === 'months' ? 'Месяцы' : 'Всё время'}</span>
          </button>
        ))}
      </div>
      <div className="h-52">
        {chart.labels.length ? (
          chart.kind === 'bar' ? (
            <MetricBarChart labels={chart.labels} values={chart.values} color={SPORT} unit="повт." />
          ) : (
            <MetricLineChart labels={chart.labels} values={chart.values} color={SPORT} unit="всего" />
          )
        ) : (
          <div className="grid h-full place-items-center text-sm text-ink-faint">Нет данных за период</div>
        )}
      </div>
      {period === 'all' && (
        <p className="mt-1 text-center text-[11px] text-ink-faint">Накопительный итог: {s.activeDays} активных дней · ~{s.avgPerActiveDay} повт./день</p>
      )}

      {/* Per-exercise breakdown */}
      <div className="mt-5 space-y-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">По упражнениям · всё время</div>
        {s.perExercise.map((ex) => (
          <div key={ex.id}>
            <div className="mb-1 flex justify-between text-xs font-semibold">
              <span className="text-ink-soft">
                {ex.text}
                {ex.today > 0 && <span className="ml-1.5 rounded-full bg-surface px-1.5 py-0.5 text-[10px] text-ink-faint">+{ex.today} сегодня</span>}
              </span>
              <span style={{ color: SPORT }}>{ex.total.toLocaleString('ru-RU')}</span>
            </div>
            <NeoProgress value={(ex.total / maxEx) * 100} color={SPORT} height={9} />
          </div>
        ))}
      </div>

      {/* Weekday profile */}
      <div className="mt-5">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Ритм недели</div>
        <div className="flex items-end justify-between gap-1.5" style={{ height: 72 }}>
          {s.weekday.map((v, i) => {
            const h = Math.max(6, (v / maxWd) * 100);
            const isTop = v === maxWd && v > 0;
            return (
              <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
                <div className="relative flex w-full flex-1 items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18, delay: i * 0.04 }}
                    className="w-full rounded-md"
                    style={{
                      background: isTop ? SPORT : `${SPORT}66`,
                      boxShadow: isTop ? `0 0 10px ${SPORT}88` : 'none',
                      minHeight: 4,
                    }}
                    title={`${WD[i]}: ${v} повт.`}
                  />
                </div>
                <span className="text-[10px] text-ink-faint">{WD[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap — contribution grid */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Карта активности · {s.heat.length} дней</span>
          <span className="flex items-center gap-1 text-[10px] text-ink-faint">
            меньше
            {[0.08, 0.3, 0.55, 0.8, 1].map((a, i) => (
              <span key={i} className="h-2.5 w-2.5 rounded-sm" style={{ background: i === 0 ? 'rgba(255,255,255,0.06)' : `${SPORT}`, opacity: i === 0 ? 1 : a }} />
            ))}
            больше
          </span>
        </div>
        <div className="overflow-x-auto pb-1">
          <div
            className="grid w-max gap-1"
            style={{ gridTemplateRows: 'repeat(7, 12px)', gridAutoFlow: 'column', gridAutoColumns: '12px' }}
          >
            {heatCells.map((cell, i) =>
              cell === null ? (
                <div key={`p${i}`} />
              ) : (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.reps} повт.`}
                  className="h-3 w-3 rounded-[3px]"
                  style={
                    cell.reps === 0
                      ? { background: 'rgba(255,255,255,0.05)' }
                      : {
                          background: SPORT,
                          opacity: 0.25 + 0.75 * Math.min(1, cell.reps / maxHeat),
                          boxShadow: cell.reps >= maxHeat ? `0 0 6px ${SPORT}` : 'none',
                        }
                  }
                />
              ),
            )}
          </div>
        </div>
      </div>
    </CollapsibleCard>
  );
}
