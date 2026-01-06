// src/api/client.ts
import type { Car, AutoCategory, Fuel, Transmission } from '../types/car';
export type { Car, AutoCategory, Fuel, Transmission }; // explizit exportieren

/* =========================
   Header Helper
========================= */
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getJsonAuthHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  ...getAuthHeaders(),
});

/* =========================
   Mapper
========================= */
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

/* =========================
   Car API
========================= */
export async function fetchCars(): Promise<Car[]> {
  const res = await fetch(`/api/autos`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCar) : [];
}

export async function fetchCarById(id: number | string): Promise<Car> {
  const res = await fetch(`/api/autos/${id}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return normalizeCar(await res.json());
}

export async function fetchCarsFiltered(params: {
  category?: AutoCategory;
  locationId?: number;
  maxPreis?: number;
  minSitze?: number;
  transmission?: Transmission;
  fuel?: Fuel;
}): Promise<Car[]> {
  const url = new URL(`/api/autos/filter`, window.location.origin);
  (Object.entries(params) as [string, unknown][]).forEach(([key, val]) => {
    if (val !== undefined && val !== null && `${val}`.trim() !== '') url.searchParams.set(key, String(val));
  });

  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCar) : [];
}

export async function returnAuto(id: number | string): Promise<Car> {
  const res = await fetch(`/api/autos/${id}/return`, {
    method: 'POST',
    headers: { Accept: 'application/json', ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json().catch(() => null);
  return data ? normalizeCar(data) : fetchCarById(id);
}

export async function deleteCar(id: number | string): Promise<void> {
  const res = await fetch(`/api/autos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
}

export async function createCar(payload: {
  marke: string;
  modell: string;
  kennzeichen: string;
  verfuegbar: boolean;
  preisProTag: number;
  category?: string | null;
  locationId?: number | null;
  transmission?: string | null;
  fuel?: string | null;
  seatCount?: number | null;
}): Promise<Car> {
  const res = await fetch(`/api/autos`, {
    method: 'POST',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return normalizeCar(await res.json());
}

export async function updateCar(
  id: number | string,
  payload: {
    marke: string;
    modell: string;
    kennzeichen: string;
    verfuegbar: boolean;
    preisProTag: number;
    category?: string | null;
    locationId?: number | null;
    transmission?: string | null;
    fuel?: string | null;
    seatCount?: number | null;
  }
): Promise<Car> {
  const res = await fetch(`/api/autos/${id}`, {
    method: 'PUT',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return normalizeCar(await res.json());
}

/* =========================
   Locations API
========================= */
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
  return Array.from(
    new Set(
      locations
        .map(l => (l.stadt ?? '').trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, 'de'));
}

/* =========================
   Rentals API
========================= */
export type Rental = {
  id: number;
  customerName?: string;
  startDatum: string;
  endDatum: string;
  preisGesamt?: number;
  status?: string;
};

export async function fetchCarRentals(carId: number | string): Promise<Rental[]> {
  const res = await fetch(`/api/autos/${carId}/rentals`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// =========================
// Sortieren Preise
// =========================

export async function fetchCarsSortedAsc(): Promise<Car[]> {
  const res = await fetch(`/api/autos/sort/asc`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCar) : [];
}

export async function fetchCarsSortedDesc(): Promise<Car[]> {
  const res = await fetch(`/api/autos/sort/desc`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCar) : [];
}
