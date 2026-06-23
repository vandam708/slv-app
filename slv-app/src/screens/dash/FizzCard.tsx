import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NeoCard } from '../../components/ui/NeoCard';
import { NeoButton } from '../../components/ui/NeoButton';
import { SectionTitle } from '../../components/ui/bits';
import { LottoBarrel, type BarrelHandle } from '../../components/viz/LottoBarrel';
import { useConfig } from '../../store/selectors';
import { completeFizz } from '../../store/actions';
import { fireXP } from '../../lib/fx';
import type { Task } from '../../domain/config';

const FIZZ = '#f5d04c';

export function FizzCard() {
  const { fizz } = useConfig();
  const barrelRef = useRef<BarrelHandle>(null);
  const drumBox = useRef<HTMLDivElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const interval = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => () => clearInterval(interval.current), []);

  function spin() {
    if (!fizz.length || spinning) return;
    setResult(null);
    setTimerRunning(false);
    clearInterval(interval.current);
    setTimeLeft(300);
    setSpinning(true);
    barrelRef.current?.spin();
  }

  function handleResult(task: Task) {
    setSpinning(false);
    setResult(task);
    if (drumBox.current) {
      const r = drumBox.current.getBoundingClientRect();
      fireXP(r.left + r.width / 2, r.top + r.height / 2, task.xp, FIZZ);
    }
  }

  function startTimer() {
    if (timerRunning) return;
    setTimerRunning(true);
    interval.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval.current);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function done(e: React.MouseEvent) {
    if (!result) return;
    clearInterval(interval.current);
    fireXP(e.clientX, e.clientY, result.xp, FIZZ);
    completeFizz(result.text, result.xp);
    setResult(null);
    setTimerRunning(false);
    setTimeLeft(300);
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const canFinish = timerRunning && timeLeft === 0;

  return (
    <NeoCard accent={FIZZ}>
      <SectionTitle icon="⚡" color={FIZZ} center>
        Физкульт-минутка
      </SectionTitle>
      <div className="flex flex-col items-center">
        <div ref={drumBox} className="mb-2">
          <LottoBarrel ref={barrelRef} tasks={fizz} result={result} onResult={handleResult} />
        </div>

        {spinning && <p className="mb-3 text-xs text-ink-faint">👆 Крути барабан пальцем, пока не надоест</p>}

        {!result && (
          <NeoButton accent={FIZZ} variant="accent" className="w-full" disabled={spinning || !fizz.length} onClick={spin}>
            {spinning ? '🎰 Крутится…' : '🎯 Запустить барабан'}
          </NeoButton>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center">
            <div className="mb-2 text-sm font-semibold" style={{ color: FIZZ }}>
              Выпало: +{result.xp} XP
            </div>
            {timerRunning ? (
              <div className="my-2 font-display text-4xl font-bold tabular-nums" style={{ color: timeLeft === 0 ? '#5fd38a' : FIZZ }}>
                {mm}:{ss}
              </div>
            ) : (
              <NeoButton accent={FIZZ} className="mb-2 w-full" onClick={startTimer}>
                ⏱ Запустить таймер (5 мин)
              </NeoButton>
            )}
            <NeoButton variant="accent" accent="#5fd38a" className="w-full" disabled={!canFinish} onClick={done}>
              ✅ Готово
            </NeoButton>
          </motion.div>
        )}
      </div>
    </NeoCard>
  );
}
