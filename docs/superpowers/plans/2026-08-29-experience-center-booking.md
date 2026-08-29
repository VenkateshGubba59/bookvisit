# Experience Center Booking Implementation Plan

> **For agentic workers:** Implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working dummy experience-center visit booking flow and a booking admin view.

**Architecture:** A Next.js App Router frontend uses Convex React hooks for live queries and mutations. Convex owns the slot and booking tables and performs the booking transaction so a slot cannot be booked twice.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Convex

**Spec:** User request in this conversation.

## Global Constraints

- Use only dummy data.
- No voice, authentication, real calendar, or CRM integration.
- Home flow collects name, phone, city, slot, then shows confirmation.
- `/admin` lists all bookings.

---

### Task 1: Project foundation and Convex data layer

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
- Create: `convex/schema.ts`, `convex/slots.ts`, `convex/bookings.ts`

**Interfaces:**
- Produces: `api.slots.seed`, `api.slots.listAvailableByCity`, `api.bookings.create`, `api.bookings.listAll`

- [ ] Create the Next.js, Tailwind, and Convex configuration.
- [ ] Define indexed `slots` and `bookings` tables with the requested fields.
- [ ] Add an idempotent dummy-slot seed mutation and a city-filtered available-slot query.
- [ ] Add an atomic booking mutation that creates the booking and marks its slot booked.
- [ ] Add a newest-first admin bookings query enriched with slot details.
- [ ] Run Convex type generation and TypeScript checks.

### Task 2: Booking experience

**Files:**
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- Create: `components/convex-client-provider.tsx`, `components/booking-flow.tsx`

**Interfaces:**
- Consumes: generated Convex API functions from Task 1.
- Produces: accessible lead form, city-aware slot picker, booking action, confirmation state.

- [ ] Add a typed Convex client provider at the root.
- [ ] Build labeled name, phone, and city controls with validation.
- [ ] Load slots only after city selection and display loading, empty, error, selected, and disabled states.
- [ ] Submit the booking mutation once and render its confirmation details.
- [ ] Add responsive ticket-inspired styling, visible keyboard focus, and reduced-motion support.
- [ ] Run lint and production build.

### Task 3: Admin booking list and visual verification

**Files:**
- Create: `app/admin/page.tsx`, `components/admin-bookings.tsx`

**Interfaces:**
- Consumes: `api.bookings.listAll`.
- Produces: responsive booking table/list with loading and empty states.

- [ ] Build `/admin` with live booking totals and newest-first rows.
- [ ] Show lead, contact, center, appointment, status, and created time.
- [ ] Verify desktop and mobile layouts in a browser.
- [ ] Run lint and production build after any visual fixes.
