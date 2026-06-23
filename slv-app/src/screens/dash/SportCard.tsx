import { NeoCard } from '../../components/ui/NeoCard';
import { NeoIconButton } from '../../components/ui/NeoButton';
import { SectionTitle } from '../../components/ui/bits';
import { useConfig, useData } from '../../store/selectors';
import { intNum } from '../../domain/logic';
import { changeSport, setSport } from '../../store/actions';
import { todayRu } from '../../lib/date';

const SPORT = '#ef6f6f';

export function SportCard() {
  const data = useData();
  const { sport } = useConfig();
  const t = todayRu();

  return (
    <NeoCard accent={SPORT}>
      <SectionTitle icon="🥋" color={SPORT} center>
        Тренировка БимПаста
      </SectionTitle>
      <div className="space-y-2">
        {sport.length === 0 && <p className="py-4 text-center text-sm text-ink-faint">Добавь упражнения в Редакторе.</p>}
        {sport.map((ex) => {
          const c = intNum(data[`slv_sport_${t}_${ex.id}`]);
          return (
            <div key={ex.id} className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 shadow-neo-sm">
              <span className="flex-1 truncate text-sm text-ink">{ex.text}</span>
              <NeoIconButton accent={SPORT} ariaLabel="minus" onClick={() => changeSport(ex.id, -10, ex.rate)}>
                −
              </NeoIconButton>
              <input
                type="number"
                value={c}
                onChange={(e) => setSport(ex.id, +e.target.value, ex.rate)}
                className="w-14 rounded-xl bg-sunken py-1.5 text-center text-sm font-bold text-ink shadow-neo-inset-sm outline-none"
              />
              <NeoIconButton accent={SPORT} ariaLabel="plus" onClick={() => changeSport(ex.id, 10, ex.rate)}>
                +
              </NeoIconButton>
            </div>
          );
        })}
      </div>
    </NeoCard>
  );
}
