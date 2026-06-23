import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScreenTitle, SectionTitle, NeoCheck, Pill, NeoInput } from '../components/ui/bits';
import { NeoCard } from '../components/ui/NeoCard';
import { NeoButton } from '../components/ui/NeoButton';
import { useConfig, useData } from '../store/selectors';
import { toggleTask, setFocusProfile, setFocusIdeas } from '../store/actions';
import { fireXP } from '../lib/fx';
import { todayRu } from '../lib/date';
import type { Idea } from '../domain/config';

const GREEN = '#5fd38a';
const AMBER = '#f5b14c';

export function Bogdan() {
  const { bogdanTasks, focus, focusIdeas } = useConfig();
  const data = useData();
  const t = todayRu();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [editing, setEditing] = useState(false);

  // local draft for the settings panel
  const [name, setName] = useState(focus.name);
  const [emoji, setEmoji] = useState(focus.emoji);
  const [ideas, setIdeas] = useState<Idea[]>(focusIdeas);

  function openEditor() {
    setName(focus.name);
    setEmoji(focus.emoji);
    setIdeas(focusIdeas.length ? focusIdeas : [{ emoji: '✨', text: '' }]);
    setEditing(true);
  }

  function save() {
    setFocusProfile(name, emoji);
    setFocusIdeas(ideas);
    setEditing(false);
    setIdea(null);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-2">
        <ScreenTitle icon={focus.emoji}>{focus.name}</ScreenTitle>
        <button
          onClick={() => (editing ? setEditing(false) : openEditor())}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-base shadow-neo-sm active:shadow-neo-inset-sm"
          title="Настроить вкладку"
        >
          {editing ? '✕' : '⚙️'}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <NeoCard accent="#9d7be8" tilt={false} className="mt-4">
              <SectionTitle icon="⚙️" color="#9d7be8">
                Настройка вкладки
              </SectionTitle>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-ink-faint">Название</label>
                  <NeoInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Напр. Дочь, Стартап, Сад…" />
                </div>
                <div className="w-20">
                  <label className="mb-1 block text-xs font-semibold text-ink-faint">Иконка</label>
                  <NeoInput value={emoji} onChange={(e) => setEmoji(e.target.value)} className="text-center text-xl" maxLength={4} />
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 text-xs font-semibold text-ink-faint">Идеи (для случайного выбора)</div>
                <div className="space-y-2">
                  {ideas.map((it, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <NeoInput
                        value={it.emoji}
                        onChange={(e) => setIdeas((a) => a.map((x, j) => (j === i ? { ...x, emoji: e.target.value } : x)))}
                        className="w-14 text-center text-lg"
                        maxLength={4}
                      />
                      <NeoInput
                        value={it.text}
                        onChange={(e) => setIdeas((a) => a.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                        placeholder="Название идеи"
                        className="flex-1"
                      />
                      <button
                        onClick={() => setIdeas((a) => a.filter((_, j) => j !== i))}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-sm shadow-neo-sm active:shadow-neo-inset-sm"
                        title="Удалить"
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setIdeas((a) => [...a, { emoji: '✨', text: '' }])}
                  className="mt-2 w-full rounded-xl bg-surface py-2 text-xs font-semibold text-ink-soft shadow-neo-sm active:shadow-neo-inset-sm"
                >
                  ➕ Добавить идею
                </button>
              </div>

              <div className="mt-4 flex gap-2">
                <NeoButton variant="flat" className="flex-1 text-ink-faint" onClick={() => setEditing(false)}>
                  Отмена
                </NeoButton>
                <NeoButton accent="#9d7be8" variant="accent" className="flex-1" onClick={save}>
                  💾 Сохранить
                </NeoButton>
              </div>
            </NeoCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 space-y-4">
        <NeoCard accent={GREEN}>
          <SectionTitle icon="🎮" color={GREEN}>
            Активности
          </SectionTitle>
          <div className="space-y-2">
            {bogdanTasks.length === 0 && (
              <p className="py-4 text-center text-sm text-ink-faint">Добавь активности в Редакторе.</p>
            )}
            {bogdanTasks.map((task) => {
              const done = data[`slv_${t}_${task.id}`] === 'true';
              return (
                <div
                  key={task.id}
                  onClick={(e) => {
                    if (!done) fireXP(e.clientX, e.clientY, task.xp, GREEN);
                    toggleTask(task.id, task.xp);
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 shadow-neo-sm"
                >
                  <NeoCheck checked={done} color={GREEN} onChange={() => {}} />
                  <span className={`flex-1 text-sm ${done ? 'text-ink-faint line-through' : 'text-ink'}`}>{task.text}</span>
                  <Pill color={GREEN}>+{task.xp}</Pill>
                </div>
              );
            })}
          </div>
        </NeoCard>

        <NeoCard accent={AMBER}>
          <SectionTitle icon="🎲" color={AMBER}>
            Идеи
          </SectionTitle>
          {focusIdeas.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-faint">Пока нет идей — добавь их через ⚙️.</p>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {focusIdeas.map((it, i) => (
                  <div key={`${it.text}-${i}`} className="rounded-2xl bg-surface px-3 py-3 text-center text-sm text-ink shadow-neo-sm">
                    <div className="text-2xl">{it.emoji}</div>
                    <div className="mt-1">{it.text}</div>
                  </div>
                ))}
              </div>
              <NeoButton
                accent={AMBER}
                variant="accent"
                className="w-full"
                onClick={() => setIdea(focusIdeas[Math.floor(Math.random() * focusIdeas.length)])}
              >
                🎲 Выбрать случайно
              </NeoButton>
            </>
          )}
          {idea && (
            <motion.div
              key={idea.text}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-3 rounded-2xl bg-sunken py-4 text-center shadow-neo-inset-sm"
            >
              <div className="text-4xl">{idea.emoji}</div>
              <div className="mt-1 font-display text-lg font-bold text-ink">{idea.text}</div>
            </motion.div>
          )}
        </NeoCard>
      </div>
    </div>
  );
}
