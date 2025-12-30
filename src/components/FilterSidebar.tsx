
// src/components/FilterSidebar.tsx
import { useEffect, useState } from 'react';
import { fetchLocations, extractUniqueCities } from '../api/client';

type Props = {
  values: {
    category: string;
    city?: string;          // ⬅️ NEU
    locationId: string;     // kann bleiben, falls du parallel noch ID brauchst
    maxPreis: string;
    minSitze: string;
    transmission: string;
    fuel: string;
  };
  onChange: (partial: Record<string, string>) => void;
  onReset: () => void;
};

export default function FilterSidebar({ values, onChange, onReset }: Props) {
  const panelStyle: React.CSSProperties = {
    border: '1px solid #eee',
    borderRadius: 8,
    padding: 16,
    background: '#fff',
    color: '#111',
  };
  const titleStyle: React.CSSProperties = { margin: 0, marginBottom: 12, fontWeight: 700, fontSize: '1.1rem' };
  const rowStyle: React.CSSProperties = { display: 'grid', rowGap: 6, marginBottom: 12 };
  const actionsStyle: React.CSSProperties = { display: 'flex', gap: 10, marginTop: 6 };

  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cityErr, setCityErr] = useState<string | null>(null);

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
        setCityErr(e?.message ?? 'Standorte konnten nicht geladen werden.');
      } finally {
        if (!alive) return;
        setLoadingCities(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => e.preventDefault();

  return (
    <form style={panelStyle} onSubmit={handleSubmit}>
      <h3 style={titleStyle}>Filter</h3>

      {/* Kategorie */}
      <div style={rowStyle}>
        <label htmlFor="flt-category">Kategorie</label>
        <select
          id="flt-category"
          value={values.category}
          onChange={(e) => onChange({ category: e.target.value })}
        >
          <option value="">Beliebig</option>
          <option value="SMALL">Small</option>
          <option value="COMPACT">Compact</option>
          <option value="SUV">SUV</option>
          <option value="LUXURY">Luxury</option>
          <option value="VAN">Van</option>
        </select>
      </div>

      {/* ✅ Standort (Stadt) aus /api/locations */}
      <div style={rowStyle}>
        <label htmlFor="flt-city">Standort (Stadt)</label>
        <select
          id="flt-city"
          value={values.city ?? ''}
          onChange={(e) => onChange({ city: e.target.value })}
          disabled={loadingCities}
        >
          <option value="">{loadingCities ? 'Lade Städte…' : 'Beliebig'}</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {cityErr && <div style={{ color: 'crimson' }}>{cityErr}</div>}
      </div>

      {/* Restliche Filter */}
      <div style={rowStyle}>
        <label htmlFor="flt-maxpreis">Max. Preis</label>
        <input
          id="flt-maxpreis"
          type="number"
          step="0.01"
          value={values.maxPreis}
          onChange={(e) => onChange({ maxPreis: e.target.value })}
          placeholder="z. B. 100.00"
        />
      </div>

      <div style={rowStyle}>
        <label htmlFor="flt-minsitze">Min. Sitze</label>
        <input
          id="flt-minsitze"
          type="number"
          value={values.minSitze}
          onChange={(e) => onChange({ minSitze: e.target.value })}
          placeholder="z. B. 4"
        />
      </div>

      <div style={rowStyle}>
        <label htmlFor="flt-transmission">Getriebe</label>
        <select
          id="flt-transmission"
          value={values.transmission}
          onChange={(e) => onChange({ transmission: e.target.value })}
        >
          <option value="">Beliebig</option>
          <option value="MANUAL">Manuell</option>
          <option value="AUTOMATIC">Automatik</option>
        </select>
      </div>

      <div style={rowStyle}>
        <label htmlFor="flt-fuel">Kraftstoff</label>
        <select
          id="flt-fuel"
          value={values.fuel}
          onChange={(e) => onChange({ fuel: e.target.value })}
        >
          <option value="">Beliebig</option>
          <option value="GASOLINE">Benzin</option>
          <option value="DIESEL">Diesel</option>
          <option value="ELECTRIC">Elektro</option>
        </select>
      </div>

      <div style={actionsStyle}>
        <button type="submit">Anwenden</button>
        <button type="button" onClick={onReset}>Reset</button>
      </div>
    </form>
  );
}
