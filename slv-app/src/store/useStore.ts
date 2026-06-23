import { create } from 'zustand';
import type { User } from 'firebase/auth';
import {
  watchAuth,
  watchCloud,
  pushCloud,
  bootstrapCloud,
} from '../lib/firebase';
import type { SecretNote } from '../lib/crypto';
import type { DataMap } from '../domain/logic';
import { loadDashLayout, saveDashLayout } from './dashLayout';

export type Screen = 'dash' | 'bogdan' | 'stats' | 'editor' | 'masters' | 'secret';

function isSyncKey(key: string): boolean {
  return !!key && (key.startsWith('slv_') || key === 'bogdan_config_tasks');
}

function loadLocal(): DataMap {
  const out: DataMap = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !isSyncKey(key)) continue;
      const val = localStorage.getItem(key);
      if (val !== null) out[key] = val;
    }
  } catch { /* SSR / private mode */ }
  return out;
}

// --- cloud write buffering (module scope so it doesn't trigger renders) ---
let writeBuffer: Record<string, string> = {};
let deleteBuffer = new Set<string>();
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let cloudUnsub: (() => void) | null = null;
let bootstrappedOnce = false;

interface StoreState {
  user: User | null;
  authReady: boolean;
  data: DataMap;
  screen: Screen;
  // dashboard builder mode + persisted card layout
  builder: boolean;
  dashLayout: string[][];
  // secret vault session (in-memory only)
  secretKey: string | null;
  secretNotes: SecretNote[];

  setScreen: (s: Screen) => void;
  setBuilder: (b: boolean) => void;
  setDashLayout: (l: string[][]) => void;
  setKey: (key: string, value: string) => void;
  removeKey: (key: string) => void;
  setMany: (obj: Record<string, string>) => void;

  setSecretSession: (key: string | null, notes: SecretNote[]) => void;

  initAuth: () => void;
}

export const useStore = create<StoreState>((set, get) => {
  function scheduleSync() {
    const user = get().user;
    if (!user) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(flushSync, 700);
  }

  function flushSync() {
    const user = get().user;
    if (!user) return;
    const writes = { ...writeBuffer };
    const deletes = Array.from(deleteBuffer);
    writeBuffer = {};
    deleteBuffer = new Set();
    if (Object.keys(writes).length === 0 && deletes.length === 0) return;
    pushCloud(user.uid, writes, deletes).catch((e) => console.error('Cloud sync error:', e));
  }

  return {
    user: null,
    authReady: false,
    data: loadLocal(),
    screen: 'dash',
    builder: false,
    dashLayout: loadDashLayout(),
    secretKey: null,
    secretNotes: [],

    setScreen: (s) => set({ screen: s }),
    setBuilder: (b) => set({ builder: b }),
    setDashLayout: (l) => {
      saveDashLayout(l);
      set({ dashLayout: l });
    },

    setKey: (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch { /* ignore */ }
      set((st) => ({ data: { ...st.data, [key]: value } }));
      if (isSyncKey(key)) {
        writeBuffer[key] = value;
        deleteBuffer.delete(key);
        scheduleSync();
      }
    },

    removeKey: (key) => {
      try {
        localStorage.removeItem(key);
      } catch { /* ignore */ }
      set((st) => {
        const next = { ...st.data };
        delete next[key];
        return { data: next };
      });
      if (isSyncKey(key)) {
        delete writeBuffer[key];
        deleteBuffer.add(key);
        scheduleSync();
      }
    },

    setMany: (obj) => {
      try {
        Object.entries(obj).forEach(([k, v]) => localStorage.setItem(k, v));
      } catch { /* ignore */ }
      set((st) => ({ data: { ...st.data, ...obj } }));
      Object.entries(obj).forEach(([k, v]) => {
        if (isSyncKey(k)) {
          writeBuffer[k] = v;
          deleteBuffer.delete(k);
        }
      });
      scheduleSync();
    },

    setSecretSession: (key, notes) => set({ secretKey: key, secretNotes: notes }),

    initAuth: () => {
      watchAuth((user) => {
        set({ user, authReady: true });
        if (cloudUnsub) {
          cloudUnsub();
          cloudUnsub = null;
        }
        if (!user) return;

        cloudUnsub = watchCloud(user.uid, async (cloud) => {
          if (cloud === null) return;
          if (cloud && Object.keys(cloud).length) {
            const incoming: DataMap = {};
            for (const [k, v] of Object.entries(cloud)) {
              if (!isSyncKey(k) || typeof v !== 'string') continue;
              incoming[k] = v;
              try {
                localStorage.setItem(k, v);
              } catch { /* ignore */ }
            }
            set((st) => ({ data: { ...st.data, ...incoming } }));
          } else if (!bootstrappedOnce) {
            bootstrappedOnce = true;
            const local = loadLocal();
            const payload: Record<string, string> = {};
            Object.entries(local).forEach(([k, v]) => v !== undefined && (payload[k] = v));
            bootstrapCloud(user.uid, payload).catch((e) => console.error('Bootstrap error:', e));
          }
        });
      });
    },
  };
});
