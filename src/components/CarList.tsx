// src/components/CarList.tsx

import { useEffect, useMemo, useState } from 'react';
import { fetchCars } from '../api/client';
import type { Car } from '../types/car';

export default function CarList() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc'); // auf- oder absteigend
  const [query, setQuery] = useState('');

  // Daten laden
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCars();
        setCars(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? 'Fehler beim Laden der Autos');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtern nach Suchbegriff
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cars.filter(c =>
      !q ||
      c.marke.toLowerCase().includes(q) ||
      c.modell.toLowerCase().includes(q) ||
      c.kennzeichen.toLowerCase().includes(q) ||
      (c.location?.name?.toLowerCase().includes(q) ?? false) ||
      (c.location?.stadt?.toLowerCase().includes(q) ?? false)
    );
  }, [cars, query]);

  // Sortieren nach Preis
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const va = a.preisProTag ?? 0;
      const vb = b.preisProTag ?? 0;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return list;
  }, [filtered, sortDir]);

  if (loading) return <div>⏳ Lade Autos…</div>;
  if (error) return <div style={{ color: 'crimson' }}>Fehler: {error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      <h1>🚗 Fahrzeugliste</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Suche: Marke / Modell / Kennzeichen / Standort"
          style={{ flex: 1, padding: '0.5rem' }}
        />

        {/* Sortier-Buttons */}
        <button
          onClick={() => setSortDir('asc')}
          style={{ fontWeight: sortDir === 'asc' ? 'bold' : 'normal' }}
        >
          Preis ↑ Aufsteigend
        </button>

        <button
          onClick={() => setSortDir('desc')}
          style={{ fontWeight: sortDir === 'desc' ? 'bold' : 'normal' }}
        >
          Preis ↓ Absteigend
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sorted.map(car => (
          <li
            key={car.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: '1rem',
              marginBottom: '0.75rem',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>{car.marke} {car.modell}</strong><br />
              <small>#{car.kennzeichen}</small><br />
              <small>
                Standort: {car.location?.name ?? '—'}
                {car.location?.stadt ? ` (${car.location.stadt})` : ''}
              </small>
            </div>
            <div>
              Plätze: {car.seatCount}<br />
              Getriebe: {car.transmission}
            </div>
            <div>
              Kraftstoff: {car.fuel}<br />
              Kategorie: {car.category}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700 }}>
                {Number(car.preisProTag).toFixed(2)} CHF/Tag
              </div>
              <span
                style={{
                  color: car.verfuegbar ? 'green' : 'gray',
                  fontWeight: 600
                }}
              >
                {car.verfuegbar ? 'verfügbar' : 'nicht verfügbar'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
