import { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Auth } from './screens/Auth';

const Dashboard = lazy(() => import('./screens/Dashboard').then((m) => ({ default: m.Dashboard })));
const Bogdan = lazy(() => import('./screens/Bogdan').then((m) => ({ default: m.Bogdan })));
const Stats = lazy(() => import('./screens/Stats').then((m) => ({ default: m.Stats })));
const Editor = lazy(() => import('./screens/Editor').then((m) => ({ default: m.Editor })));
const Masters = lazy(() => import('./screens/Masters').then((m) => ({ default: m.Masters })));
const Secret = lazy(() => import('./screens/Secret').then((m) => ({ default: m.Secret })));

const SCREENS = {
  dash: Dashboard,
  bogdan: Bogdan,
  stats: Stats,
  editor: Editor,
  masters: Masters,
  secret: Secret,
} as const;

export default function App() {
  const initAuth = useStore((s) => s.initAuth);
  const authReady = useStore((s) => s.authReady);
  const user = useStore((s) => s.user);
  const screen = useStore((s) => s.screen);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (!authReady) {
    return (
      <div className="grid min-h-[100svh] place-items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-2 border-accent/30 border-t-accent"
        />
      </div>
    );
  }

  // Dev-only: open with ?demo to preview the logged-in UI without Google auth (no cloud sync).
  const demo = import.meta.env.DEV && new URLSearchParams(location.search).has('demo');
  if (!user && !demo) return <Auth />;

  const Active = SCREENS[screen];

  return (
    <div className="min-h-[100svh]">
      <Header />
      <main className="mx-auto max-w-6xl px-3 pb-28 pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Suspense fallback={<div className="grid h-[60vh] place-items-center text-sm text-ink-faint">Загрузка…</div>}>
              <Active />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
