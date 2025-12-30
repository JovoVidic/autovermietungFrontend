
import type { Car } from '../types/car';
import CarCard from './CarCard';

export default function CarGrid({ cars }: { cars: Car[] }) {
  if (!cars.length) return <div>Keine Fahrzeuge gefunden.</div>;
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {cars.map(c => <CarCard key={c.id} car={c} />)}
    </div>
  );
}
