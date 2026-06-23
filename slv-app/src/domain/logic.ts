// Pure domain logic ported 1:1 from the original engines.
// All functions operate on a flat data map (key -> string), matching the localStorage scheme.

import { XP_PER_LEVEL, NUTRI_CONFIG, type Task, type SportExercise } from './config';

export type DataMap = Record<string, string | undefined>;

export function num(v: string | undefined | null, fallback = 0): number {
  if (v === undefined || v === null) return fallback;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

export function intNum(v: string | undefined | null, fallback = 0): number {
  if (v === undefined || v === null) return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

// --- XP / levels ---
export function normalizeXp(value: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n)) return 0;
  return n < 0 ? 0 : n;
}

export function levelInfo(totalXp: number, perLevel = XP_PER_LEVEL) {
  const safe = normalizeXp(totalXp);
  const per = Math.max(1, perLevel || 150);
  const level = Math.floor(safe / per) + 1;
  const progress = ((safe % per) / per) * 100;
  return { totalXp: safe, level, progress };
}

// --- Energy ---
export function energyText(val: number): string {
  const n = Number(val);
  if (!Number.isFinite(n)) return '😐 Норма';
  if (n <= 2) return '🧟 Зомби';
  if (n <= 4) return '🐢 Вялость';
  if (n <= 6) return '😐 Норма';
  if (n <= 8) return '💪 Бодрость';
  return '🚀 Ракета';
}

// --- Daily XP (used by chart, comparison, diary) ---
export function calcDailyXP(
  data: DataMap,
  dateStr: string,
  myTasks: Task[],
  bogdanTasks: Task[],
  sport: SportExercise[],
  weight: number,
): number {
  let dXP = 0;
  [...myTasks, ...bogdanTasks].forEach((t) => {
    if (data[`slv_${dateStr}_${t.id}`] === 'true') dXP += t.xp || 10;
  });
  dXP += num(data[`slv_water_${dateStr}`]) / 100;
  dXP += (num(data[`slv_air_${dateStr}`]) / 15) * 5;
  sport.forEach((s) => {
    const c = intNum(data[`slv_sport_${dateStr}_${s.id}`]);
    if (c > 0) dXP += c * s.rate;
  });
  Object.keys(data).forEach((key) => {
    if (key.startsWith(`slv_fizz_${dateStr}_`)) {
      try {
        dXP += JSON.parse(data[key] as string).xp || 5;
      } catch { /* ignore */ }
    }
  });
  NUTRI_CONFIG.forEach((cat) => {
    dXP += num(data[`slv_nutri_${dateStr}_${cat.id}`]) * 2;
  });
  if (data[`slv_sleep_${dateStr}`]) dXP += 10;
  void weight;
  try {
    const log = JSON.parse(data[`slv_oneoff_log_${dateStr}`] || '[]');
    (log as { xp: number }[]).forEach((it) => (dXP += it.xp));
  } catch { /* ignore */ }
  return dXP;
}

// --- Comparison (today vs yesterday) ---
export interface CompResult {
  label: string;
  color: string;
  text: string;
}

export function compareDailyXP(today: number, yest: number): CompResult {
  if (yest === 0) {
    if (today > 0) return { label: '🚀 СТАРТ!', color: '#5fd38a', text: 'Вчера активности не было' };
    return { label: '😴 Zzz...', color: '#647082', text: 'Пока нет данных для сравнения' };
  }
  const diff = today - yest;
  const percent = ((diff / yest) * 100).toFixed(1);
  if (diff > 0) return { label: `+${percent}% 📈`, color: '#5fd38a', text: `Ты лучше, чем вчера на ${Math.floor(diff)} XP` };
  if (diff < 0) return { label: `${percent}% 📉`, color: '#ef6f6f', text: `Отстаёшь от вчерашнего на ${Math.floor(Math.abs(diff))} XP` };
  return { label: '= 0%', color: '#f5b14c', text: 'Идёшь ровно в графике вчерашнего дня' };
}

// --- Avatar / bio-balance score ---
export interface BioStatus {
  pct: number;
  state: 'weak' | 'mid' | 'god';
  status: string;
  statusColor: string;
  waterPct: number;
  sleepHours: number;
  air: number;
  nutriPct: number;
  sportCount: number;
}

export function bioStatus(
  data: DataMap,
  dateStr: string,
  sport: SportExercise[],
  weight: number,
): BioStatus {
  let rawScore = 0;
  let sleepHours = 0;
  try {
    const sleep = JSON.parse(data[`slv_sleep_${dateStr}`] || 'null');
    if (sleep) sleepHours = parseInt(sleep.diff);
  } catch { /* ignore */ }
  if (sleepHours >= 7.5) rawScore += 30;
  else if (sleepHours >= 6) rawScore += 20;
  else if (sleepHours >= 4) rawScore += 10;

  const water = intNum(data[`slv_water_${dateStr}`]);
  const waterGoal = weight * 30;
  const waterPct = waterGoal > 0 ? Math.min(1, water / waterGoal) : 0;
  rawScore += waterPct * 25;

  let nutriCount = 0;
  let activeCategories = 0;
  NUTRI_CONFIG.forEach((cat) => {
    const val = num(data[`slv_nutri_${dateStr}_${cat.id}`]);
    if (val >= 0.5) activeCategories++;
    if (val >= 1) nutriCount++;
  });
  const nutriScore = (nutriCount / 5) * 15;
  const varietyMultiplier = activeCategories === 0 ? 0 : activeCategories === 1 ? 0.3 : activeCategories === 2 ? 0.6 : 1.0;
  rawScore += nutriScore * varietyMultiplier;

  let sportCount = 0;
  sport.forEach((ex) => {
    if (intNum(data[`slv_sport_${dateStr}_${ex.id}`]) > 0) sportCount++;
  });
  if (sportCount > 0) rawScore += 15;

  const air = intNum(data[`slv_air_${dateStr}`]);
  const airPct = Math.min(1, air / 60);
  rawScore += airPct * 15;

  let multiplier = 1.0;
  if (sleepHours < 4) multiplier *= 0.4;
  else if (sleepHours < 6) multiplier *= 0.8;
  if (waterPct < 0.3) multiplier *= 0.6;
  if (sportCount === 0 && air === 0) multiplier *= 0.7;

  let finalPct = Math.floor(rawScore * multiplier);
  if (finalPct > 100) finalPct = 100;

  let state: 'weak' | 'mid' | 'god' = 'weak';
  let status = 'ИСТОЩЕНИЕ';
  let statusColor = '#ef6f6f';
  if (finalPct < 40) {
    state = 'weak';
    status = 'ИСТОЩЕНИЕ';
    statusColor = '#ef6f6f';
  } else if (finalPct < 75) {
    state = 'mid';
    status = 'СТАБИЛЬНОСТЬ';
    statusColor = '#f5b14c';
  } else if (sportCount > 0) {
    state = 'god';
    status = 'ПИКОВАЯ ФОРМА';
    statusColor = '#5fd38a';
  } else {
    state = 'mid';
    status = 'НУЖЕН СПОРТ';
    statusColor = '#f5b14c';
  }

  return {
    pct: finalPct,
    state,
    status,
    statusColor,
    waterPct: Math.floor(waterPct * 100),
    sleepHours,
    air,
    nutriPct: Math.floor(((nutriScore * varietyMultiplier) / 15) * 100),
    sportCount,
  };
}

// --- Sport tracker (per-day / per-month / all-time rep totals) ---
export interface SportExerciseStat {
  id: string;
  text: string;
  total: number;
  today: number;
}

export interface SportStats {
  totalAll: number;
  totalToday: number;
  totalWeek: number;
  totalMonth: number;
  activeDays: number;
  bestDay: { date: string; reps: number } | null;
  streak: number;
  avgPerActiveDay: number;
  perExercise: SportExerciseStat[];
  daily: { date: string; reps: number }[]; // ascending, only days with reps
  monthly: { key: string; label: string; reps: number; cumulative: number }[];
  weekday: number[]; // Mon..Sun totals
  heat: { date: string; reps: number }[]; // continuous last `heatDays` days
}

const MONTHS_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

function parseRuDate(d: string): Date {
  const [dd, mm, yyyy] = d.split('.');
  return new Date(`${yyyy}-${mm}-${dd}`);
}

export function buildSportStats(
  data: DataMap,
  sport: SportExercise[],
  heatDays = 126,
): SportStats {
  const dayTotals: Record<string, number> = {};
  const exTotals: Record<string, number> = {};

  Object.keys(data).forEach((key) => {
    if (!key.startsWith('slv_sport_')) return;
    const parts = key.split('_');
    if (parts.length < 4) return;
    const date = parts[2];
    const id = parts.slice(3).join('_');
    const reps = intNum(data[key]);
    if (reps <= 0) return;
    dayTotals[date] = (dayTotals[date] || 0) + reps;
    exTotals[id] = (exTotals[id] || 0) + reps;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toLocaleDateString('ru-RU');

  const days = Object.keys(dayTotals).sort((a, b) => +parseRuDate(a) - +parseRuDate(b));
  const totalAll = days.reduce((s, d) => s + dayTotals[d], 0);
  const totalToday = dayTotals[todayStr] || 0;

  const weekCut = new Date(today);
  weekCut.setDate(today.getDate() - 6);
  const monthKeyNow = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  let totalWeek = 0;
  let totalMonth = 0;
  const monthMap: Record<string, number> = {};
  const weekday = [0, 0, 0, 0, 0, 0, 0];
  let bestDay: { date: string; reps: number } | null = null;

  days.forEach((d) => {
    const dt = parseRuDate(d);
    const reps = dayTotals[d];
    if (dt >= weekCut) totalWeek += reps;
    const mk = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    if (mk === monthKeyNow) totalMonth += reps;
    monthMap[mk] = (monthMap[mk] || 0) + reps;
    weekday[(dt.getDay() + 6) % 7] += reps;
    if (!bestDay || reps > bestDay.reps) bestDay = { date: d, reps };
  });

  let running = 0;
  const monthly = Object.keys(monthMap)
    .sort()
    .map((k) => {
      const [y, m] = k.split('-');
      running += monthMap[k];
      return { key: k, label: `${MONTHS_RU[+m - 1]} ${y.slice(2)}`, reps: monthMap[k], cumulative: running };
    });

  // current streak: consecutive days with reps ending today (or yesterday)
  const daySet = new Set(days);
  const cur = new Date(today);
  if (!daySet.has(cur.toLocaleDateString('ru-RU'))) cur.setDate(cur.getDate() - 1);
  let streak = 0;
  while (daySet.has(cur.toLocaleDateString('ru-RU'))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }

  const heat: { date: string; reps: number }[] = [];
  for (let i = heatDays - 1; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - i);
    const ds = dt.toLocaleDateString('ru-RU');
    heat.push({ date: ds, reps: dayTotals[ds] || 0 });
  }

  const known = new Set(sport.map((s) => s.id));
  const perExercise: SportExerciseStat[] = sport.map((s) => ({
    id: s.id,
    text: s.text,
    total: exTotals[s.id] || 0,
    today: intNum(data[`slv_sport_${todayStr}_${s.id}`]),
  }));
  Object.keys(exTotals).forEach((id) => {
    if (!known.has(id)) perExercise.push({ id, text: id, total: exTotals[id], today: intNum(data[`slv_sport_${todayStr}_${id}`]) });
  });
  perExercise.sort((a, b) => b.total - a.total);

  return {
    totalAll,
    totalToday,
    totalWeek,
    totalMonth,
    activeDays: days.length,
    bestDay,
    streak,
    avgPerActiveDay: days.length ? Math.round(totalAll / days.length) : 0,
    perExercise,
    daily: days.map((d) => ({ date: d, reps: dayTotals[d] })),
    monthly,
    weekday,
    heat,
  };
}

// --- Streaks (shadow/asceticism) ---
export function calculateStreaks(data: DataMap, shadowTasks: Task[]): { current: number; best: number } {
  if (!shadowTasks.length) return { current: 0, best: 0 };
  const successDates = new Set<string>();
  Object.keys(data).forEach((key) => {
    if (!key.startsWith('slv_secret_')) return;
    if (data[key] !== 'true') return;
    if (!shadowTasks.some((t) => key.endsWith(t.id))) return;
    const parts = key.split('_');
    if (parts.length >= 4) successDates.add(parts[2]);
  });

  const sorted = Array.from(successDates)
    .map((d) => {
      const [dd, mm, yyyy] = d.split('.');
      return new Date(`${yyyy}-${mm}-${dd}`).getTime();
    })
    .sort((a, b) => a - b);

  if (!sorted.length) return { current: 0, best: 0 };

  let best = 0;
  let temp = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (sorted[i] - sorted[i - 1]) / 86400000;
    if (Math.round(diff) === 1) temp++;
    else {
      if (temp > best) best = temp;
      temp = 1;
    }
  }
  if (temp > best) best = temp;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const hasToday = sorted.includes(today.getTime());
  const hasYesterday = sorted.includes(yesterday.getTime());

  let current = 0;
  if (hasToday || hasYesterday) {
    let checkTime = hasToday ? today.getTime() : yesterday.getTime();
    while (sorted.includes(checkTime)) {
      current++;
      checkTime -= 86400000;
    }
  }
  return { current, best };
}

// --- Secret chart (soul vs shadow last 7 days) ---
export function buildSecretChartData(data: DataMap, soulTasks: Task[], shadowTasks: Task[], days = 7) {
  const labels: string[] = [];
  const soulData: number[] = [];
  const shadowData: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('ru-RU');
    labels.push(dateStr.slice(0, 5));
    let sVal = 0;
    let shVal = 0;
    soulTasks.forEach((t) => {
      if (data[`slv_secret_${dateStr}_${t.id}`] === 'true') sVal += t.xp;
    });
    shadowTasks.forEach((t) => {
      if (data[`slv_secret_${dateStr}_${t.id}`] === 'true') shVal += t.xp;
    });
    soulData.push(sVal);
    shadowData.push(shVal);
  }
  return { labels, soulData, shadowData };
}

// --- XP chart over time ---
export function buildChartData(
  data: DataMap,
  period: 'month' | 'year' | 'all',
  myTasks: Task[],
  bogdanTasks: Task[],
  sport: SportExercise[],
): { labels: string[]; values: number[] } {
  const dailyData: Record<string, number> = {};
  const taskMap: Record<string, number> = {};
  [...myTasks, ...bogdanTasks].forEach((t) => (taskMap[t.id] = t.xp));
  const sportMap: Record<string, number> = {};
  sport.forEach((s) => (sportMap[s.id] = s.rate));

  const add = (date: string, amt: number) => {
    dailyData[date] = (dailyData[date] || 0) + amt;
  };

  Object.keys(data).forEach((key) => {
    if (key.startsWith('slv_') && !key.includes('secret') && !key.includes('sleep')) {
      const parts = key.split('_');
      if (
        parts.length >= 3 &&
        !key.includes('sport') &&
        !key.includes('fizz') &&
        !key.includes('water') &&
        !key.includes('air') &&
        !key.includes('nutri') &&
        !key.includes('energy') &&
        !key.includes('oneoff') &&
        !key.includes('config') &&
        !key.includes('user') &&
        !key.includes('total')
      ) {
        const date = parts[1];
        const id = parts.slice(2).join('_');
        if (data[key] === 'true') add(date, taskMap[id] || 0);
      }
    }
    if (key.startsWith('slv_fizz_')) {
      const parts = key.split('_');
      if (parts.length >= 4) {
        try {
          add(parts[2], JSON.parse(data[key] as string).xp);
        } catch { /* ignore */ }
      }
    }
    if (key.startsWith('slv_nutri_')) {
      const parts = key.split('_');
      if (parts.length >= 4) {
        const val = num(data[key]);
        if (val > 0) add(parts[2], val * 2);
      }
    }
    if (key.startsWith('slv_sport_')) {
      const parts = key.split('_');
      if (parts.length >= 4) {
        const id = parts.slice(3).join('_');
        const count = intNum(data[key]);
        if (count > 0) add(parts[2], count * (sportMap[id] || 0));
      }
    }
    if (key.startsWith('slv_water_')) {
      const parts = key.split('_');
      if (parts.length === 3) {
        const val = intNum(data[key]);
        if (val > 0) add(parts[2], val / 100);
      }
    }
    if (key.startsWith('slv_air_')) {
      const parts = key.split('_');
      if (parts.length === 3) {
        const val = intNum(data[key]);
        if (val > 0) add(parts[2], (val / 15) * 5);
      }
    }
  });

  let days = Object.keys(dailyData).sort((a, b) => {
    const [d1, m1, y1] = a.split('.');
    const [d2, m2, y2] = b.split('.');
    return +new Date(`${y1}-${m1}-${d1}`) - +new Date(`${y2}-${m2}-${d2}`);
  });

  const today = new Date();
  if (period === 'month') {
    const cutoff = new Date();
    cutoff.setDate(today.getDate() - 30);
    days = days.filter((d) => {
      const [dd, mm, yyyy] = d.split('.');
      return new Date(`${yyyy}-${mm}-${dd}`) >= cutoff;
    });
  } else if (period === 'year') {
    const cutoff = new Date();
    cutoff.setDate(today.getDate() - 365);
    days = days.filter((d) => {
      const [dd, mm, yyyy] = d.split('.');
      return new Date(`${yyyy}-${mm}-${dd}`) >= cutoff;
    });
  }

  return { labels: days.map((d) => d.slice(0, 5)), values: days.map((d) => Math.round(dailyData[d] * 10) / 10) };
}
