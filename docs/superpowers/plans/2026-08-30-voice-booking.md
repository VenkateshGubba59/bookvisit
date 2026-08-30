# Voice Booking Implementation Plan

> **For agentic workers:** Implement this plan task-by-task and verify each task before moving on.

**Goal:** Add a browser voice path that collects and confirms the same visit data, then uses the existing Convex booking mutation and confirmation screen.

**Architecture:** A client voice panel owns speech recognition, speech playback, silence handling, and captured fields. A server-only Next.js route uses OpenAI Structured Outputs to interpret each utterance, then checks every returned city, slot, name, and phone before sending it back. The existing form and Convex mutation remain the source of truth.

**Tech Stack:** Next.js Route Handlers, React 19, Convex, Web Speech API, OpenAI Responses API, TypeScript, existing CSS design tokens.

**Spec:** User request in this conversation.

## Global Constraints

- Keep the existing form fields and behavior unchanged.
- Only offer slot IDs supplied by the current Convex query.
- Keep `OPENAI_API_KEY` on the server.
- Phone must be exactly 10 digits before the existing mutation is called.
- Show plain fallback messages, never raw API errors.

---

### Task 1: Server transcript interpreter

**Files:**
- Create: `app/api/voice-booking/route.ts`
- Modify: `package.json`, `package-lock.json`

- [ ] Add the official OpenAI JavaScript package.
- [ ] Add a POST route with a strict request limit and Structured Outputs schema.
- [ ] Enforce the field order and reject city or slot values that are not in the request.
- [ ] Return a generic 500 response on failure and run lint.

### Task 2: Shared confirmation and voice panel

**Files:**
- Create: `components/booking-confirmation.tsx`
- Create: `components/voice-booking-panel.tsx`
- Create: `types/speech-recognition.d.ts`
- Modify: `components/booking-flow.tsx`

- [ ] Extract the current confirmation markup without changing its copy or behavior.
- [ ] Add speech support detection so unsupported browsers never render the button.
- [ ] Implement live/interim transcript, captured field display, speech playback, mic denial, and the two-stage eight-second silence fallback.
- [ ] Query slots after city capture, read them aloud, and pass only those slots to the server route.
- [ ] Validate ten digits and call `api.bookings.create` after spoken confirmation.

### Task 3: Styling and verification

**Files:**
- Modify: `app/globals.css`

- [ ] Style the trigger and voice states with existing tokens and minimum 44px controls.
- [ ] Run lint and production build.
- [ ] Test the supported path in a browser where available and inspect 390px layout.
- [ ] Search the client bundle source for `OPENAI_API_KEY` usage and list the final Vercel setting and phone test script.
