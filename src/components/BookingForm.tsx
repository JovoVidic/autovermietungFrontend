import { useState, useEffect } from 'react';
import { calculatePrice, rentAuto } from '../api/calculatePrice';
import type { PriceRequestDto } from '../api/types';
import { validateBookingForm, isBookingFormValid } from './validation';

type Props = {
  autoId: number;
  onBooked: (preis: number) => void;
};

const DEFAULT_CUSTOMER_ID = 1 as const;

export default function BookingForm({ autoId, onBooked }: Props) {
  const [startDatum, setStartDatum] = useState('');
  const [endDatum, setEndDatum] = useState('');
  const [insuranceOption, setInsuranceOption] = useState<'TEILKASKO' | 'VOLLKASKO' | ''>('');
  const [preis, setPreis] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Preis live berechnen, wenn alle Daten vorhanden sind
  useEffect(() => {
    if (!startDatum || !endDatum || !insuranceOption) {
      setPreis(null);
      return;
    }

    const req: PriceRequestDto = {
      autoId,
      startDate: startDatum,
      endDate: endDatum,
      insuranceOption: insuranceOption as 'TEILKASKO' | 'VOLLKASKO',
    };

    calculatePrice(req)
      .then(setPreis)
      .catch(() => setPreis(null));
  }, [startDatum, endDatum, insuranceOption, autoId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const errorMsg = validateBookingForm(startDatum, endDatum, insuranceOption);
    if (errorMsg) {
      setErr(errorMsg);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        autoId,
        customerId: DEFAULT_CUSTOMER_ID,
        startDatum,
        endDatum,
        insuranceOption: insuranceOption || undefined,
      };
      const finalPrice = await rentAuto(payload);
      onBooked(finalPrice);
    } catch (e: any) {
      setErr(e.message ?? 'Fehler bei der Buchung');
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
        <select
          value={insuranceOption}
          onChange={e => setInsuranceOption(e.target.value as 'TEILKASKO' | 'VOLLKASKO' | '')}
        >
          <option value="">(keine Auswahl)</option>
          <option value="TEILKASKO">Teilkasko</option>
          <option value="VOLLKASKO">Vollkasko</option>
        </select>
      </div>

      {preis !== null && <div>Gesamtpreis: {preis.toFixed(2)} €</div>}
      {err && <div style={{ color: 'crimson' }}>{err}</div>}

      <button type="submit" disabled={loading || !isBookingFormValid(startDatum, endDatum, insuranceOption)}>
        {loading ? 'Buchen…' : 'Buchen'}
      </button>
    </form>
  );
}
