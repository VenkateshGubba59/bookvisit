import { AdminBookings } from "@/components/admin-bookings";

export default function AdminPage() {
  return (
    <main className="admin-page">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">Visit desk</span>
          <h1>Bookings</h1>
        </div>
        <p>Live dummy reservations across all experience centers.</p>
      </div>
      <AdminBookings />
    </main>
  );
}
