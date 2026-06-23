import { NeoCard } from '../../components/ui/NeoCard';
import { NeoButton } from '../../components/ui/NeoButton';
import { SectionTitle } from '../../components/ui/bits';
import { Atmosphere } from '../../components/viz/Atmosphere';
import { useData } from '../../store/selectors';
import { intNum } from '../../domain/logic';
import { addAir } from '../../store/actions';
import { todayRu } from '../../lib/date';

const AIR = '#7fd1e8';

export function AirCard() {
  const data = useData();
  const t = todayRu();
  const cur = intNum(data[`slv_air_${t}`]);
  const goal = 60;
  const pct = (cur / goal) * 100;

  return (
    <NeoCard accent={AIR}>
      <SectionTitle icon="🌬️" color={AIR} center>
        Воздух / Улица
      </SectionTitle>
      <Atmosphere pct={pct} height={130}>
        <span className="font-display text-4xl font-bold" style={{ color: '#eafaff', textShadow: `0 0 22px ${AIR}` }}>
          {cur} <span className="text-base text-ink-soft">/ {goal} мин</span>
        </span>
      </Atmosphere>
      <div className="mt-4 grid grid-cols-4 gap-2">
        <NeoButton accent={AIR} onClick={() => addAir(15)}>
          +15
        </NeoButton>
        <NeoButton accent={AIR} onClick={() => addAir(30)}>
          +30
        </NeoButton>
        <NeoButton variant="flat" className="text-ink-faint" onClick={() => addAir(-15)}>
          -15
        </NeoButton>
        <NeoButton variant="flat" className="text-ink-faint" onClick={() => addAir(-30)}>
          -30
        </NeoButton>
      </div>
    </NeoCard>
  );
}
