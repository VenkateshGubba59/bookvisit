import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atelier Visits",
  description: "Book a visit to an experience center.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <header className="site-header">
            <Link className="brand" href="/" aria-label="Atelier Visits home">
              <span className="brand-mark"><CalendarDays size={18} strokeWidth={2} /></span>
              <span>ATELIER / VISITS</span>
            </Link>
            <nav aria-label="Primary navigation">
              <Link className="nav-link" href="/">Book a visit</Link>
              <Link className="nav-link" href="/admin">Admin</Link>
            </nav>
          </header>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
