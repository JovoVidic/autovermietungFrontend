
// src/components/BookingHero.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLocations, extractUniqueCities } from '../api/client';

export default function BookingHero() {
  const navigate = useNavigate();
  const [city, setCity] = useState<string>('');        // <— statt locationId
  const [startDatum, setStartDatum] = useState('');
  const [endDatum, setEndDatum] = useState('');
  const [category, setCategory] = useState<string>('');

  // Städte laden
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCities(true);
        const locations = await fetchLocations();
        if (!alive) return;
        setCities(extractUniqueCities(locations));
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? 'Standorte konnten nicht geladen werden.');
      } finally {
        if (!alive) return;
        setLoadingCities(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (city) qs.set('city', city);               // <— city statt locationId
    if (category) qs.set('category', category);
    if (startDatum) qs.set('startDatum', startDatum);
    if (endDatum) qs.set('endDatum', endDatum);
    navigate(`/autos?${qs.toString()}`);
  }

  return (
    <form onSubmit={submit}
      style={{
        background: 'white',
        color: '#111',
        borderRadius: 12,
        padding: 16,

        //Layout
        display: 'grid',
        gridTemplateColumns: '1fr', // 1fr 1fr 1fr auto
        gap: 14,
      }}
    >
      <div>
        <label>Standort</label><br />
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          disabled={loadingCities}
        >
          <option value="">{loadingCities ? 'Lade Städte…' : 'Beliebig'}</option>
          {cities.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {err && <div style={{ color: 'crimson' }}>{err}</div>}
      </div>

      <div>
        <label>Startdatum</label><br />
        <input type="date" value={startDatum} onChange={e => setStartDatum(e.target.value)} />
      </div>
      <div>
        <label>Enddatum</label><br />
        <input type="date" value={endDatum} onChange={e => setEndDatum(e.target.value)} />
      </div>
      <div>
        <label>Kategorie</label><br />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Beliebig</option>
          <option value="SMALL">Small</option>
          <option value="COMPACT">Compact</option>
          <option value="SUV">SUV</option>
          <option value="LUXURY">Luxury</option>
          <option value="VAN">Van</option>
        </select>
      </div>
      <div style={{ alignSelf: 'end' }}>
        <button type="submit">Suchen</button>
      </div>
    </form>
  );
}
