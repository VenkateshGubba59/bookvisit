# Atelier Visits Interface System

## Direction and feel

Calm, premium experience-center booking with the confidence of a printed visit pass. The public booking flow is spacious and guided; the admin area is quiet and data-focused. Cobalt is reserved for actions, selection, focus, and confirmation.

## Color tokens

- Gallery canvas: `#f3f5f8`
- Paper surface: `#ffffff`
- Primary ink: `#152238`
- Supporting ink: `#4f5d70`
- Muted ink: `#8993a2`
- Cobalt action: `#2457e6`
- Cobalt active: `#183faf`
- Success: `#16734b`
- Danger: `#b42318`

Use low-opacity ink for borders. Do not introduce extra accent colors or decorative gradients.

## Depth and shape

- Depth strategy: subtle layered shadows on elevated cards and tickets; quiet borders for controls and separation.
- Control radius: `8–10px`.
- Card and ticket radius: `12–14px`.
- Selected slots use a filled cobalt surface and a restrained cobalt shadow, not a border-only state.

## Typography

- Display and large headings: Georgia, regular weight, tight negative tracking.
- Body and controls: Aptos / Segoe UI fallback.
- Utility labels and metadata: Bahnschrift, uppercase only where the content is a true label or status.
- Use weight and color before adding more type sizes.
- Dynamic counts and reference codes use tabular numbers.

## Spacing and hierarchy

- Base spacing unit: `4px`.
- Form field group gap: `20px`.
- City section starts `28px` after contact fields.
- Slot section starts `40px` after city.
- Main action starts `32px` after its preceding state or section.
- Keep dense control groups together, then use larger gaps between booking stages.

## Component patterns

- Primary button: full width · `60px` minimum height · `18px 22px` padding · `10px` radius · `16px/700` text · cobalt background · `0.98` active scale.
- Slot button: `88px` minimum height · `16px` desktop / `14px` mobile padding · `10px` radius · visible hover, focus, active, and filled selected states.
- Mobile slot grid: two equal columns · `10px` gap · slot `min-width: 0` to prevent overflow at `390px`.
- Inputs: `48px` minimum height · inset gallery-tinted surface · quiet border · cobalt focus ring · inline validation beneath the field.
- Phone control: locked India flag and `+91` prefix in a separated leading section; user input occupies the remaining width.
- Confirmation ticket: paper details area plus cobalt perforated stub. Reference code is `19px/700`, prominent, tabular, and preceded by a small white success medallion.

## Guardrails

- Do not change the dark left booking panel unless explicitly requested.
- Do not use color as decoration; color must indicate action, state, identity, or status.
- Keep all interactive targets at least `44px` tall.
- Preserve visible keyboard focus and reduced-motion behavior.
- Check booking and confirmation views at `390px` before shipping when a browser is available.
