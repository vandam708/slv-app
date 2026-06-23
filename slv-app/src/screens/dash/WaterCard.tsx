import { NeoCard } from '../../components/ui/NeoCard';
import { NeoButton } from '../../components/ui/NeoButton';
import { SectionTitle } from '../../components/ui/bits';
import { Liquid } from '../../components/viz/Liquid';
import { useConfig, useData } from '../../store/selectors';
import { intNum } from '../../domain/logic';
import { addWater } from '../../store/actions';
import { todayRu } from '../../lib/date';

const WATER = '#4cc9f0';

export function WaterCard() {
  const data = useData();
  const { weight } = useConfig();
  const t = todayRu();
  const cur = intNum(data[`slv_water_${t}`]);
  const goal = weight * 30;
  const pct = goal > 0 ? (cur / goal) * 100 : 0;

  return (
    <NeoCard accent={WATER}>
      <SectionTitle icon="💧" color={WATER} center>
        Гидратация
      </SectionTitle>
      <Liquid pct={pct} color={WATER} label={`${cur} / ${goal} мл`} />
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[200, 300, 500].map((a) => (
          <NeoButton key={a} accent={WATER} onClick={() => addWater(a)}>
            +{a}
          </NeoButton>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {[-150, -250].map((a) => (
          <NeoButton key={a} variant="flat" onClick={() => addWater(a)} className="text-ink-faint">
            {a}
          </NeoButton>
        ))}
      </div>
    </NeoCard>
  );
}
