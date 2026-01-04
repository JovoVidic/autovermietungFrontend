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

/** Liste aller Autos */
export async function fetchCars(): Promise<Car[]> {
  const res = await fetch(`/api/autos`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCar) : [];
}

/** Auto-Details */
export async function fetchCarById(id: number | string): Promise<Car> {
  const res = await fetch(`/api/autos/${id}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return normalizeCar(await res.json());
}

/** Autos filtern */
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
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCar) : [];
}

/** Auto zurückgeben */
export async function returnAuto(id: number | string): Promise<Car> {
  const res = await fetch(`/api/autos/${id}/return`, { method: 'POST', headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json().catch(() => null);
  return data ? normalizeCar(data) : await fetchCarById(id);
}

/** Locations */
export type Location = {
  id: number;
  name: string;
  adresse?: string | null;
  stadt?: string | null;
  plz?: string | null;
};

export async function fetchLocations(): Promise<Location[]> {
  const res = await fetch(`/api/locations`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
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

export function extractUniqueCities(locations: Location[]): string[] {
  const set = new Set<string>();
  locations.forEach(l => {
    const city = (l.stadt ?? '').trim();
    if (city) set.add(city);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'de'));
}
