import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeoCheck, Pill } from '../../components/ui/bits';
import { NeoProgress } from '../../components/ui/NeoProgress';
import { CollapsibleCard } from '../../components/ui/CollapsibleCard';
import { useConfig, useData } from '../../store/selectors';
import { toggleTask, completeOneOff } from '../../store/actions';
import { fireXP } from '../../lib/fx';
import { todayRu } from '../../lib/date';
import type { Task } from '../../domain/config';

const QUEST = '#4cc9f0';

const TABS = [
  { id: 'daily', label: 'Ежедневные', color: '#4cc9f0' },
  { id: 'mind', label: 'Сознание', color: '#9d7be8' },
  { id: 'chores', label: 'Кончуги', color: '#ef6f6f' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function TaskRow({
  task,
  done,
  color,
  onToggle,
}: {
  task: Task;
  done: boolean;
  color: string;
  onToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 shadow-neo-sm"
      onClick={onToggle}
      style={{ cursor: 'pointer' }}
    >
      <NeoCheck checked={done} color={color} onChange={() => {}} />
      <span className={`flex-1 text-sm ${done ? 'text-ink-faint line-through' : 'text-ink'}`}>{task.text}</span>
      <Pill color={color}>+{task.xp}</Pill>
    </motion.div>
  );
}

export function QuestsCard() {
  const [tab, setTab] = useState<TabId>('daily');
  const data = useData();
  const cfg = useConfig();
  const t = todayRu();
  const active = TABS.find((x) => x.id === tab)!;

  const lists: Record<TabId, Task[]> = {
    daily: cfg.myTasks,
    mind: cfg.mindTasks,
    chores: cfg.choreTasks,
  };
  const list = lists[tab];

  const dailyDone = cfg.myTasks.filter((task) => data[`slv_${t}_${task.id}`] === 'true').length;
  const dailyTotal = cfg.myTasks.length;
  const dailyPct = dailyTotal ? (dailyDone / dailyTotal) * 100 : 0;

  function handle(task: Task, e: React.MouseEvent) {
    const done = data[`slv_${t}_${task.id}`] === 'true';
    if (tab === 'chores') {
      fireXP(e.clientX, e.clientY, task.xp, active.color);
      completeOneOff(task.id, 'chores', task.xp, task.text);
    } else {
      if (!done) fireXP(e.clientX, e.clientY, task.xp, active.color);
      toggleTask(task.id, task.xp);
    }
  }

  return (
    <CollapsibleCard
      icon="🚀"
      title="Задачи & Квесты"
      accent={QUEST}
      defaultOpen
      summary={
        <div>
          <div className="mb-1.5 flex justify-between text-[11px] font-semibold">
            <span className="text-ink-faint">Ежедневные сегодня</span>
            <span style={{ color: QUEST }}>
              {dailyDone} / {dailyTotal}
            </span>
          </div>
          <NeoProgress value={dailyPct} color={QUEST} height={8} />
        </div>
      }
    >
      <div className="mb-3 mt-3 flex gap-1 rounded-2xl bg-sunken p-1 shadow-neo-inset-sm">
        {TABS.map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            className="relative flex-1 rounded-xl py-1.5 text-xs font-semibold"
            style={{ color: tab === x.id ? '#0e141c' : '#9fb0c6' }}
          >
            {tab === x.id && (
              <motion.span
                layoutId="quest-tab"
                className="absolute inset-0 rounded-xl"
                style={{ background: x.color, boxShadow: `0 0 14px -3px ${x.color}` }}
                transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              />
            )}
            <span className="relative z-10">{x.label}</span>
          </button>
        ))}
      </div>
      <div className="max-h-[42vh] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
        <AnimatePresence mode="popLayout">
          {list.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-faint">Пусто. Добавь задачи в Редакторе.</p>
          )}
          {list.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              color={active.color}
              done={tab !== 'chores' && data[`slv_${t}_${task.id}`] === 'true'}
              onToggle={(e) => handle(task, e)}
            />
          ))}
        </AnimatePresence>
      </div>
    </CollapsibleCard>
  );
}
