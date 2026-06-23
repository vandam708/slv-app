import { NeoCard } from '../../components/ui/NeoCard';
import { SectionTitle } from '../../components/ui/bits';
import { NeoProgress } from '../../components/ui/NeoProgress';
import { useConfig, useData } from '../../store/selectors';
import { num } from '../../domain/logic';
import { NUTRI_CONFIG } from '../../domain/config';
import { addNutri } from '../../store/actions';
import { todayRu } from '../../lib/date';

const NUTRI = '#5fd38a';

export function NutriCard() {
  const data = useData();
  const { weight } = useConfig();
  const t = todayRu();

  return (
    <NeoCard accent={NUTRI}>
      <SectionTitle icon="🧬" color={NUTRI} center>
        Нутри-Конструктор
      </SectionTitle>
      <div className="space-y-4">
        {NUTRI_CONFIG.map((cat) => {
          const goal = cat.calc(weight);
          const cur = num(data[`slv_nutri_${t}_${cat.id}`]);
          const pct = goal > 0 ? (cur / goal) * 100 : 0;
          return (
            <div key={cat.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-semibold" style={{ color: cat.color }}>
                  {cat.emoji} {cat.label}
                </span>
                <span className="text-xs text-ink-faint">
                  {cur} / {goal} порц.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <NeoProgress value={pct} color={cat.color} height={12} className="flex-1" />
                <div className="flex gap-1.5">
                  <button
                    onClick={() => addNutri(cat.id, -0.5)}
                    className="h-7 w-9 rounded-lg bg-surface text-xs font-bold text-ink-faint shadow-neo-sm active:shadow-neo-inset-sm"
                  >
                    −½
                  </button>
                  <button
                    onClick={() => addNutri(cat.id, 0.5)}
                    className="h-7 w-9 rounded-lg bg-surface text-xs font-bold shadow-neo-sm active:shadow-neo-inset-sm"
                    style={{ color: cat.color }}
                  >
                    +½
                  </button>
                  <button
                    onClick={() => addNutri(cat.id, 1)}
                    className="h-7 w-9 rounded-lg bg-surface text-xs font-bold shadow-neo-sm active:shadow-neo-inset-sm"
                    style={{ color: cat.color }}
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <details className="mt-4 rounded-xl bg-sunken p-3 shadow-neo-inset-sm">
        <summary className="cursor-pointer text-sm font-semibold text-accent">📖 Что к чему относится?</summary>
        <div className="mt-3 space-y-2">
          {NUTRI_CONFIG.map((cat) => (
            <div key={cat.id} className="text-xs">
              <span className="font-semibold" style={{ color: cat.color }}>
                {cat.emoji} {cat.label}:
              </span>{' '}
              <span className="text-ink-faint">{cat.help}</span>
            </div>
          ))}
        </div>
      </details>
    </NeoCard>
  );
}
