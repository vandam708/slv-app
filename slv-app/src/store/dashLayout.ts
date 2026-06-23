// Dashboard card layout: which cards live in which column and in what order.
// Persisted locally (device UI preference) — NOT a cloud-synced `slv_*` key.

export const DASH_CARD_IDS = ['energy', 'quests', 'sleep', 'water', 'air', 'nutri', 'sport', 'fizz'] as const;
export type DashCardId = (typeof DASH_CARD_IDS)[number];

export const DEFAULT_DASH_LAYOUT: string[][] = [
  ['energy', 'sleep', 'quests'],
  ['water', 'air', 'nutri'],
  ['sport', 'fizz'],
];

const LS_KEY = 'dash_layout_v1';

/**
 * Repair any stored layout: drop unknown ids, dedupe, append newly-added cards.
 * Empty columns are preserved on purpose — an emptied lane stays as a drop target
 * so the user can move cards back into it.
 */
export function sanitizeLayout(layout: unknown): string[][] {
  const known = new Set<string>(DASH_CARD_IDS);
  let cols: string[][];
  if (Array.isArray(layout) && layout.length >= 1 && layout.every((c) => Array.isArray(c))) {
    cols = (layout as unknown[][]).map((c) => c.filter((x): x is string => typeof x === 'string' && known.has(x)));
  } else {
    cols = DEFAULT_DASH_LAYOUT.map((c) => [...c]);
  }
  const seen = new Set<string>();
  cols = cols.map((c) => c.filter((id) => (seen.has(id) ? false : (seen.add(id), true))));
  if (cols.length === 0) cols = DEFAULT_DASH_LAYOUT.map((c) => [...c]);
  const missing = DASH_CARD_IDS.filter((id) => !seen.has(id));
  if (missing.length) cols[cols.length - 1].push(...missing);
  return cols;
}

export function loadDashLayout(): string[][] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return sanitizeLayout(raw ? JSON.parse(raw) : null);
  } catch {
    return DEFAULT_DASH_LAYOUT.map((c) => [...c]);
  }
}

export function saveDashLayout(layout: string[][]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(layout));
  } catch {
    /* ignore */
  }
}
