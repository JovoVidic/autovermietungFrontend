
// src/admin/AdminView.tsx
import { useEffect, useMemo, useState } from 'react';
import { fetchCars, fetchCarById } from '../src/api/client';
import type { Car } from '../src/types/car';
import ErrorAlert from '../src/ui/ErrorAlert';
import { formatServerError, type ErrorBoxData } from '../utils/errors';
import { validateCarInput } from './validation';
import AdminCarForm from './AdminCarForm';
import AdminCarDetails from './AdminCarDetails';
import AdminCarsList from './AdminCarsList';
import { useAuth } from '../src/contexts/AuthContext';
import Login from '../src/components/Login';

// ------------------------------
// Typen
// ------------------------------

type CarFormInput = {
  marke: string;
  modell: string;
  kennzeichen: string;
  verfuegbar: boolean;
  preisProTag: number | string;
  category: string;
  locationId: number | string;
  transmission: string;
  fuel: string;
  seatCount: number | string;
};

// identisches Mapping wie in src/api/client.ts
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

// Rentals-Typ lokal, da nicht im client exportiert
type Rental = {
  id: number;
  autoId: number;
  customerName?: string | null;
  startDatum: string; // YYYY-MM-DD
  endDatum: string;   // YYYY-MM-DD
  preisGesamt?: number | null;
  status?: string | null;
};

function normalizeRental(raw: any, autoIdFallback: number): Rental {
  return {
    id: Number(raw.id),
    autoId: Number(raw.autoId ?? autoIdFallback),
    customerName: raw.customerName ?? raw.kunde ?? null,
    startDatum: raw.startDatum ?? raw.start_date,
    endDatum: raw.endDatum ?? raw.end_date,
    preisGesamt: raw.preisGesamt ?? raw.total_price ?? null,
    status: raw.status ?? null,
  };
}

// ------------------------------
// CRUD-Calls (lokal), an dein Backend angepasst
// ------------------------------

async function createCarApi(input: CarFormInput): Promise<Car> {
  const payload = {
    marke: input.marke.trim(),
    modell: input.modell.trim(),
    kennzeichen: input.kennzeichen.trim(),
    verfuegbar: Boolean(input.verfuegbar),
    preisProTag: Number(input.preisProTag),
    category: input.category ?? null,
    locationId:
      input.locationId === '' || input.locationId == null ? null : Number(input.locationId),
    transmission: input.transmission ?? null,
    fuel: input.fuel ?? null,
    seatCount: input.seatCount === '' || input.seatCount == null ? null : Number(input.seatCount),
  };

  const res = await fetch('/api/autos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg}`);
  }
  const data = await res.json();
  return normalizeCar(data);
}

async function updateCarApi(id: number | string, input: CarFormInput): Promise<Car> {
  const payload = {
    marke: input.marke.trim(),
    modell: input.modell.trim(),
    kennzeichen: input.kennzeichen.trim(),
    verfuegbar: Boolean(input.verfuegbar),
    preisProTag: Number(input.preisProTag),
    category: input.category ?? null,
    locationId:
      input.locationId === '' || input.locationId == null ? null : Number(input.locationId),
    transmission: input.transmission ?? null,
    fuel: input.fuel ?? null,
    seatCount: input.seatCount === '' || input.seatCount == null ? null : Number(input.seatCount),
  };

  const res = await fetch(`/api/autos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg}`);
  }
  const data = await res.json();
  return normalizeCar(data);
}

async function deleteCarApi(id: number | string): Promise<void> {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`/api/autos/${id}`, {
    method: 'DELETE',
    headers: { 
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg}`);
  }
}

async function fetchCarRentalsApi(autoId: number | string): Promise<Rental[]> {
  const res = await fetch(`/api/autos/${autoId}/rentals`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((r: any) => normalizeRental(r, Number(autoId)));
}

// ------------------------------
// AdminView
// ------------------------------

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; car: Car }
  | { kind: 'details'; carId: number | string };

export default function AdminView() {
  const { isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  const [mode, setMode] = useState<Mode>({ kind: 'list' });

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <button onClick={logout} style={{ float: 'right' }}>Logout</button>
      </div>
      {mode.kind !== 'list' && (
        <button onClick={() => setMode({ kind: 'list' })} style={{ marginBottom: 12 }}>
          ← Zur Liste
        </button>
      )}

      {mode.kind === 'list' && (
        <AdminCarsList
          onCreateNew={() => setMode({ kind: 'create' })}
          onEdit={(car) => setMode({ kind: 'edit', car })}
          onDetails={(car) => setMode({ kind: 'details', carId: car.id })}
        />
      )}

      {mode.kind === 'create' && (
        <AdminCarForm
          onCancel={() => setMode({ kind: 'list' })}
          onSaved={(saved) => setMode({ kind: 'details', carId: saved.id })}
        />
      )}

      {mode.kind === 'edit' && (
        <AdminCarForm
          initial={mode.car}
          onCancel={() => setMode({ kind: 'list' })}
          onSaved={(saved) => setMode({ kind: 'details', carId: saved.id })}
        />
      )}

      {mode.kind === 'details' && (
        <AdminCarDetails
          carId={mode.carId}
          onBack={() => setMode({ kind: 'list' })}
          onEdit={(car) => setMode({ kind: 'edit', car })}
        />
      )}
    </div>
  );
}
