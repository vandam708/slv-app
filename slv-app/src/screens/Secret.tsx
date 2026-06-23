import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitle, NeoInput, NeoCheck } from '../components/ui/bits';
import { NeoCard } from '../components/ui/NeoCard';
import { NeoButton } from '../components/ui/NeoButton';
import { SecretBarChart } from '../components/XPChart';
import { useStore } from '../store/useStore';
import { useConfig, useData } from '../store/selectors';
import { buildSecretChartData, calculateStreaks } from '../domain/logic';
import {
  unlockVault,
  toggleSecretTask,
  addSecretTask,
  deleteSecretTask,
  addSecretNote,
  deleteSecretNote,
} from '../store/actions';
import { todayRu } from '../lib/date';

const SHADOW = '#ef6f6f';
const SOUL = '#9d7be8';
const NOTES = '#f5d04c';

function SecretTaskList({ type, color }: { type: 'shadow' | 'soul'; color: string }) {
  const cfg = useConfig();
  const data = useData();
  const t = todayRu();
  const [name, setName] = useState('');
  const list = type === 'shadow' ? cfg.shadow : cfg.soul;

  return (
    <>
      <div className="space-y-2">
        {list.map((task) => {
          const done = data[`slv_secret_${t}_${task.id}`] === 'true';
          return (
            <div key={task.id} className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 shadow-neo-sm">
              <NeoCheck checked={done} color={color} onChange={() => toggleSecretTask(task.id, task.xp)} />
              <span className={`flex-1 text-sm ${done ? 'text-ink-faint line-through' : 'text-ink'}`}>{task.text}</span>
              <button onClick={() => deleteSecretTask(task.id, type)} className="text-ink-faint hover:text-shadow">
                ✖
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <NeoInput value={name} onChange={(e) => setName(e.target.value)} placeholder={type === 'shadow' ? 'Вредная привычка…' : 'Духовное дело…'} />
        <NeoButton
          accent={color}
          variant="accent"
          onClick={() => {
            addSecretTask(type, name);
            setName('');
          }}
        >
          +
        </NeoButton>
      </div>
    </>
  );
}

function Vault() {
  const cfg = useConfig();
  const data = useData();
  const setScreen = useStore((s) => s.setScreen);
  const setSession = useStore((s) => s.setSecretSession);
  const notes = useStore((s) => s.secretNotes);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const streaks = useMemo(() => calculateStreaks(data, cfg.shadow), [data, cfg.shadow]);
  const chart = useMemo(() => buildSecretChartData(data, cfg.soul, cfg.shadow), [data, cfg.soul, cfg.shadow]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h2 className="text-center font-display text-2xl font-bold" style={{ color: SOUL }}>
        👁️ Тайный Блок
      </h2>

      <NeoCard accent={SHADOW} tilt={false}>
        <SectionTitle icon="🚫" color={SHADOW}>
          Аскеза (Борьба)
        </SectionTitle>
        <div className="mb-3 grid grid-cols-2 gap-3">
          {[
            { v: streaks.current, l: 'Дней подряд', c: '#f5984c' },
            { v: streaks.best, l: 'Рекорд', c: '#f5d04c' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-sunken py-3 text-center shadow-neo-inset-sm">
              <div className="font-display text-3xl font-bold" style={{ color: s.c, textShadow: `0 0 16px ${s.c}` }}>
                {s.v}
              </div>
              <div className="text-xs text-ink-faint">{s.l}</div>
            </div>
          ))}
        </div>
        <p className="mb-2 text-xs text-ink-faint">Отметь, если НЕ сорвался сегодня (+XP)</p>
        <SecretTaskList type="shadow" color={SHADOW} />
      </NeoCard>

      <NeoCard accent={SOUL} tilt={false}>
        <SectionTitle icon="🕊️" color={SOUL}>
          Развитие
        </SectionTitle>
        <SecretTaskList type="soul" color={SOUL} />
      </NeoCard>

      <NeoCard accent={SOUL} tilt={false}>
        <SectionTitle icon="📊" color={SOUL}>
          Тайная Статистика
        </SectionTitle>
        <div className="h-48">
          <SecretBarChart labels={chart.labels} soulData={chart.soulData} shadowData={chart.shadowData} />
        </div>
      </NeoCard>

      <NeoCard accent={NOTES} tilt={false}>
        <SectionTitle icon="📜" color={NOTES}>
          Личные Мысли
        </SectionTitle>
        <NeoInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Заголовок заметки…" className="mb-2" />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Текст заметки…"
          rows={3}
          className="w-full rounded-xl bg-sunken px-3.5 py-2.5 text-sm text-ink shadow-neo-inset-sm outline-none placeholder:text-ink-faint"
        />
        <NeoButton
          accent={NOTES}
          variant="accent"
          className="mt-2 w-full"
          onClick={() => {
            addSecretNote(title, text);
            setTitle('');
            setText('');
          }}
        >
          🔒 Сохранить (Шифруется)
        </NeoButton>
        <div className="mt-4 space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="overflow-hidden rounded-2xl bg-surface shadow-neo-sm">
              <button onClick={() => setOpen(open === n.id ? null : n.id)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left">
                <span className="text-ink-faint">{open === n.id ? '▲' : '▼'}</span>
                <span className="flex-1 truncate text-sm font-semibold text-ink">{n.title}</span>
                <span className="text-[10px] text-ink-faint">{n.date}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Удалить заметку?')) deleteSecretNote(n.id);
                  }}
                  className="text-ink-faint hover:text-shadow"
                >
                  ✖
                </span>
              </button>
              <AnimatePresence>
                {open === n.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="whitespace-pre-wrap px-4 pb-3 text-sm text-ink-soft">{n.text}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </NeoCard>

      <NeoButton
        variant="flat"
        className="w-full"
        onClick={() => {
          setSession(null, []);
          setScreen('dash');
        }}
      >
        🔒 Заблокировать и Выйти
      </NeoButton>
    </div>
  );
}

export function Secret() {
  const secretKey = useStore((s) => s.secretKey);
  const setSession = useStore((s) => s.setSecretSession);
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  if (secretKey) return <Vault />;

  function tryUnlock() {
    if (!pass) return;
    const res = unlockVault(pass);
    if (res.ok) {
      setSession(pass, res.notes);
      setPass('');
      setErr('');
    } else {
      setErr(res.reason === 'WRONG_PASSWORD' ? 'Неверный пароль!' : 'Ошибка входа!');
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <NeoCard accent="#f5b14c" tilt={false} className="text-center">
        <div className="mb-3 text-5xl">🔐</div>
        <h2 className="mb-4 font-display text-xl font-bold text-warning">Тайный Блок</h2>
        <NeoInput
          type="password"
          value={pass}
          onChange={(e) => {
            setPass(e.target.value);
            setErr('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
          placeholder="Пароль"
          className="text-center"
        />
        {err && <p className="mt-2 text-xs text-shadow">{err}</p>}
        <NeoButton accent="#f5b14c" variant="accent" className="mt-3 w-full" onClick={tryUnlock}>
          Открыть
        </NeoButton>
        <p className="mt-4 text-[11px] text-ink-faint">
          AES Encryption. Zero Knowledge.
          <br />
          Трижды нажми на «SLV: Cloud» вверху для входа.
        </p>
      </NeoCard>
    </div>
  );
}
