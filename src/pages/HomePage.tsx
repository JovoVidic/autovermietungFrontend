
import BookingHero from '../components/BookingHero';

export default function HomePage() {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg,#111 0%,#333 100%)',
        color: 'white',
        padding: '4rem 1rem',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1rem' }}>Finde dein Auto</h1>
        <p style={{ marginBottom: '2rem', opacity: 0.9 }}>Ort, Zeitraum & Optionen auswählen – los geht’s.</p>
        <BookingHero />
      </div>
    </section>
  );
}
