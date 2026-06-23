import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ScreenTitle, SectionTitle } from '../components/ui/bits';
import { NeoCard } from '../components/ui/NeoCard';
import { NeoProgress } from '../components/ui/NeoProgress';
import { Orb } from '../components/three/Orb';
import { XPLineChart } from '../components/XPChart';
import { SportDash } from '../components/SportDash';
import { CollapsibleCard } from '../components/ui/CollapsibleCard';
import { useConfig, useData } from '../store/selectors';
import {
  bioStatus,
  buildChartData,
  calcDailyXP,
  compareDailyXP,
  energyText,
  intNum,
  num,
} from '../domain/logic';
import { AVATAR_IMAGES, NUTRI_CONFIG } from '../domain/config';
import { todayRu, dateToRu, ruToInputDate } from '../lib/date';

const STATE_COLOR = { weak: '#ef6f6f', mid: '#f5b14c', god: '#5fd38a' } as const;

interface DiaryRow {
  icon: string;
  label: string;
  xp?: number;
  color: string;
}

function buildDiary(
  data: ReturnType<typeof useData>,
  dateStr: string,
  cfg: ReturnType<typeof useConfig>,
): { rows: DiaryRow[]; total: number } {
  const rows: DiaryRow[] = [];
  let total = 0;
  const push = (icon: string, label: string, color: string, xp?: number) => {
    rows.push({ icon, label, color, xp });
    if (xp) total += xp;
  };

  try {
    const sleep = JSON.parse(data[`slv_sleep_${dateStr}`] || 'null');
    if (sleep) {
      push('💤', `Сон: ${sleep.diff}`, '#9d7be8');
      total += 10;
    }
  } catch { /* ignore */ }

  const air = intNum(data[`slv_air_${dateStr}`]);
  if (air > 0) push('🌬️', `Воздух: ${air} мин`, '#7fd1e8', Math.floor((air / 15) * 5));

  const eLog = (() => {
    try {
      return JSON.parse(data[`slv_energy_log_${dateStr}`] || '[]') as { time: string; val: number }[];
    } catch {
      return [];
    }
  })();
  eLog.forEach((e) => push('🔋', `${e.time} — ${energyText(e.val)}`, '#f5b14c'));

  const water = intNum(data[`slv_water_${dateStr}`]);
  if (water > 0) push('💧', `Выпито: ${water} мл`, '#4cc9f0', Math.floor(water / 100));

  NUTRI_CONFIG.forEach((cat) => {
    const v = num(data[`slv_nutri_${dateStr}_${cat.id}`]);
    if (v > 0) push(cat.emoji, `${cat.label}: ${v} порц.`, cat.color, Math.floor(v * 2));
  });

  cfg.sport.forEach((s) => {
    const c = intNum(data[`slv_sport_${dateStr}_${s.id}`]);
    if (c > 0) push('🥋', `${s.text}: ${c}`, '#ef6f6f', Math.floor(c * s.rate));
  });

  Object.keys(data).forEach((key) => {
    if (key.startsWith(`slv_fizz_${dateStr}_`)) {
      try {
        const d = JSON.parse(data[key] as string);
        push('⚡', d.text, '#f5d04c', d.xp);
      } catch { /* ignore */ }
    }
  });

  cfg.myTasks.forEach((t) => {
    if (data[`slv_${dateStr}_${t.id}`] === 'true') push('✔', t.text, '#4cc9f0', t.xp);
  });
  cfg.bogdanTasks.forEach((t) => {
    if (data[`slv_${dateStr}_${t.id}`] === 'true') push('👦', t.text, '#5fd38a', t.xp);
  });

  try {
    const log = JSON.parse(data[`slv_oneoff_log_${dateStr}`] || '[]') as { text: string; xp: number; type: string }[];
    log.forEach((it) => push(it.type === 'mind' ? '👁️' : '🧹', it.text, '#9d7be8', it.xp));
  } catch { /* ignore */ }

  return { rows, total };
}

export function Stats() {
  const data = useData();
  const cfg = useConfig();
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');
  const [diaryDate, setDiaryDate] = useState(new Date());

  const today = todayRu();
  const bio = useMemo(() => bioStatus(data, today, cfg.sport, cfg.weight), [data, today, cfg]);
  const comp = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const xToday = calcDailyXP(data, today, cfg.myTasks, cfg.bogdanTasks, cfg.sport, cfg.weight);
    const xYest = calcDailyXP(data, dateToRu(y), cfg.myTasks, cfg.bogdanTasks, cfg.sport, cfg.weight);
    return compareDailyXP(xToday, xYest);
  }, [data, today, cfg]);
  const chart = useMemo(
    () => buildChartData(data, period, cfg.myTasks, cfg.bogdanTasks, cfg.sport),
    [data, period, cfg],
  );
  const diaryStr = dateToRu(diaryDate);
  const diary = useMemo(() => buildDiary(data, diaryStr, cfg), [data, diaryStr, cfg]);

  const color = STATE_COLOR[bio.state];
  const hud = [
    { label: 'ВОДА', val: `${bio.waterPct}%`, pct: bio.waterPct, color: '#4cc9f0' },
    { label: 'СОН', val: bio.sleepHours > 0 ? `${bio.sleepHours}ч` : '--', pct: Math.min(100, (bio.sleepHours / 8) * 100), color: '#9d7be8' },
    { label: 'ВОЗДУХ', val: `${bio.air}м`, pct: Math.min(100, (bio.air / 60) * 100), color: '#7fd1e8' },
    { label: 'ПИТАНИЕ', val: `${bio.nutriPct}%`, pct: bio.nutriPct, color: '#5fd38a' },
    { label: 'СПОРТ', val: String(bio.sportCount), pct: bio.sportCount > 0 ? 100 : 0, color: '#ef6f6f' },
  ];

  function shiftDate(d: number) {
    const nd = new Date(diaryDate);
    nd.setDate(nd.getDate() + d);
    setDiaryDate(nd);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <ScreenTitle icon="📊">Статистика</ScreenTitle>
      <div className="mt-4 space-y-4">
        <NeoCard accent="#ffffff" tilt={false}>
          <SectionTitle color="#ffffff">🆚 Битва с собой</SectionTitle>
          <div className="text-center">
            <div className="font-display text-4xl font-bold" style={{ color: comp.color }}>
              {comp.label}
            </div>
            <div className="mt-1 text-sm text-ink-faint">{comp.text}</div>
          </div>
        </NeoCard>

        {/* Bio-core HUD */}
        <NeoCard accent={color} tilt={false}>
          <SectionTitle color={color} right={<span className="font-display text-2xl font-bold" style={{ color }}>{bio.pct}%</span>}>
            🧬 Био-баланс
          </SectionTitle>
          <div className="grid items-center gap-4 sm:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* soft status-coloured halo */}
                <div
                  className="pointer-events-none absolute -inset-3 rounded-full blur-2xl"
                  style={{ background: `radial-gradient(circle, ${color}55, transparent 70%)` }}
                />
                {/* big avatar — the hero */}
                <img
                  src={AVATAR_IMAGES[bio.state]}
                  alt="bio"
                  className="relative h-48 w-48 rounded-full object-cover shadow-neo"
                  style={{ border: `3px solid ${color}`, boxShadow: `0 0 28px -4px ${color}` }}
                />
                {/* spinning orb badge where the avatar used to sit */}
                <div className="absolute -bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-surface p-1 shadow-neo">
                  <Orb color={color} intensity={bio.pct / 100} size={62} />
                </div>
              </div>
              <div className="mt-5 rounded-full px-3 py-1 text-xs font-bold" style={{ color, background: `${color}1a` }}>
                {bio.status}
              </div>
            </div>
            <div className="space-y-2.5">
              {hud.map((h) => (
                <div key={h.label}>
                  <div className="mb-1 flex justify-between text-[11px] font-semibold">
                    <span className="text-ink-faint">{h.label}</span>
                    <span style={{ color: h.color }}>{h.val}</span>
                  </div>
                  <NeoProgress value={h.pct} color={h.color} height={9} />
                </div>
              ))}
            </div>
          </div>
        </NeoCard>

        {/* XP chart */}
        <NeoCard accent="#4cc9f0" tilt={false}>
          <div className="mb-3 flex gap-1 rounded-2xl bg-sunken p-1 shadow-neo-inset-sm">
            {(['month', 'year', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="relative flex-1 rounded-xl py-1.5 text-xs font-semibold"
                style={{ color: period === p ? '#0e141c' : '#9fb0c6' }}
              >
                {period === p && (
                  <motion.span layoutId="chart-tab" className="absolute inset-0 rounded-xl bg-accent" style={{ boxShadow: '0 0 14px -3px #4cc9f0' }} />
                )}
                <span className="relative z-10">{p === 'month' ? 'Месяц' : p === 'year' ? 'Год' : 'Всё время'}</span>
              </button>
            ))}
          </div>
          <div className="h-56">
            {chart.labels.length ? (
              <XPLineChart labels={chart.labels} values={chart.values} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-ink-faint">Нет данных за период</div>
            )}
          </div>
        </NeoCard>

        {/* Sport dashboard */}
        <SportDash />

        {/* Diary */}
        <CollapsibleCard
          icon="📜"
          title="Дневник Дня"
          accent="#ffffff"
          summary={
            <>
              <div className="mb-3 flex items-center gap-2">
                <button onClick={() => shiftDate(-1)} className="grid h-9 w-9 place-items-center rounded-xl bg-surface shadow-neo-sm active:shadow-neo-inset-sm">◀</button>
                <input
                  type="date"
                  value={ruToInputDate(diaryStr)}
                  onChange={(e) => e.target.value && setDiaryDate(new Date(e.target.value))}
                  className="flex-1 rounded-xl bg-sunken px-3 py-2 text-center text-sm text-ink shadow-neo-inset-sm outline-none"
                />
                <button onClick={() => shiftDate(1)} className="grid h-9 w-9 place-items-center rounded-xl bg-surface shadow-neo-sm active:shadow-neo-inset-sm">▶</button>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-sunken px-4 py-2.5 shadow-neo-inset-sm">
                <span className="text-sm text-ink-soft">Опыт:</span>
                <span className="font-display text-xl font-bold text-accent">{Math.floor(diary.total)} XP</span>
              </div>
            </>
          }
        >
          <div className="mt-3 space-y-1.5">
            {diary.rows.length === 0 && <p className="py-4 text-center text-sm text-ink-faint">Нет записей</p>}
            {diary.rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm shadow-neo-sm">
                <span style={{ color: r.color }}>{r.icon}</span>
                <span className="flex-1 text-ink-soft">{r.label}</span>
                {r.xp ? <span className="text-xs font-semibold text-accent">+{r.xp}</span> : null}
              </div>
            ))}
          </div>
        </CollapsibleCard>
      </div>
    </div>
  );
}
