
// utils/date.ts
export function isoToDe(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2,'0')}.${String(m).padStart(2,'0')}.${y}`;
}

export function deToIso(de: string): string {
  // "DD.MM.YYYY" -> "YYYY-MM-DD"
  const [d, m, y] = de.split('.').map(s => s.trim());
  if (!d || !m || !y) return '';
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
}
