import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useConfig } from '../../store/selectors';
import { useStore } from '../../store/useStore';
import { levelInfo } from '../../domain/logic';
import { cn } from '../../lib/cn';

export function Header() {
  const { totalXP } = useConfig();
  const user = useStore((s) => s.user);
  const setScreen = useStore((s) => s.setScreen);
  const screen = useStore((s) => s.screen);
  const builder = useStore((s) => s.builder);
  const setBuilder = useStore((s) => s.setBuilder);
  const info = levelInfo(totalXP);
  const clicks = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function titleClick() {
    clicks.current += 1;
    clearTimeout(timer.current);
    if (clicks.current >= 3) {
      clicks.current = 0;
      setScreen('secret');
    } else {
      timer.current = setTimeout(() => (clicks.current = 0), 500);
    }
  }

  return (
    <header className="sticky top-0 z-30 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <span className="font-display text-sm font-bold text-ink">
              Уровень <span className="text-accent neo-text-glow">{info.level}</span>
            </span>
            <span className="text-xs font-semibold text-ink-soft">{Math.floor(info.totalXp)} XP</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-sunken shadow-neo-inset-sm">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-deep to-accent"
              initial={false}
              animate={{ width: `${info.progress}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.55 }}
              style={{ boxShadow: '0 0 14px rgba(76,201,240,.7)' }}
            />
          </div>
        </div>
        {screen === 'dash' && (
          <button
            onClick={() => setBuilder(!builder)}
            title="Режим конструктора — перетаскивай карточки"
            aria-pressed={builder}
            className={cn(
              'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg shadow-neo-sm transition-colors active:shadow-neo-inset-sm',
              builder ? 'bg-accent text-[#0e141c]' : 'bg-surface text-ink-soft',
            )}
          >
            🛠
          </button>
        )}
        <div className="text-right">
          <button onClick={titleClick} className="font-display text-xs font-bold text-ink-soft">
            SLV: Cloud
          </button>
          {user?.email && <div className="max-w-[140px] truncate text-[10px] text-ink-faint">{user.email}</div>}
        </div>
      </div>
    </header>
  );
}
