// admin/validation.ts
export function validateCarInput(payload: {
  marke: string;
  modell: string;
  kennzeichen: string;
  verfuegbar: boolean;
  preisProTag: number;
  category: string | null;
  locationId: number | null;
  transmission: string | null;
  fuel: string | null;
  seatCount: number | null;
}): string | null {
  if (!payload.marke.trim()) return 'Marke ist erforderlich.';
  if (!payload.modell.trim()) return 'Modell ist erforderlich.';
  if (!payload.kennzeichen.trim()) return 'Kennzeichen ist erforderlich.';
  if (payload.preisProTag <= 0) return 'Preis pro Tag muss größer als 0 sein.';
  if (payload.seatCount !== null && payload.seatCount <= 0) return 'Sitzanzahl muss größer als 0 sein.';
  return null; // gültig
}
