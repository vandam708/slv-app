// Date helpers — keep the ru-RU "dd.mm.yyyy" format the original app uses as localStorage keys.

export function todayRu(d: Date = new Date()): string {
  return d.toLocaleDateString('ru-RU');
}

export function ruToTs(dateStr: string): number {
  const [dd, mm, yyyy] = String(dateStr || '').split('.');
  if (!dd || !mm || !yyyy) return NaN;
  return new Date(`${yyyy}-${mm}-${dd}`).getTime();
}

export function ruToInputDate(dateStr: string): string {
  const [dd, mm, yyyy] = String(dateStr || '').split('.');
  if (!dd || !mm || !yyyy) return '';
  return `${yyyy}-${mm}-${dd}`;
}

export function dateToRu(d: Date): string {
  return d.toLocaleDateString('ru-RU');
}
