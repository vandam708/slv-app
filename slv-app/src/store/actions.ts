import { useStore } from './useStore';
import { deriveConfig } from './selectors';
import { normalizeXp, num, intNum } from '../domain/logic';
import { todayRu } from '../lib/date';
import { encryptNotes, unlockNotes, type SecretNote } from '../lib/crypto';
import type { Task, SportExercise, Idea } from '../domain/config';

function st() {
  return useStore.getState();
}

function data() {
  return st().data;
}

function getXP(): number {
  return normalizeXp(num(data()['slv_total_xp'], 0));
}

function setXP(value: number) {
  st().setKey('slv_total_xp', String(normalizeXp(value)));
}

export function addXP(delta: number) {
  setXP(getXP() + delta);
}

const CONFIG_KEY: Record<string, string> = {
  slv: 'slv_config_tasks',
  mind: 'slv_config_mind',
  chores: 'slv_config_chores',
  bogdan: 'bogdan_config_tasks',
  sport: 'slv_config_sport',
  fizz: 'slv_config_fizz',
  shadow: 'slv_config_shadow',
  soul: 'slv_config_soul',
};

function writeList(type: string, list: unknown) {
  st().setKey(CONFIG_KEY[type], JSON.stringify(list));
}

// --- configurable focus profile (the second tab: name + emoji + ideas) ---
export function setFocusProfile(name: string, emoji: string) {
  st().setKey('slv_focus_profile', JSON.stringify({ name: name.trim() || 'Мой Фокус', emoji: emoji.trim() || '⭐' }));
}

export function setFocusIdeas(ideas: Idea[]) {
  const clean = ideas
    .map((i) => ({ emoji: (i.emoji || '✨').trim(), text: (i.text || '').trim() }))
    .filter((i) => i.text.length > 0);
  st().setKey('slv_focus_ideas', JSON.stringify(clean));
}

// --- daily tasks ---
export function toggleTask(taskId: string, xp: number) {
  const t = todayRu();
  const key = `slv_${t}_${taskId}`;
  if (data()[key] !== 'true') {
    st().setKey(key, 'true');
    addXP(xp);
  } else {
    st().removeKey(key);
    addXP(-xp);
  }
}

export function completeOneOff(id: string, type: string, xp: number, text: string) {
  addXP(xp);
  const t = todayRu();
  const logKey = `slv_oneoff_log_${t}`;
  let log: { text: string; xp: number; type: string }[] = [];
  try {
    log = JSON.parse(data()[logKey] || '[]');
  } catch { /* ignore */ }
  log.push({ text, xp, type });
  st().setKey(logKey, JSON.stringify(log));
  if (type === 'chores') {
    const cfg = deriveConfig(data());
    writeList('chores', cfg.choreTasks.filter((c) => c.id !== id));
  }
}

// --- water ---
export function addWater(amount: number) {
  const t = todayRu();
  const k = `slv_water_${t}`;
  const cur = intNum(data()[k]);
  if (cur + amount < 0) return;
  st().setKey(k, String(cur + amount));
  addXP(amount / 100);
}

// --- air ---
export function addAir(amount: number) {
  const t = todayRu();
  const k = `slv_air_${t}`;
  const cur = intNum(data()[k]);
  if (cur + amount < 0) return;
  st().setKey(k, String(cur + amount));
  addXP((amount / 15) * 5);
}

// --- nutri ---
export function addNutri(catId: string, amount: number) {
  const t = todayRu();
  const k = `slv_nutri_${t}_${catId}`;
  const cur = num(data()[k]);
  if (cur + amount < 0) return;
  st().setKey(k, String(Math.round((cur + amount) * 10) / 10));
  addXP(amount * 2);
}

// --- sport ---
export function setSport(id: string, value: number, rate: number) {
  const t = todayRu();
  const k = `slv_sport_${t}_${id}`;
  const old = intNum(data()[k]);
  const val = Math.max(0, Math.floor(value));
  if (Number.isNaN(val)) return;
  st().setKey(k, String(val));
  addXP((val - old) * rate);
}

export function changeSport(id: string, delta: number, rate: number) {
  const t = todayRu();
  const k = `slv_sport_${t}_${id}`;
  const cur = intNum(data()[k]);
  setSport(id, Math.max(0, cur + delta), rate);
}

// --- sleep ---
export function saveSleep(start: string, end: string): string | null {
  if (!start || !end) return null;
  const startDate = new Date(`2000-01-01T${start}`);
  const endDate = new Date(`2000-01-01T${end}`);
  if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
  const diffMs = +endDate - +startDate;
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const diff = `${hours} ч ${minutes} мин`;
  const t = todayRu();
  const key = `slv_sleep_${t}`;
  const existed = data()[key];
  if (!existed) addXP(10);
  st().setKey(key, JSON.stringify({ start, end, diff }));
  return diff;
}

// --- energy ---
export function logEnergy(val: number) {
  const t = todayRu();
  const k = `slv_energy_log_${t}`;
  let log: { time: string; val: number }[] = [];
  try {
    log = JSON.parse(data()[k] || '[]');
  } catch { /* ignore */ }
  log.push({ time: new Date().toTimeString().substring(0, 5), val });
  st().setKey(k, JSON.stringify(log));
}

// --- fizz ---
export function completeFizz(text: string, xp: number) {
  const t = todayRu();
  st().setKey(`slv_fizz_${t}_${Date.now()}`, JSON.stringify({ text, xp }));
  addXP(xp);
}

// --- weight ---
export function saveWeight(val: number) {
  if (!val) return;
  st().setKey('slv_user_weight', String(Math.floor(val)));
}

// --- editor ---
export function addNewTask(type: string, text: string, xp: number) {
  if (!text) return;
  const cfg = deriveConfig(data());
  const item: Task = { id: 't_' + Date.now(), text, xp };
  const map: Record<string, Task[]> = {
    daily: cfg.myTasks,
    mind: cfg.mindTasks,
    chores: cfg.choreTasks,
    bogdan: cfg.bogdanTasks,
  };
  const keyMap: Record<string, string> = { daily: 'slv', mind: 'mind', chores: 'chores', bogdan: 'bogdan' };
  const list = map[type];
  if (!list) return;
  writeList(keyMap[type], [...list, item]);
}

export function addNewSport(text: string, rate: number) {
  if (!text) return;
  const cfg = deriveConfig(data());
  writeList('sport', [...cfg.sport, { id: 'sp_' + Date.now(), text, rate } as SportExercise]);
}

export function addNewFizz(text: string, xp: number) {
  if (!text) return;
  const cfg = deriveConfig(data());
  writeList('fizz', [...cfg.fizz, { id: 'fz_' + Date.now(), text, xp } as Task]);
}

const LIST_OF: Record<string, keyof ReturnType<typeof deriveConfig>> = {
  slv: 'myTasks',
  mind: 'mindTasks',
  chores: 'choreTasks',
  bogdan: 'bogdanTasks',
  sport: 'sport',
  fizz: 'fizz',
  shadow: 'shadow',
  soul: 'soul',
};

export function deleteTask(id: string, type: string) {
  const cfg = deriveConfig(data());
  const listKey = LIST_OF[type];
  const list = cfg[listKey] as { id: string }[];
  writeList(type, list.filter((t) => t.id !== id));
}

export function editTaskItem(id: string, type: string, text: string, value: number) {
  const cfg = deriveConfig(data());
  const listKey = LIST_OF[type];
  const list = (cfg[listKey] as (Task | SportExercise)[]).map((t) => {
    if (t.id !== id) return t;
    if (type === 'sport') return { ...t, text, rate: value };
    return { ...t, text, xp: value };
  });
  writeList(type, list);
}

// --- secret vault ---
export function toggleSecretTask(id: string, xp: number) {
  const t = todayRu();
  const key = `slv_secret_${t}_${id}`;
  if (data()[key] === 'true') {
    st().removeKey(key);
    addXP(-xp);
  } else {
    st().setKey(key, 'true');
    addXP(xp);
  }
}

export function addSecretTask(type: 'shadow' | 'soul', text: string) {
  if (!text) return;
  const cfg = deriveConfig(data());
  const item: Task = { id: type + '_' + Date.now(), text, xp: 20 };
  writeList(type, [...(type === 'shadow' ? cfg.shadow : cfg.soul), item]);
}

export function deleteSecretTask(id: string, type: 'shadow' | 'soul') {
  const cfg = deriveConfig(data());
  writeList(type, (type === 'shadow' ? cfg.shadow : cfg.soul).filter((t) => t.id !== id));
}

export function unlockVault(pass: string) {
  const enc = data()['slv_secret_notes_enc'];
  return unlockNotes(enc, pass);
}

function persistNotes(notes: SecretNote[], key: string) {
  const cipher = encryptNotes(notes, key);
  if (cipher) st().setKey('slv_secret_notes_enc', cipher);
}

export function addSecretNote(title: string, text: string) {
  const { secretKey, secretNotes } = st();
  if (!secretKey || !text) return;
  const note: SecretNote = {
    id: 'note_' + Date.now(),
    title: title || 'Без темы',
    text,
    date: new Date().toLocaleString('ru-RU'),
  };
  const next = [note, ...secretNotes];
  st().setSecretSession(secretKey, next);
  persistNotes(next, secretKey);
}

export function deleteSecretNote(id: string) {
  const { secretKey, secretNotes } = st();
  if (!secretKey) return;
  const next = secretNotes.filter((n) => n.id !== id);
  st().setSecretSession(secretKey, next);
  persistNotes(next, secretKey);
}

// --- import (migrate from old export) ---
export function importData(raw: string): boolean {
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const obj: Record<string, string> = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (typeof v === 'string') obj[k] = v;
    });
    st().setMany(obj);
    return true;
  } catch {
    return false;
  }
}
