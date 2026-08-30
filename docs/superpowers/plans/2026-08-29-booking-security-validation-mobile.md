# Booking Security, Validation, and Mobile Fixes Implementation Plan

> **For agentic workers:** Implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect visitor data, validate booking input, remove demo-undermining copy, and make every slot reachable on mobile.

**Architecture:** `/admin` becomes a request-time server page guarded by an HttpOnly cookie derived from `ADMIN_PASSWORD`. After authorization, the server—not browser JavaScript—queries a password-protected Convex function and renders the booking list. The public booking flow validates locally for immediate feedback while the Convex mutation repeats the same checks.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Convex, Tailwind CSS

**Spec:** User request in this conversation.

## Global Constraints

- Do not fetch or send booking data before the admin password is correct.
- Never display raw Convex errors or request IDs.
- Accept ten-digit phone numbers with an optional `+91` prefix.
- Keep the selected slot after a failed booking.
- All slot buttons must be reachable at 390px without overlapping the submit button.

---

### Task 1: Protect admin data

**Files:**
- Create: `lib/admin-auth.ts`, `app/admin/actions.ts`, `components/admin-login-form.tsx`
- Modify: `app/admin/page.tsx`, `components/admin-bookings.tsx`, `convex/bookings.ts`, `app/layout.tsx`, `app/globals.css`

**Interfaces:**
- Produces: `loginAdmin`, `isAdminAuthenticated`, and password-protected `api.bookings.listAll`.

- [ ] Verify the server cookie before rendering or querying bookings.
- [ ] Validate the password in a Server Action and set an HttpOnly, secure production cookie.
- [ ] Require the matching Convex environment password before returning booking data.
- [ ] Fetch bookings on the Next.js server only after both checks pass.
- [ ] Remove the public Admin navigation link.
- [ ] Run lint and build.

### Task 2: Validate booking input and hide server errors

**Files:**
- Create: `lib/booking-validation.ts`
- Modify: `components/booking-flow.tsx`, `convex/bookings.ts`, `app/globals.css`

**Interfaces:**
- Produces: shared `validateName`, `normalizePhone`, and `validatePhone` helpers.

- [ ] Show inline name and phone errors after each field is touched.
- [ ] Disable confirmation until name, phone, city, and slot are valid.
- [ ] Repeat name and phone validation inside the Convex mutation.
- [ ] Replace caught server details with one fixed human message.
- [ ] Preserve the selected slot after failures.
- [ ] Run lint and build.

### Task 3: Replace dummy language

**Files:**
- Modify: `app/page.tsx`, `components/booking-flow.tsx`, `app/admin/page.tsx`, `app/globals.css`

**Interfaces:**
- Produces: one Build Week disclosure at the top of the home page and product-ready copy elsewhere.

- [ ] Remove every user-facing use of dummy or demo language.
- [ ] Add the exact Build Week disclosure once at the top of the home page.
- [ ] Search the UI source to confirm no old phrases remain.

### Task 4: Make mobile slots reachable

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: an unbounded mobile slot grid followed in normal page flow by the confirmation button.

- [ ] Remove the slot grid height limit and inner clipping.
- [ ] Confirm slot and button layout at 390px.
- [ ] Run lint and a production build.
