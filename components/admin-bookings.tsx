"use client";

import { useQuery } from "convex/react";
import { CalendarX2 } from "lucide-react";
import { api } from "@/convex/_generated/api";

const visitDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const createdDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function AdminBookings() {
  const bookings = useQuery(api.bookings.listAll);

  if (bookings === undefined) {
    return <div className="admin-state">Loading bookings…</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="admin-state admin-empty">
        <CalendarX2 size={28} />
        <strong>No bookings yet</strong>
        <span>New dummy bookings will appear here instantly.</span>
      </div>
    );
  }

  return (
    <section aria-label="All bookings">
      <div className="admin-summary">
        <div><span>Total bookings</span><strong>{bookings.length}</strong></div>
        <div><span>Confirmed</span><strong>{bookings.filter((item) => item.status === "confirmed").length}</strong></div>
        <div><span>Cities</span><strong>{new Set(bookings.map((item) => item.city)).size}</strong></div>
      </div>
      <div className="table-shell">
        <table>
          <thead><tr><th>Visitor</th><th>Experience center</th><th>Visit</th><th>Booked</th><th>Status</th></tr></thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td data-label="Visitor"><strong>{booking.leadName}</strong><span>{booking.phone}</span></td>
                <td data-label="Experience center"><strong>{booking.slot?.experienceCenterName ?? booking.city}</strong><span>{booking.city}</span></td>
                <td data-label="Visit"><strong>{booking.slot ? visitDate.format(new Date(`${booking.slot.date}T12:00:00`)) : "Slot unavailable"}</strong><span>{booking.slot?.time ?? "—"}</span></td>
                <td data-label="Booked"><span>{createdDate.format(new Date(booking.createdAt))}</span></td>
                <td data-label="Status"><span className="status-pill">{booking.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
