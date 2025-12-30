
import { Link } from 'react-router-dom';
import type { Car } from '../types/car';

export default function CarCard({ car }: { car: Car }) {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Optional: Bild */}
      <div style={{ height: 140, background: '#f5f5f5', borderRadius: 8 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>{car.marke} {car.modell}</strong>
        <span>{Number(car.preisProTag).toFixed(2)} CHF/Tag</span>
      </div>
      <div style={{ fontSize: 12, color: '#555' }}>
        {car.seatCount} Sitze · {car.transmission} · {car.fuel}
      </div>
      <div style={{ fontSize: 12, color: '#555' }}>
        {car.location?.name} {car.location?.stadt ? `(${car.location.stadt})` : ''}
      </div>
      <Link to={`/autos/${car.id}`} style={{ marginTop: 'auto', textAlign: 'center' }}>
        Details ansehen
      </Link>
    </div>
  );
}
