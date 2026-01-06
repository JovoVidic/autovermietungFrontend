
// src/admin/AdminCarsList.tsx
import { useEffect, useState } from 'react';
import { fetchCars, deleteCar } from '../api/client';
import type { Car } from '../types/car';
import ErrorAlert from '../ui/ErrorAlert';
import { formatServerError, type ErrorBoxData } from '../../utils/errors';

type Props = {
  onCreateNew: () => void;
  onEdit: (car: Car) => void;
  onDetails: (car: Car) => void;
};

export default function AdminCarsList({ onCreateNew, onEdit, onDetails }: Props) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorBox, setErrorBox] = useState<ErrorBoxData | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const list = await fetchCars();
      setCars(list);
      setErrorBox(null);
    } catch (e: any) {
      setErrorBox(formatServerError(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id: number | string) => {
    if (!confirm('Wirklich löschen?')) return;
    try {
      await deleteCar(id);
      setCars(prev => prev.filter(c => String(c.id) !== String(id)));
    } catch (e: any) {
      setErrorBox(formatServerError(e?.message ?? e));
    }
  };

  return (
    <div>
      <h2>Admin – Autos</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={onCreateNew}>+ Auto hinzufügen</button>
      </div>

      {errorBox && <ErrorAlert error={errorBox} />}
      {loading ? (
        <div>Lade…</div>
      ) : (
        <table cellPadding={6} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th>ID</th><th>Marke</th><th>Modell</th><th>Kennzeichen</th><th>Preis/Tag</th><th>Verfügbar</th><th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {cars.map(c => (
              <tr key={String(c.id)} style={{ borderBottom: '1px solid #eee' }}>
                <td>{c.id}</td>
                <td>{c.marke}</td>
                <td>{c.modell}</td>
                <td>{c.kennzeichen}</td>
                <td>{c.preisProTag?.toFixed(2)} CHF</td>
                <td>{c.verfuegbar ? 'ja' : 'nein'}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button onClick={() => onEdit(c)}>Bearbeiten</button>{' '}
                  <button onClick={() => onDetails(c)}>Details</button>{' '}
                  <button onClick={() => onDelete(c.id)}>Löschen</button>
                </td>
              </tr>
            ))}
            {cars.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 12 }}>Keine Autos gefunden.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
