
// src/admin/AdminCarForm.tsx
import { useEffect, useState } from 'react';
import type { Car } from '../src/types/car';
import { createCar, updateCar } from '../src/api/client';
import { validateCarInput } from './validation';
import ErrorAlert from '../src/ui/ErrorAlert';
import { formatServerError, type ErrorBoxData } from '../utils/errors';

type Props = {
  initial?: Car | null;
  onCancel: () => void;
  onSaved: (car: Car) => void;
};

export default function AdminCarForm({ initial, onCancel, onSaved }: Props) {
  const [marke, setMarke] = useState(initial?.marke ?? '');
  const [modell, setModell] = useState(initial?.modell ?? '');
  const [kennzeichen, setKennzeichen] = useState(initial?.kennzeichen ?? '');
  const [verfuegbar, setVerfuegbar] = useState(initial?.verfuegbar ?? true);
  const [preisProTag, setPreisProTag] = useState<number>(initial?.preisProTag ?? 0);
  const [category, setCategory] = useState<string>(initial?.category ?? '');
  const [locationId, setLocationId] = useState<number | ''>(initial?.location?.id ?? '');
  const [transmission, setTransmission] = useState<string>(initial?.transmission ?? '');
  const [fuel, setFuel] = useState<string>(initial?.fuel ?? '');
  const [seatCount, setSeatCount] = useState<number | ''>(initial?.seatCount ?? '');

  const [loading, setLoading] = useState(false);
  const [errorBox, setErrorBox] = useState<ErrorBoxData | null>(null);

  useEffect(() => { setErrorBox(null); }, [marke, modell, kennzeichen, preisProTag, category, locationId, transmission, fuel, seatCount, verfuegbar]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBox(null);

    const payload = {
      marke: marke.trim(),
      modell: modell.trim(),
      kennzeichen: kennzeichen.trim(),
      verfuegbar,
      preisProTag: Number(preisProTag),
      category: category || null,
      locationId: locationId === '' ? null : Number(locationId),
      transmission: transmission || null,
      fuel: fuel || null,
      seatCount: seatCount === '' ? null : Number(seatCount),
    };

    const msg = validateCarInput(payload);
    if (msg) {
      setErrorBox({ title: 'Eingabe ungültig', message: msg, details: null });
      return;
    }

    try {
      setLoading(true);
      const saved = initial
        ? await updateCar(initial.id, payload)
        : await createCar(payload);
      onSaved(saved);
    } catch (e: any) {
      setErrorBox(formatServerError(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
      <h3>{initial ? 'Auto bearbeiten' : 'Auto hinzufügen'}</h3>

      {errorBox && <ErrorAlert error={errorBox} />}

      <label>
        Marke<br />
        <input value={marke} onChange={e => setMarke(e.target.value)} />
      </label>

      <label>
        Modell<br />
        <input value={modell} onChange={e => setModell(e.target.value)} />
      </label>

      <label>
        Kennzeichen<br />
        <input value={kennzeichen} onChange={e => setKennzeichen(e.target.value)} />
      </label>

      <label>
        Preis pro Tag (CHF)<br />
        <input type="number" step="0.01" min="0" value={preisProTag} onChange={e => setPreisProTag(Number(e.target.value))} />
      </label>

      <label>
        Verfügbar<br />
        <input type="checkbox" checked={verfuegbar} onChange={e => setVerfuegbar(e.target.checked)} />
      </label>

      <label>
        Kategorie (optional)<br />
        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="z.B. SUV" />
      </label>

      <label>
        Standort-ID (optional)<br />
        <input type="number" value={locationId} onChange={e => setLocationId(e.target.value === '' ? '' : Number(e.target.value))} />
      </label>

      <label>
        Getriebe (optional)<br />
        <input value={transmission} onChange={e => setTransmission(e.target.value)} placeholder="AUTOMATIC/MANUAL" />
      </label>

      <label>
        Kraftstoff (optional)<br />
        <input value={fuel} onChange={e => setFuel(e.target.value)} placeholder="GASOLINE/DIESEL/..." />
      </label>

      <label>
        Sitzanzahl (optional)<br />
        <input type="number" value={seatCount} onChange={e => setSeatCount(e.target.value === '' ? '' : Number(e.target.value))} />
      </label>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="submit" disabled={loading}>{loading ? 'Speichere…' : (initial ? 'Speichern' : 'Anlegen')}</button>
        <button type="button" onClick={onCancel}>Abbrechen</button>
      </div>
    </form>
  );
}
