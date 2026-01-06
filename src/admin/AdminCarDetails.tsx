
// src/admin/AdminCarDetails.tsx
import { useEffect, useState } from 'react';
import type { Car } from '../types/car';
import { fetchCarById, fetchCarRentals, type Rental } from '../api/client';
import ErrorAlert from '../ui/ErrorAlert';
import { formatServerError, type ErrorBoxData } from '../../utils/errors';

type Props = {
  carId: number | string;
  onBack: () => void;
  onEdit: (car: Car) => void;
};

export default function AdminCarDetails({ carId, onBack, onEdit }: Props) {
  const [car, setCar] = useState<Car | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorBox, setErrorBox] = useState<ErrorBoxData | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const c = await fetchCarById(carId);
      setCar(c);
      const r = await fetchCarRentals(carId);
      setRentals(r);
      setErrorBox(null);
    } catch (e: any) {
      setErrorBox(formatServerError(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [carId]);

  return (
    <div>
      <button onClick={onBack}>← Zurück</button>
      {loading && <div>Lade…</div>}
      {errorBox && <ErrorAlert error={errorBox} />}

      {car && (
        <>
          <h3>{car.marke} {car.modell}</h3>
          <div>Kennzeichen: {car.kennzeichen}</div>
          <div>Preis/Tag: {car.preisProTag.toFixed(2)} CHF</div>
          <div>Status: {car.verfuegbar ? 'verfügbar' : 'nicht verfügbar'}</div>
          {car.category && <div>Kategorie: {String(car.category)}</div>}
          {car.location && <div>Standort: {car.location.name} (ID: {car.location.id})</div>}
          {car.transmission && <div>Getriebe: {String(car.transmission)}</div>}
          {car.fuel && <div>Kraftstoff: {String(car.fuel)}</div>}
          {car.seatCount != null && <div>Sitzanzahl: {car.seatCount}</div>}

          <div style={{ marginTop: 12 }}>
            <button onClick={() => onEdit(car)}>Bearbeiten</button>
          </div>

          <h4 style={{ marginTop: 20 }}>Mieteinträge</h4>
          {rentals.length === 0 ? (
            <div>Keine Mieteinträge vorhanden.</div>
          ) : (
            <table cellPadding={6} style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th>ID</th><th>Kunde</th><th>Von</th><th>Bis</th><th>Preis</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td>{r.id}</td>
                    <td>{r.customerName ?? '—'}</td>
                    <td>{r.startDatum}</td>
                    <td>{r.endDatum}</td>
                    <td>{r.preisGesamt != null ? `${r.preisGesamt.toFixed?.(2) ?? r.preisGesamt} CHF` : '—'}</td>
                    <td>{r.status ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
