
// src/api/client.ts
import type { Car, AutoCategory, Fuel, Transmission } from '../types/car';

// Mapper: passt camelCase & ggf. snake_case tolerant an
function normalizeCar(raw: any): Car {
  return {
    id: raw.id,
    marke: raw.marke,
    modell: raw.modell,
    kennzeichen: raw.kennzeichen,
    verfuegbar: raw.verfuegbar,
    preisProTag: raw.preisProTag ?? raw.preis_pro_tag,
    category: raw.category,
    location: raw.location ?? null,
    transmission: raw.transmission,
    fuel: raw.fuel,
    seatCount: raw.seatCount ?? raw.seat_count,
  };
}

/** Liste: GET /api/autos (über Vite-Proxy) */
export async function fetchCars(): Promise<Car[]> {
  const res = await fetch(`/api/autos`, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCar) : [];
}

/** Detail: GET /api/autos/{id} (über Vite-Proxy) */
export async function fetchCarById(id: number | string): Promise<Car> {
  const res = await fetch(`/api/autos/${id}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg}`);
  }
  return normalizeCar(await res.json());
}

/** Filter: GET /api/autos/filter?... (über Vite-Proxy) */
export async function fetchCarsFiltered(params: {
  category?: AutoCategory;
  locationId?: number;
  maxPreis?: number;
  minSitze?: number;
  transmission?: Transmission;
  fuel?: Fuel;
}): Promise<Car[]> {
  const url = new URL(`/api/autos/filter`, window.location.origin);

  (Object.keys(params) as (keyof typeof params)[]).forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && `${val}`.trim() !== '') {
      url.searchParams.set(String(key), String(val));
    }
  });

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCar) : [];
}

/** Rückgabe: POST /api/autos/{id}/return (über Vite-Proxy) */
export async function returnAuto(id: number | string): Promise<Car> {
  const res = await fetch(`/api/autos/${id}/return`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg}`);
  }
  const data = await res.json().catch(() => null);
  return data ? normalizeCar(data) : await fetchCarById(id);
}

/* =========================
   NEU: rentAuto für BookingForm
   ========================= */

/** Payload, die BookingForm übergibt */
export type RentAutoPayload = {
  autoId: number;
  customerId: number | string;
  startDatum: string; // 'YYYY-MM-DD'
  endDatum: string;   // 'YYYY-MM-DD'
  insuranceOption?: 'TEILKASKO' | 'VOLLKASKO';
};

/** Hilfsfunktion: Tagesdifferenz in UTC (Ende exklusiv) */
function daysBetween(startISO: string, endISO: string): number {
  const toUTCDate = (d: string) => {
    const [y, m, dd] = d.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, dd));
  };
  const start = toUTCDate(startISO);
  const end = toUTCDate(endISO);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = (end.getTime() - start.getTime()) / msPerDay;
  return Math.max(0, Math.floor(diff)); // Ende exklusiv
}

/** NEU: Miete eines Autos — gibt den Gesamtpreis (number) zurück */
export async function rentAuto(payload: RentAutoPayload): Promise<number> {
  // Annahme 1: Es gibt eine dedizierte Buchungsroute (z. B. /api/rentals oder /api/autos/{id}/rent)
  // Bevorzugt: /api/rentals (da Buchungen oft eine eigene Ressource sind)
  // → Passe den Pfad unten an dein Backend an, falls abweichend.

  // Primärversuch: POST /api/rentals (empfohlen)
  let res = await fetch(`/api/autos/${payload.autoId}/vermieten`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify(payload),
});

  // Fallback: Falls 404/405, versuche POST /api/autos/{id}/rent
  if (res.status === 404 || res.status === 405) {
    res = await fetch(`/api/autos/${payload.autoId}/vermieten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg}`);
  }

  // Manche Backends liefern 204 No Content → kein JSON parsen
  const rawText = await res.text().catch(() => '');
  if (!rawText) {
    // Wenn kein Inhalt zurückkommt, Preis lokal schätzen:
    // Hole das Auto & berechne: Tage * preisProTag
    const car = await fetchCarById(payload.autoId);
    const tage = daysBetween(payload.startDatum, payload.endDatum);
    const basis = Number(car.preisProTag ?? 0);
    return Number((tage * basis).toFixed(2));
  }

  // Tolerant mehrere mögliche Response-Formate unterstützen
  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    // Wenn die API direkt nur eine Zahl schickt (z. B. "123.45")
    const asNumber = Number(rawText);
    if (!Number.isNaN(asNumber)) return asNumber;
    throw new Error(`Unerwartetes Antwortformat: ${rawText}`);
  }

  // Mögliche Formen:
  // 1) { preis: 123.45 }
  // 2) { totalPrice: 123.45 }
  // 3) { booking: { preis: ... } }
  // 4) { auto: {...}, tage: n } → berechne aus auto.preisProTag * tage
  // 5) { preis_pro_tag: ..., start_datum: ..., end_datum: ... }
  // 6) Direkt eine Zahl (oben behandelt)

  // Direkte Felder
  if (typeof data === 'number') return data;
  if (data?.preis != null) return Number(data.preis);
  if (data?.totalPrice != null) return Number(data.totalPrice);

  // Verschachtelt
  if (data?.booking?.preis != null) return Number(data.booking.preis);
  if (data?.reservation?.preis != null) return Number(data.reservation.preis);

  // Berechnung aus Auto + Tage
  const carRaw = data?.auto ?? data?.car;
  const tage =
    data?.tage ??
    data?.days ??
    daysBetween(
      data?.startDatum ?? data?.start_date ?? payload.startDatum,
      data?.endDatum ?? data?.end_date ?? payload.endDatum
    );

  if (carRaw) {
    const car = normalizeCar(carRaw);
    const basis = Number(car.preisProTag ?? 0);
    return Number((basis * Number(tage ?? 0)).toFixed(2));
  }

  // Letzter Versuch: snake_case Felder direkt
  if (data?.preis_pro_tag != null) {
    const basis = Number(data.preis_pro_tag);
    const start =
      data?.start_datum ?? data?.startDate ?? data?.start ?? payload.startDatum;
    const end =
      data?.end_datum ?? data?.endDate ?? data?.end ?? payload.endDatum;
    const d = daysBetween(String(start), String(end));
    return Number((basis * d).toFixed(2));
  }

  throw new Error('Antwort enthält keinen Preis und kein berechenbares Format.');
}

// src/api/client.ts
// ... (deine bestehenden Imports & Funktionen)

export type Location = {
  id: number;
  name: string;
  adresse?: string | null;
  stadt?: string | null; // aus SQL "stadt"
  plz?: string | null;
};

/** Alle Standorte (inkl. Stadt) laden */
export async function fetchLocations(): Promise<Location[]> {
  const res = await fetch(`/api/locations`, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg}`);
  }
  const data = await res.json();
  // Tolerant mappen (falls API snake_case liefert)
  return Array.isArray(data)
    ? data.map((raw: any) => ({
        id: Number(raw.id),
        name: raw.name,
        adresse: raw.adresse ?? raw.address ?? null,
        stadt: raw.stadt ?? raw.city ?? null,
        plz: raw.plz ?? raw.postalCode ?? null,
      }))
    : [];
}

/** Hilfsfunktion: Stadtliste (unique, sortiert) aus Locations */
export function extractUniqueCities(locations: Location[]): string[] {
  const set = new Set<string>();
  locations.forEach(l => {
    const city = (l.stadt ?? '').trim();
    if (city) set.add(city);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'de'));
}
