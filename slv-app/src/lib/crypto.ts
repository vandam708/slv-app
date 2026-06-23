import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

export interface SecretNote {
  id: string;
  title: string;
  text: string;
  date: string;
}

export type UnlockResult =
  | { ok: true; reason: 'NEW_VAULT' | 'UNLOCKED'; notes: SecretNote[] }
  | { ok: false; reason: 'EMPTY_PASSWORD' | 'WRONG_PASSWORD' | 'DECRYPT_ERROR'; notes: [] };

function safeParse(raw: string): SecretNote[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function unlockNotes(encrypted: string | undefined | null, pass: string): UnlockResult {
  if (!pass) return { ok: false, reason: 'EMPTY_PASSWORD', notes: [] };
  if (!encrypted) return { ok: true, reason: 'NEW_VAULT', notes: [] };
  try {
    const bytes = AES.decrypt(encrypted, pass);
    const decrypted = bytes.toString(encUtf8);
    if (!decrypted) return { ok: false, reason: 'WRONG_PASSWORD', notes: [] };
    return { ok: true, reason: 'UNLOCKED', notes: safeParse(decrypted) };
  } catch {
    return { ok: false, reason: 'DECRYPT_ERROR', notes: [] };
  }
}

export function encryptNotes(notes: SecretNote[], pass: string): string | null {
  if (!pass) return null;
  try {
    return AES.encrypt(JSON.stringify(notes || []), pass).toString();
  } catch {
    return null;
  }
}
