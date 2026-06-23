import { useRef, useState } from 'react';
import { ScreenTitle, SectionTitle, NeoInput } from '../components/ui/bits';
import { NeoCard } from '../components/ui/NeoCard';
import { NeoButton } from '../components/ui/NeoButton';
import { useConfig } from '../store/selectors';
import {
  saveWeight,
  addNewTask,
  addNewSport,
  addNewFizz,
  deleteTask,
  editTaskItem,
  importData,
} from '../store/actions';
import { logout } from '../lib/firebase';
import type { Task, SportExercise } from '../domain/config';

function EditList({
  items,
  type,
  unit,
}: {
  items: (Task | SportExercise)[];
  type: string;
  unit: (i: Task | SportExercise) => string;
}) {
  return (
    <div className="mt-3 space-y-2">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 shadow-neo-sm">
          <span className="flex-1 truncate text-sm text-ink">
            {it.text} <span className="text-xs text-ink-faint">({unit(it)})</span>
          </span>
          <button
            onClick={() => {
              const name = prompt('Новое название:', it.text);
              if (name === null) return;
              const isSport = type === 'sport';
              const cur = isSport ? (it as SportExercise).rate : (it as Task).xp;
              const raw = prompt('Новое значение:', String(cur));
              if (raw === null) return;
              const val = parseFloat(raw);
              if (Number.isNaN(val)) return;
              editTaskItem(it.id, type, name, val);
            }}
            className="grid h-8 w-8 place-items-center rounded-lg bg-surface text-sm shadow-neo-sm active:shadow-neo-inset-sm"
          >
            ✏️
          </button>
          <button
            onClick={() => {
              if (confirm('Удалить?')) deleteTask(it.id, type);
            }}
            className="grid h-8 w-8 place-items-center rounded-lg bg-surface text-sm text-shadow shadow-neo-sm active:shadow-neo-inset-sm"
          >
            ✖
          </button>
        </div>
      ))}
    </div>
  );
}

export function Editor() {
  const cfg = useConfig();
  const fileRef = useRef<HTMLInputElement>(null);
  const [weight, setW] = useState(String(cfg.weight));
  const [taskName, setTaskName] = useState('');
  const [taskXP, setTaskXP] = useState('10');
  const [taskTarget, setTaskTarget] = useState('daily');
  const [sportName, setSportName] = useState('');
  const [sportRate, setSportRate] = useState('0.5');
  const [fizzName, setFizzName] = useState('');
  const [fizzXP, setFizzXP] = useState('5');

  return (
    <div className="mx-auto max-w-2xl">
      <ScreenTitle icon="🛠">Редактор</ScreenTitle>
      <div className="mt-4 space-y-4">
        <NeoCard accent="#4cc9f0">
          <SectionTitle icon="👤" color="#4cc9f0">
            Мои Параметры
          </SectionTitle>
          <label className="mb-1 block text-xs text-ink-faint">Вес (кг):</label>
          <div className="flex gap-2">
            <NeoInput type="number" value={weight} onChange={(e) => setW(e.target.value)} placeholder="Кг" />
            <NeoButton accent="#4cc9f0" variant="accent" onClick={() => saveWeight(+weight)}>
              💾
            </NeoButton>
          </div>
        </NeoCard>

        <NeoCard accent="#f5d04c">
          <SectionTitle icon="⚡" color="#f5d04c">
            Настройка 5-минутки
          </SectionTitle>
          <div className="flex gap-2">
            <NeoInput value={fizzName} onChange={(e) => setFizzName(e.target.value)} placeholder="Разминка" />
            <NeoInput type="number" value={fizzXP} onChange={(e) => setFizzXP(e.target.value)} placeholder="XP" className="w-24" />
          </div>
          <NeoButton
            accent="#f5d04c"
            variant="accent"
            className="mt-2 w-full"
            onClick={() => {
              addNewFizz(fizzName, +fizzXP);
              setFizzName('');
            }}
          >
            ➕ Добавить
          </NeoButton>
          <EditList items={cfg.fizz} type="fizz" unit={(i) => `${(i as Task).xp} XP`} />
        </NeoCard>

        <NeoCard accent="#ef6f6f">
          <SectionTitle icon="🥋" color="#ef6f6f">
            Настройка Спорта
          </SectionTitle>
          <div className="flex gap-2">
            <NeoInput value={sportName} onChange={(e) => setSportName(e.target.value)} placeholder="Упражнение" />
            <NeoInput type="number" value={sportRate} onChange={(e) => setSportRate(e.target.value)} placeholder="XP/раз" className="w-24" />
          </div>
          <NeoButton
            accent="#ef6f6f"
            variant="accent"
            className="mt-2 w-full"
            onClick={() => {
              addNewSport(sportName, +sportRate);
              setSportName('');
            }}
          >
            ➕ Добавить
          </NeoButton>
          <EditList items={cfg.sport} type="sport" unit={(i) => `${(i as SportExercise).rate}/раз`} />
        </NeoCard>

        <NeoCard accent="#9d7be8">
          <SectionTitle icon="✏️" color="#9d7be8">
            Добавить задачу
          </SectionTitle>
          <div className="flex gap-2">
            <NeoInput value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Название" />
            <NeoInput type="number" value={taskXP} onChange={(e) => setTaskXP(e.target.value)} placeholder="XP" className="w-24" />
          </div>
          <select
            value={taskTarget}
            onChange={(e) => setTaskTarget(e.target.value)}
            className="mt-2 w-full rounded-xl bg-sunken px-3 py-2.5 text-sm text-ink shadow-neo-inset-sm outline-none"
          >
            <option value="daily">В Ежедневки (Постоянные)</option>
            <option value="mind">В Расширение сознания</option>
            <option value="chores">В Кончуги (Одноразовые)</option>
            <option value="bogdan">В список «{cfg.focus.name}»</option>
          </select>
          <NeoButton
            accent="#9d7be8"
            variant="accent"
            className="mt-2 w-full"
            onClick={() => {
              addNewTask(taskTarget, taskName, +taskXP);
              setTaskName('');
            }}
          >
            ➕ Добавить задачу
          </NeoButton>
        </NeoCard>

        <NeoCard accent="#4cc9f0">
          <SectionTitle color="#4cc9f0">Список SLV</SectionTitle>
          <EditList items={cfg.myTasks} type="slv" unit={(i) => `${(i as Task).xp} XP`} />
        </NeoCard>
        <NeoCard accent="#5fd38a">
          <SectionTitle color="#5fd38a">Список «{cfg.focus.name}»</SectionTitle>
          <EditList items={cfg.bogdanTasks} type="bogdan" unit={(i) => `${(i as Task).xp} XP`} />
        </NeoCard>
        <NeoCard accent="#9d7be8">
          <SectionTitle color="#9d7be8">Список Сознание</SectionTitle>
          <EditList items={cfg.mindTasks} type="mind" unit={(i) => `${(i as Task).xp} XP`} />
        </NeoCard>
        <NeoCard accent="#ef6f6f">
          <SectionTitle color="#ef6f6f">Список Кончуги</SectionTitle>
          <EditList items={cfg.choreTasks} type="chores" unit={(i) => `${(i as Task).xp} XP`} />
        </NeoCard>

        <ScreenTitle icon="⚙️">Системные настройки</ScreenTitle>
        <NeoCard accent="#647082" tilt={false}>
          <p className="mb-3 text-center text-xs text-warning">Данные синхронизируются с облаком автоматически.</p>
          <NeoButton variant="accent" accent="#4cc9f0" className="mb-2 w-full" onClick={() => fileRef.current?.click()}>
            📥 Перенести данные со старой версии
          </NeoButton>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const r = new FileReader();
              r.onload = (ev) => {
                const ok = importData(String(ev.target?.result || ''));
                alert(ok ? 'Данные перенесены и отправлены в облако!' : 'Ошибка файла');
              };
              r.readAsText(f);
            }}
          />
          <NeoButton variant="flat" className="w-full" onClick={() => logout()}>
            🚪 Выйти из аккаунта
          </NeoButton>
        </NeoCard>
      </div>
    </div>
  );
}
