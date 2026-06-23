import { useState, type ComponentType, type DragEvent } from 'react';
import { ScreenTitle } from '../components/ui/bits';
import { cn } from '../lib/cn';
import { useStore } from '../store/useStore';
import { DEFAULT_DASH_LAYOUT } from '../store/dashLayout';
import { EnergyCard } from './dash/EnergyCard';
import { SleepCard } from './dash/SleepCard';
import { WaterCard } from './dash/WaterCard';
import { NutriCard } from './dash/NutriCard';
import { AirCard } from './dash/AirCard';
import { QuestsCard } from './dash/QuestsCard';
import { SportCard } from './dash/SportCard';
import { FizzCard } from './dash/FizzCard';

const REGISTRY: Record<string, ComponentType> = {
  energy: EnergyCard,
  quests: QuestsCard,
  sleep: SleepCard,
  water: WaterCard,
  air: AirCard,
  nutri: NutriCard,
  sport: SportCard,
  fizz: FizzCard,
};

/**
 * Fixed-bucket masonry (each card pinned to a column → no cross-column "jump")
 * plus a builder mode: toggle it from the header and drag cards between columns.
 * In builder mode columns stretch to equal height and each gets a full-height
 * drop zone at the bottom, so you can drop a card under any column even when that
 * column is shorter than the others. The layout persists to localStorage.
 */
export function Dashboard() {
  const builder = useStore((s) => s.builder);
  const setBuilder = useStore((s) => s.setBuilder);
  const layout = useStore((s) => s.dashLayout);
  const setLayout = useStore((s) => s.setDashLayout);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<number | null>(null);

  // Drop into a column: index is decided by the pointer's Y vs each card's
  // midpoint; a drop below all cards (e.g. on the bottom zone) appends.
  function onDropColumn(e: DragEvent<HTMLDivElement>, colIdx: number) {
    e.preventDefault();
    const id = dragId || e.dataTransfer.getData('text/plain');
    setOverCol(null);
    setDragId(null);
    if (!id) return;
    const cards = [...e.currentTarget.querySelectorAll<HTMLElement>('[data-card-id]')].filter(
      (el) => el.dataset.cardId !== id,
    );
    let idx = cards.length;
    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) {
        idx = i;
        break;
      }
    }
    const cols = layout.map((c) => c.filter((x) => x !== id));
    cols[colIdx].splice(idx, 0, id);
    setLayout(cols); // keep empty columns as droppable lanes
  }

  return (
    <div>
      <ScreenTitle icon="📅">Мой День</ScreenTitle>

      {builder && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-accent/10 px-4 py-2.5 text-sm text-ink-soft shadow-neo-inset-sm">
          <span className="font-semibold text-accent">🛠 Режим конструктора — перетаскивай карточки мышью</span>
          <div className="flex gap-2">
            <button
              onClick={() => setLayout(DEFAULT_DASH_LAYOUT.map((c) => [...c]))}
              className="rounded-xl bg-surface px-3 py-1.5 text-xs font-semibold text-ink-faint shadow-neo-sm active:shadow-neo-inset-sm"
            >
              Сбросить
            </button>
            <button
              onClick={() => setBuilder(false)}
              className="rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-[#0e141c] shadow-neo-sm active:shadow-neo-inset-sm"
            >
              Готово
            </button>
          </div>
        </div>
      )}

      <div className={cn('mt-4 flex flex-col gap-4 lg:flex-row', builder ? 'lg:items-stretch' : 'lg:items-start')}>
        {layout.map((col, ci) => (
          <div
            key={ci}
            onDragOver={builder ? (e) => { e.preventDefault(); setOverCol(ci); } : undefined}
            onDrop={builder ? (e) => onDropColumn(e, ci) : undefined}
            className={cn(
              'flex w-full min-w-0 flex-col gap-4 lg:flex-1',
              builder && 'rounded-3xl p-2 outline-dashed outline-2 outline-white/5 transition-colors',
              builder && overCol === ci && 'bg-accent/5 outline-accent/40',
            )}
          >
            {col.map((id) => {
              const Card = REGISTRY[id];
              if (!Card) return null;
              return (
                <div
                  key={id}
                  data-card-id={id}
                  draggable={builder}
                  onDragStart={
                    builder
                      ? (e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', id);
                          setDragId(id);
                        }
                      : undefined
                  }
                  onDragEnd={builder ? () => { setDragId(null); setOverCol(null); } : undefined}
                  className={cn(
                    'relative',
                    builder && 'cursor-grab rounded-neo outline-dashed outline-2 outline-accent/40 active:cursor-grabbing',
                    dragId === id && 'opacity-40',
                  )}
                >
                  <div className={builder ? 'pointer-events-none select-none' : undefined}>
                    <Card />
                  </div>
                  {builder && (
                    <div className="pointer-events-none absolute right-3 top-3 z-20 rounded-lg bg-accent/90 px-2 py-1 text-xs font-bold text-[#0e141c] shadow-neo-sm">
                      ⠿ перетащи
                    </div>
                  )}
                </div>
              );
            })}

            {/* full-height drop zone at the bottom of every column */}
            {builder && (
              <div
                className={cn(
                  'grid min-h-[110px] flex-1 place-items-center rounded-2xl text-xs font-semibold transition-colors',
                  'outline-dashed outline-2 outline-white/10',
                  overCol === ci ? 'bg-accent/10 text-accent outline-accent/50' : 'text-ink-faint/50',
                )}
              >
                ↓ вставить сюда
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
