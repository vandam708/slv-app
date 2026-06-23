import { motion } from 'framer-motion';
import { Orb } from '../components/three/Orb';
import { NeoCard } from '../components/ui/NeoCard';
import { loginWithGoogle } from '../lib/firebase';

export function Auth() {
  return (
    <div className="grid min-h-[100svh] place-items-center px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
        <div className="mx-auto mb-2 grid place-items-center">
          <Orb color="#4cc9f0" intensity={0.7} size={170} />
        </div>
        <h1 className="font-display text-6xl font-bold text-accent neo-text-glow">SLV</h1>
        <p className="mb-10 mt-2 text-ink-soft">Стал Лучше Чем Вчера</p>
        <NeoCard tilt={false} accent="#4cc9f0">
          <button
            onClick={() => loginWithGoogle().catch((e) => alert('Ошибка входа: ' + e.message))}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-surface px-4 py-3 font-semibold text-ink shadow-neo-sm active:shadow-neo-inset-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="22" height="22" alt="" />
            Войти через Google
          </button>
          <p className="mt-4 text-xs text-ink-faint">☁️ Cloud Sync Active</p>
        </NeoCard>
      </motion.div>
    </div>
  );
}
