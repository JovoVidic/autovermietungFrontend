
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
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, maxWidth: 1200, margin: '2rem auto' }}>
      <aside>
        <FilterSidebar          
          values={{
              category: params.get('category') ?? '',
              city: params.get('city') ?? '',                // ⬅️ NEU
              locationId: params.get('locationId') ?? '',    // optional beibehalten
              maxPreis: params.get('maxPreis') ?? '',
              minSitze: params.get('minSitze') ?? '',
              transmission: params.get('transmission') ?? '',
              fuel: params.get('fuel') ?? '',
            }}
          onChange={(partial) => setParams(partial)}
            onReset={() => setParams({
              category:'', city:'', locationId:'', maxPreis:'', minSitze:'', transmission:'', fuel:''
          })}
        />
      </aside>

      <main>
        <h2>Ergebnisse</h2>
        {loading && <div>⏳ Lade…</div>}
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        {!loading && !error && <CarGrid cars={cars} />}
      </main>
    </div>
  );
}
