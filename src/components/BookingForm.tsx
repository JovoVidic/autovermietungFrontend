
import { useState } from 'react';
//import { rentAuto } from '../api/client';

type Props = {
  autoId: number;
  onBooked: (preis: number) => void;
};

// Für den Einstieg: Customer fest/hart oder später aus Dropdown laden.
const DEFAULT_CUSTOMER_ID = 1 as const;

export default function BookingForm({ autoId, onBooked }: Props) {
  const [startDatum, setStartDatum] = useState('');
  const [endDatum, setEndDatum] = useState('');
  const [insuranceOption, setInsuranceOption] = useState<'TEILKASKO' | 'VOLLKASKO' | ''>('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!startDatum || !endDatum) {
      setErr('Bitte Start- und Enddatum wählen.');
      return;
    }
    if (new Date(startDatum) >= new Date(endDatum)) {
      setErr('Enddatum muss nach Startdatum liegen.');
      return;
    }

    try {
      setLoading(true);
      const preis = await rentAuto({
        autoId,
        customerId: DEFAULT_CUSTOMER_ID,
        startDatum,
        endDatum,
        insuranceOption: insuranceOption || undefined,
      });
      onBooked(Number(preis));
    } catch (e: any) {
      setErr(e?.message ?? 'Fehler bei der Buchung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
      <div>
        <label>Startdatum</label><br />
        <input type="date" value={startDatum} onChange={e => setStartDatum(e.target.value)} />
      </div>
      <div>
        <label>Enddatum</label><br />
        <input type="date" value={endDatum} onChange={e => setEndDatum(e.target.value)} />
      </div>
      <div>
        <label>Versicherung</label><br />
        <select value={insuranceOption} onChange={e => setInsuranceOption(e.target.value as any)}>
          <option value="">(keine Auswahl)</option>
          <option value="TEILKASKO">Teilkasko</option>
          <option value="VOLLKASKO">Vollkasko</option>
        </select>
      </div>
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Buchen…' : 'Buchen'}
      </button>
    </form>
  );
}
