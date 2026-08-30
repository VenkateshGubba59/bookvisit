import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { AdminBookings } from "@/components/admin-bookings";
import { AdminLoginForm } from "@/components/admin-login-form";
import { isAdminAuthenticated, isAdminPasswordConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isConfigured = isAdminPasswordConfigured();
  const isAuthenticated = isConfigured && await isAdminAuthenticated();
  if (!isAuthenticated) return <AdminLoginForm isConfigured={isConfigured} />;

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  let bookings = null;
  if (convexUrl && adminPassword) {
    try {
      const convex = new ConvexHttpClient(convexUrl);
      bookings = await convex.query(api.bookings.listAll, { adminPassword });
    } catch {
      bookings = null;
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-heading">
        <div><span className="eyebrow">Visit desk</span><h1>Bookings</h1></div>
        <p>Reservations across all experience centers.</p>
      </div>
      {bookings ? <AdminBookings bookings={bookings} /> : <div className="admin-state">Bookings could not be loaded. Check the server configuration.</div>}
    </main>
  );
}
