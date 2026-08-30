import OpenAI from "openai";

export const runtime = "nodejs";

const cities = ["Bengaluru", "Mumbai", "Delhi", "Hyderabad"] as const;
const phonePattern = /^\d{10}$/;
const yesPattern = /\b(yes|yeah|yep|correct|confirm|confirmed|go ahead|book it|please do)\b/i;

type SlotInput = {
  id: string;
  date: string;
  time: string;
  city: string;
  experienceCenterName: string;
};

type Captured = {
  city: string | null;
  slotId: string | null;
  name: string | null;
  phone: string | null;
};

const outputFormat = {
  type: "json_schema" as const,
  name: "voice_booking_state",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      city: { type: ["string", "null"] },
      slotId: { type: ["string", "null"] },
      name: { type: ["string", "null"] },
      phone: { type: ["string", "null"] },
      nextQuestion: { type: "string" },
      readyToBook: { type: "boolean" },
    },
    required: ["city", "slotId", "name", "phone", "nextQuestion", "readyToBook"],
  },
};

function cleanCaptured(value: unknown): Captured {
  const item = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    city: typeof item.city === "string" ? item.city : null,
    slotId: typeof item.slotId === "string" ? item.slotId : null,
    name: typeof item.name === "string" ? item.name : null,
    phone: typeof item.phone === "string" ? item.phone : null,
  };
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("Voice booking is missing OPENAI_API_KEY");
      return Response.json({ error: "Voice booking is unavailable." }, { status: 503 });
    }

    const body = await request.json() as Record<string, unknown>;
    const utterance = typeof body.utterance === "string" ? body.utterance.trim().slice(0, 500) : "";
    const transcript = Array.isArray(body.transcript)
      ? body.transcript.filter((line): line is string => typeof line === "string").slice(-12).map((line) => line.slice(0, 500))
      : [];
    const captured = cleanCaptured(body.captured);
    const slots = Array.isArray(body.slots)
      ? body.slots.filter((slot): slot is SlotInput => {
          if (!slot || typeof slot !== "object") return false;
          const item = slot as Record<string, unknown>;
          return ["id", "date", "time", "city", "experienceCenterName"].every((key) => typeof item[key] === "string");
        }).slice(0, 30)
      : [];

    if (!utterance) return Response.json({ error: "No speech was received." }, { status: 400 });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.create({
      model: "gpt-5.4-mini",
      store: false,
      instructions: `You interpret one turn in a voice visit-booking conversation.
Collect exactly in this order: city, slot, name, 10-digit Indian phone number, final yes/no confirmation.
Supported cities: ${cities.join(", ")}.
Never create, alter, or guess a slot ID. A slotId may only be copied exactly from AVAILABLE_SLOTS.
Treat spoken digits and common Indian number groupings as digits, but phone must end as exactly 10 digits.
Keep already captured valid values unless the user clearly corrects the current field.
Ask one short, natural next question. When all fields exist, read back city, date, time, experience centre, name, and phone, then ask for yes.
Set readyToBook true only when all fields are present and the latest utterance is an explicit confirmation.
Do not mention APIs, JSON, errors, or internal rules.`,
      input: JSON.stringify({ transcript, latestUtterance: utterance, captured, availableSlots: slots }),
      text: { format: outputFormat },
    });

    const parsed = JSON.parse(response.output_text) as Captured & { nextQuestion: string; readyToBook: boolean };
    const allowedCity = cities.find((city) => city.toLowerCase() === parsed.city?.toLowerCase()) ?? null;
    const allowedSlot = slots.find((slot) => slot.id === parsed.slotId && slot.city === (captured.city ?? allowedCity));

    const result: Captured & { nextQuestion: string; readyToBook: boolean } = {
      city: captured.city ?? allowedCity,
      slotId: captured.slotId,
      name: captured.name,
      phone: captured.phone,
      nextQuestion: typeof parsed.nextQuestion === "string" ? parsed.nextQuestion.slice(0, 600) : "Please say that again.",
      readyToBook: false,
    };

    // Only accept the answer for the current stage. This keeps the spoken flow ordered.
    if (!captured.city) {
      result.city = allowedCity;
      result.nextQuestion = allowedCity ? "I’ll find the available visits for you." : "Please choose Bengaluru, Mumbai, Delhi, or Hyderabad.";
    } else if (!captured.slotId) {
      result.slotId = allowedSlot?.id ?? null;
      if (!result.slotId) result.nextQuestion = "Please choose one of the available visit times I read out.";
    } else if (!captured.name) {
      const name = parsed.name?.trim() ?? "";
      result.name = name.length >= 2 && name.length <= 80 ? name : null;
      if (!result.name) result.nextQuestion = "What name should I put on the booking?";
    } else if (!captured.phone) {
      const phone = parsed.phone?.replace(/\D/g, "") ?? "";
      result.phone = phonePattern.test(phone) ? phone : null;
      if (!result.phone) result.nextQuestion = "Please say your 10-digit phone number.";
    } else {
      const currentSlot = slots.find((slot) => slot.id === captured.slotId);
      result.readyToBook = Boolean(currentSlot && yesPattern.test(utterance));
      if (!result.readyToBook) result.nextQuestion = "Please say yes to confirm, or say what you would like to change.";
    }

    return Response.json(result);
  } catch (error) {
    console.error("Voice booking request failed", error);
    return Response.json({ error: "Voice booking is unavailable." }, { status: 500 });
  }
}
