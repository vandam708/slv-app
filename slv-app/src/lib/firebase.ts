import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  deleteField,
  type Unsubscribe,
} from 'firebase/firestore';

// Same project as the original app so existing cloud data is reused.
const firebaseConfig = {
  apiKey: 'AIzaSyAhkOgEtlG1Q2byn2PKB6iCySPqM5XocMY',
  authDomain: 'slv-project-a51ff.firebaseapp.com',
  projectId: 'slv-project-a51ff',
  storageBucket: 'slv-project-a51ff.firebasestorage.app',
  messagingSenderId: '561475846978',
  appId: '1:561475846978:web:91f259136416b621d43edb',
  measurementId: 'G-L8C9XEZLH4',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Offline-first cache (replaces the deprecated enableIndexedDbPersistence).
// Guarded so HMR re-evaluation doesn't throw "already initialized".
function initDb() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    return getFirestore(app);
  }
}
const db = initDb();

export const CLOUD_SCHEMA_VERSION = 2;

export function watchAuth(cb: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, cb);
}

export function loginWithGoogle(): Promise<unknown> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export function logout(): Promise<void> {
  return signOut(auth);
}

export function watchCloud(uid: string, cb: (data: Record<string, unknown> | null) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => cb(snap.exists() ? snap.data() : null),
    (err) => {
      console.error('Cloud listener error:', err);
      cb(null);
    },
  );
}

export async function pushCloud(uid: string, writes: Record<string, string>, deletes: string[]): Promise<void> {
  const payload: Record<string, unknown> = { ...writes };
  deletes.forEach((k) => (payload[k] = deleteField()));
  if (Object.keys(payload).length === 0) return;
  payload.__meta = { schemaVersion: CLOUD_SCHEMA_VERSION, updatedAt: serverTimestamp() };
  await setDoc(doc(db, 'users', uid), payload, { merge: true });
}

export async function bootstrapCloud(uid: string, payload: Record<string, string>): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    {
      ...payload,
      __meta: { schemaVersion: CLOUD_SCHEMA_VERSION, updatedAt: serverTimestamp(), bootstrapFromLocalAt: serverTimestamp() },
    },
    { merge: true },
  );
}
