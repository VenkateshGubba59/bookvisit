"use client";

import { Check } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

export type BookingConfirmationData = {
  bookingId: Id<"bookings">;
  leadName: string;
  phone: string;
  city: string;
  date: string;
  time: string;
  experienceCenterName: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });

export function readableBookingDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00`));
}

export function BookingConfirmation({ confirmation }: { confirmation: BookingConfirmationData }) {
  return (
    <section className="confirmation-panel" aria-labelledby="confirmation-title">
      <div className="confirmation-icon"><Check size={30} strokeWidth={2.5} /></div>
      <span className="eyebrow">Booking confirmed</span>
      <h2 id="confirmation-title">We’ll see you there, {confirmation.leadName.split(" ")[0]}.</h2>
      <p className="confirmation-copy">Your visit is reserved. Keep these details handy for your appointment.</p>
      <div className="ticket">
        <div className="ticket-main">
          <div><span>Date</span><strong>{readableBookingDate(confirmation.date)}</strong></div>
          <div><span>Time</span><strong>{confirmation.time}</strong></div>
          <div className="ticket-center"><span>Experience center</span><strong>{confirmation.experienceCenterName}</strong></div>
        </div>
        <div className="ticket-stub">
          <span className="reference-success" aria-hidden="true"><Check size={15} strokeWidth={2.5} /></span>
          <span>CONFIRMED</span>
          <small>#{confirmation.bookingId.slice(-6).toUpperCase()}</small>
        </div>
      </div>
      <button className="text-button" type="button" onClick={() => window.location.reload()}>Book another visit</button>
    </section>
  );
}
