import { motion } from 'framer-motion';
import { useStore, type Screen } from '../../store/useStore';
import { useConfig } from '../../store/selectors';

const ITEMS: { id: Screen; icon: string; label: string }[] = [
  { id: 'dash', icon: '🏠', label: 'День' },
  { id: 'bogdan', icon: '👦', label: 'Фокус' },
  { id: 'stats', icon: '📊', label: 'Стата' },
  { id: 'editor', icon: '🛠', label: 'Редактор' },
  { id: 'masters', icon: '👥', label: 'Мастера' },
];

export function BottomNav() {
  const screen = useStore((s) => s.screen);
  const setScreen = useStore((s) => s.setScreen);
  const { focus } = useConfig();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(env(safe-area-inset-bottom),12px)]">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-surface/90 p-1.5 shadow-neo-lg backdrop-blur-xl">
        {ITEMS.map((item) => {
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className="relative grid h-12 w-12 place-items-center rounded-full sm:w-[58px]"
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-sunken shadow-neo-inset-sm"
                  style={{ boxShadow: 'inset 3px 3px 6px #11151c, inset -3px -3px 6px #252f3e, 0 0 14px -3px var(--accent)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className="relative z-10 text-xl transition-transform duration-200"
                style={{ transform: active ? 'translateY(-1px) scale(1.12)' : 'none', filter: active ? 'none' : 'grayscale(.5) opacity(.65)' }}
              >
                {item.id === 'bogdan' ? focus.emoji : item.icon}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
