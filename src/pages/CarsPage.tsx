// src/pages/CarsPage.tsx

import { useEffect, useState, useMemo } from 'react';
import { useQueryParams } from '../hooks/useQueryParams';
import { fetchCars, fetchCarsFiltered } from '../api/client';
import type { Car } from '../types/car';
import FilterSidebar from '../components/FilterSidebar';
import CarGrid from '../components/CarGrid';

export default function CarsPage() {
  const { params, setParams } = useQueryParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);


  
  const sortedCars = useMemo(() => {
  if (!sortDir) return cars; // 👈 keine Sortierung

  const list = [...cars];
  list.sort((a, b) => {
    const pa = Number(a.preisProTag ?? 0);
    const pb = Number(b.preisProTag ?? 0);
    return sortDir === 'asc' ? pa - pb : pb - pa;
  });
  return list;
}, [cars, sortDir]);



  const filters = useMemo(() => {
  const o: any = {};
  const keys = ['category','locationId','city','maxPreis','minSitze','transmission','fuel'] as const;
  keys.forEach(k => {
    const v = params.get(k);
    if (!v) return;
    if (k === 'locationId' || k === 'maxPreis' || k === 'minSitze') {
      const num = Number(v);
      if (!Number.isNaN(num)) o[k] = num;
    } else {
      o[k] = v;
    }
  });
  return o;
}, [params]);


  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = Object.keys(filters).length ? await fetchCarsFiltered(filters) : await fetchCars();
        setCars(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? 'Fehler beim Laden');
      } finally {
        setLoading(false);
      }
    })();
  }, [filters]);

      return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 16,
          maxWidth: 1200,
          margin: '2rem auto',
        }}
      >
        <aside>
          <FilterSidebar
            values={{
              category: params.get('category') ?? '',
              city: params.get('city') ?? '',
              locationId: params.get('locationId') ?? '',
              maxPreis: params.get('maxPreis') ?? '',
              minSitze: params.get('minSitze') ?? '',
              transmission: params.get('transmission') ?? '',
              fuel: params.get('fuel') ?? '',
            }}
            onChange={partial => setParams(partial)}
            onReset={() =>
              setParams({
                category: '',
                city: '',
                locationId: '',
                maxPreis: '',
                minSitze: '',
                transmission: '',
                fuel: '',
              })
            }
          />
        </aside>

        <main>
          <h2>Ergebnisse</h2>

          {/* SORTIER-BUTTONS */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setSortDir('asc')}
                style={{
                  fontWeight: sortDir === 'asc' ? 'bold' : 'normal'
                }}
              >
                Preis ↑
              </button>

              <button
                onClick={() => setSortDir('desc')}
                style={{
                  fontWeight: sortDir === 'desc' ? 'bold' : 'normal'
                }}
              >
                Preis ↓
              </button>

              {sortDir && (
                <button onClick={() => setSortDir(null)}>
                  ✖ Sortierung aufheben
                </button>
              )}
            </div>


          {loading && <div>⏳ Lade…</div>}
          {error && <div style={{ color: 'crimson' }}>{error}</div>}

          {/* mit Sortierung */}
          {!loading && !error && <CarGrid cars={sortedCars} />}
        </main>
      </div>
    );

}
