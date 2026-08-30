import { BookingFlow } from "@/components/booking-flow";

export default function Home() {
  return (
      <main className="booking-page">
        <section className="intro-panel">
          <div>
            <span className="eyebrow">Private experience center visits</span>
            <h1>See it.<br />Touch it.<br /><em>Make it yours.</em></h1>
            <p className="intro-copy">A quiet, one-to-one visit with a specialist. Pick a city and reserve a time in under a minute.</p>
          </div>
          <div className="visit-note">
            <span>YOUR VISIT INCLUDES</span>
            <ul>
              <li>45 minutes with a product specialist</li>
              <li>Hands-on product exploration, no sales pressure</li>
              <li>A plan made around your space</li>
            </ul>
          </div>
        </section>
        <BookingFlow />
      </main>
  );
}
