// src/components/CarDetail.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchCarById, returnAuto } from '../api/client';
import type { Car } from '../types/car';
import BookingForm from './BookingForm';

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const carId = id!;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCarById(carId);
        setCar(data);
      } catch (e: any) {
        setError(e?.message ?? 'Fehler beim Laden');
      } finally {
        setLoading(false);
      }
    })();
  }, [carId]);

  const handleReturn = async () => {
    if (!car) return;
    try {
      await returnAuto(car.id);
      // Refresh
      const data = await fetchCarById(carId);
      setCar(data);
      alert('Rückgabe erfolgreich verbucht.');
    } catch (e: any) {
      alert(`Fehler bei der Rückgabe: ${e?.message ?? 'Unbekannter Fehler'}`);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>⏳ Lade Details…</div>;
  if (error) return <div style={{ color: 'crimson', padding: 24 }}>{error}</div>;
  if (!car) return <div style={{ padding: 24 }}>Auto nicht gefunden.</div>;

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Zurück</button>
      <h1>{car.marke} {car.modell}</h1>
      <p>Kennzeichen: {car.kennzeichen}</p>
      <p>Preis/Tag: {Number(car.preisProTag).toFixed(2)} CHF</p>
      <p>Plätze: {car.seatCount} | Getriebe: {car.transmission} | Kraftstoff: {car.fuel}</p>
      <p>Standort: {car.location?.name} {car.location?.stadt ? `(${car.location.stadt})` : ''}</p>
      <p>Status: <b style={{ color: car.verfuegbar ? 'green' : 'gray' }}>
        {car.verfuegbar ? 'verfügbar' : 'nicht verfügbar'}
      </b></p>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={() => setShowBooking(s => !s)} disabled={!car.verfuegbar}>
          {showBooking ? 'Buchung schließen' : 'Jetzt mieten'}
        </button>
        <button onClick={handleReturn} disabled={car.verfuegbar}>
          Rückgabe
        </button>
      </div>

      {showBooking && (
        <div style={{ marginTop: 24 }}>
          <BookingForm autoId={car.id} onBooked={(preis) => {
            alert(`Buchung erfolgreich. Gesamtpreis: ${preis.toFixed(2)} CHF`);
            setShowBooking(false);
            // Nach Buchung Details neu laden
            fetchCarById(carId).then(setCar).catch(console.error);
          }} />
        </div>
      )}
    </div>
  );
}
