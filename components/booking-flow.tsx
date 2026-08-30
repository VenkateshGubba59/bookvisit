"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Clock3, MapPin, Mic } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { validateName, validatePhone } from "@/lib/booking-validation";
import { BookingConfirmation, readableBookingDate, type BookingConfirmationData } from "@/components/booking-confirmation";
import { VoiceBookingPanel } from "@/components/voice-booking-panel";

const cities = ["Bengaluru", "Mumbai", "Delhi", "Hyderabad"];

export function BookingFlow() {
  const [leadName, setLeadName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [city, setCity] = useState("");
  const [slotId, setSlotId] = useState<Id<"slots"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<BookingConfirmationData | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  useEffect(() => {
    const checkSupport = window.setTimeout(() => {
      setSpeechSupported(Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition) && "speechSynthesis" in window);
    }, 0);
    return () => window.clearTimeout(checkSupport);
  }, []);

  const slots = useQuery(api.slots.listAvailableByCity, city ? { city } : "skip");
  const createBooking = useMutation(api.bookings.create);
  const nameError = validateName(leadName);
  const phoneError = validatePhone(phone);
  const contactIsValid = !nameError && !phoneError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameTouched(true);
    setPhoneTouched(true);
    if (!contactIsValid) return;
    if (!slotId) {
      setError("Choose a visit time to continue.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const result = await createBooking({ leadName, phone, city, slotId });
      setConfirmation(result);
    } catch {
      setError("Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmation) {
    return <BookingConfirmation confirmation={confirmation} />;
  }

  if (voiceOpen) return <VoiceBookingPanel onExit={() => setVoiceOpen(false)} onBooked={setConfirmation} />;

  return (
    <section className="form-panel" aria-labelledby="form-title">
      {speechSupported ? <button className="voice-trigger" type="button" onClick={() => setVoiceOpen(true)}><Mic size={20} /> Speak to book <span aria-hidden="true">→</span></button> : null}
      <div className="step-heading">
        <span>BOOK YOUR VISIT</span>
        <span>TAKES ABOUT 1 MIN</span>
      </div>
      <h2 id="form-title">Where should we meet you?</h2>
      <form onSubmit={handleSubmit}>
        <div className="field-grid">
          <label className="field field-full">
            <span>Your name</span>
            <input required autoComplete="name" value={leadName} onBlur={() => setNameTouched(true)} onChange={(e) => setLeadName(e.target.value)} placeholder="e.g. Riya Mehta" aria-invalid={nameTouched && Boolean(nameError)} aria-describedby={nameTouched && nameError ? "name-error" : undefined} />
            {nameTouched && nameError ? <small className="field-error" id="name-error">{nameError}</small> : null}
          </label>
          <label className="field">
            <span>Phone number</span>
            <div className="phone-control">
              <span className="phone-prefix" aria-hidden="true">🇮🇳 <strong>+91</strong></span>
              <input required inputMode="numeric" autoComplete="tel-national" maxLength={10} value={phone} onBlur={() => setPhoneTouched(true)} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="98765 43210" aria-label="10-digit phone number" aria-invalid={phoneTouched && Boolean(phoneError)} aria-describedby={phoneTouched && phoneError ? "phone-error" : undefined} />
            </div>
            {phoneTouched && phoneError ? <small className="field-error" id="phone-error">{phoneError}</small> : null}
          </label>
        </div>
        <label className="field city-field">
          <span>City</span>
          <select required value={city} onChange={(e) => { setCity(e.target.value); setSlotId(null); }}>
            <option value="" disabled>Choose your city</option>
            {cities.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>

        <div className="slot-section" aria-live="polite">
          <div className="slot-label"><span>Available visits</span>{city ? <small><MapPin size={13} /> {city}</small> : null}</div>
          {!city ? <div className="slot-placeholder">Choose a city to see available times.</div> : null}
          {city && slots === undefined ? <div className="slot-placeholder">Finding open visits…</div> : null}
          {slots?.length === 0 ? <div className="slot-placeholder">No open visits in {city}. Try another city.</div> : null}
          {slots && slots.length > 0 ? (
            <div className="slot-grid">
              {slots.map((slot) => {
                const selected = slotId === slot._id;
                return (
                  <button className="slot" data-selected={selected} key={slot._id} type="button" onClick={() => { setSlotId(slot._id); setError(""); }} aria-pressed={selected}>
                    <span>{readableBookingDate(slot.date)}</span>
                    <strong><Clock3 size={15} /> {slot.time}</strong>
                    {selected ? <Check className="slot-check" size={16} /> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="primary-button" type="submit" disabled={!contactIsValid || !city || !slotId || isSubmitting}>
          {isSubmitting ? "Reserving your visit…" : "Confirm booking"}
          <span aria-hidden="true">→</span>
        </button>
        <p className="privacy-note">We’ll use your number only to coordinate your visit.</p>
      </form>
    </section>
  );
}
