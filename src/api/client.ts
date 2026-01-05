// src/api/client.ts
import type { Car, AutoCategory, Fuel, Transmission } from '../types/car';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Helper für Auth-Header
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
  const res = await fetch(`${API_BASE_URL}/api/autos`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCar) : [];
}

/** Auto-Details */
export async function fetchCarById(id: number | string): Promise<Car> {
  const res = await fetch(`${API_BASE_URL}/api/autos/${id}`, { headers: { Accept: 'application/json' } });
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
  const url = new URL(`${API_BASE_URL}/api/autos/filter`);
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

/** Auto löschen */
export async function deleteCar(id: number | string): Promise<void> {
  const res = await fetch(`/api/autos/${id}`, { 
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
}

/** Auto erstellen */
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
  const res = await fetch(`${API_BASE_URL}/api/autos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return normalizeCar(await res.json());
}

/** Auto aktualisieren */
export async function updateCar(id: number | string, payload: {
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
  const res = await fetch(`/api/autos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return normalizeCar(await res.json());
}

/** Rental-Typ */
export type Rental = {
  id: number;
  customerName?: string;
  startDatum: string;
  endDatum: string;
  preisGesamt?: number;
  status?: string;
};

/** Mieteinträge für ein Auto abrufen */
export async function fetchCarRentals(carId: number | string): Promise<Rental[]> {
  // TODO: Implementiere den Server-Endpunkt /api/autos/:id/rentals
  // Für jetzt: Leere Liste zurückgeben
  return [];
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
  const res = await fetch(`${API_BASE_URL}/api/locations`, { headers: { Accept: 'application/json' } });
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
