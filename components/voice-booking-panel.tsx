"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { BookingConfirmationData } from "@/components/booking-confirmation";
import { validateName, validatePhone } from "@/lib/booking-validation";

type Captured = { city: string | null; slotId: string | null; name: string | null; phone: string | null };
type VoiceReply = Captured & { nextQuestion: string; readyToBook: boolean };

const initialCaptured: Captured = { city: null, slotId: null, name: null, phone: null };
const firstQuestion = "Which city would you like to visit: Bengaluru, Mumbai, Delhi, or Hyderabad?";
const voiceDateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function readableVoiceDate(date: string) {
  return voiceDateFormatter.format(new Date(`${date}T12:00:00`));
}

function timeInMinutes(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const hours = Number(match[1]) % 12 + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return hours * 60 + Number(match[2]);
}

function preferredIndianEnglishVoice(voices: SpeechSynthesisVoice[]) {
  const indianEnglishVoices = voices.filter((voice) => voice.lang.toLowerCase() === "en-in");
  return indianEnglishVoices.find((voice) => /neerja/i.test(voice.name))
    ?? indianEnglishVoices.find((voice) => /heera|veena/i.test(voice.name))
    ?? indianEnglishVoices[0]
    ?? null;
}

export function VoiceBookingPanel({ onExit, onBooked }: { onExit: () => void; onBooked: (data: BookingConfirmationData) => void }) {
  const [captured, setCaptured] = useState<Captured>(initialCaptured);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [liveWords, setLiveWords] = useState("");
  const [lastQuestion, setLastQuestion] = useState(firstQuestion);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [message, setMessage] = useState("");

  const slots = useQuery(api.slots.listAvailableByCity, captured.city ? { city: captured.city } : "skip");
  const voiceSlots = useMemo(() => {
    if (!slots) return slots;
    return [...slots]
      .sort((left, right) => left.date.localeCompare(right.date) || timeInMinutes(left.time) - timeInMinutes(right.time))
      .slice(0, 2);
  }, [slots]);
  const createBooking = useMutation(api.bookings.create);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceCountRef = useRef(0);
  const waitingForSlotsRef = useRef(false);
  const startedRef = useRef(false);
  const mountedRef = useRef(true);
  const indianEnglishVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const transcriptRef = useRef<string[]>([]);
  const capturedRef = useRef<Captured>(initialCaptured);
  const slotsRef = useRef<typeof voiceSlots>(undefined);

  useEffect(() => { capturedRef.current = captured; }, [captured]);
  useEffect(() => { slotsRef.current = voiceSlots; }, [voiceSlots]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  useEffect(() => {
    const loadVoices = () => {
      indianEnglishVoiceRef.current = preferredIndianEnglishVoice(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const exitToForm = useCallback(() => {
    stopListening();
    window.speechSynthesis.cancel();
    onExit();
  }, [onExit, stopListening]);

  const listen = useCallback(() => {
    if (!mountedRef.current) return;
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) return exitToForm();

    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    let finalWords = "";
    let timedOut = false;

    recognition.onresult = (event) => {
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const words = event.results[index][0].transcript;
        if (event.results[index].isFinal) finalWords += words;
        else interim += words;
      }
      setLiveWords(finalWords || interim);
      if (finalWords && silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMessage("Microphone access was blocked. Please use the form instead.");
        stopListening();
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
      const utterance = finalWords.trim();
      setLiveWords(utterance);
      if (!timedOut && utterance) void handleUtteranceRef.current(utterance);
    };

    try {
      recognition.start();
      setMessage("");
      setLiveWords("");
      setIsListening(true);
      silenceTimerRef.current = setTimeout(() => {
        timedOut = true;
        recognition.stop();
        if (silenceCountRef.current === 0) {
          silenceCountRef.current = 1;
          speakRef.current(lastQuestionRef.current);
        } else {
          exitToForm();
        }
      }, 8000);
    } catch {
      setMessage("The microphone could not start. Please use the form instead.");
    }
  }, [exitToForm, stopListening]);

  const speak = useCallback((words: string) => {
    stopListening();
    setLastQuestion(words);
    setLiveWords("");
    const utterance = new SpeechSynthesisUtterance(words);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    if (indianEnglishVoiceRef.current) utterance.voice = indianEnglishVoiceRef.current;
    utterance.onend = () => listen();
    utterance.onerror = () => listen();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [listen, stopListening]);

  const speakRef = useRef(speak);
  const lastQuestionRef = useRef(firstQuestion);
  useEffect(() => {
    // Keep timer and speech callbacks pointed at the latest render.
    // eslint-disable-next-line react-hooks/immutability
    speakRef.current = speak;
  }, [speak]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    lastQuestionRef.current = lastQuestion;
  }, [lastQuestion]);

  const handleUtterance = useCallback(async (utterance: string) => {
    silenceCountRef.current = 0;
    const nextTranscript = [...transcriptRef.current, utterance];
    transcriptRef.current = nextTranscript;
    setTranscript(nextTranscript);
    setIsThinking(true);
    setMessage("");

    const currentSlots = slotsRef.current ?? [];
    try {
      const response = await fetch("/api/voice-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utterance,
          transcript: nextTranscript,
          captured: capturedRef.current,
          slots: currentSlots.map((slot) => ({ id: slot._id, date: slot.date, time: slot.time, city: slot.city, experienceCenterName: slot.experienceCenterName })),
        }),
      });
      if (!response.ok) throw new Error("voice request failed");
      const reply = await response.json() as VoiceReply;
      const previous = capturedRef.current;
      const next: Captured = { city: reply.city, slotId: reply.slotId, name: reply.name, phone: reply.phone };
      capturedRef.current = next;
      setCaptured(next);

      if (reply.readyToBook) {
        if (!next.city || !next.slotId || !next.name || !next.phone || validateName(next.name) || validatePhone(next.phone)) throw new Error("invalid booking");
        const validSlot = currentSlots.find((slot) => slot._id === next.slotId && slot.city === next.city);
        if (!validSlot) throw new Error("invalid slot");
        const result = await createBooking({ leadName: next.name, phone: next.phone, city: next.city, slotId: next.slotId as Id<"slots"> });
        window.speechSynthesis.cancel();
        onBooked(result);
        return;
      }

      if (!previous.city && next.city) {
        waitingForSlotsRef.current = true;
        return;
      }

      if (!previous.phone && next.phone) {
        const chosen = currentSlots.find((slot) => slot._id === next.slotId);
        if (chosen) {
          speakRef.current(`Please confirm. The visit is for ${next.name}, in ${next.city}, on ${readableVoiceDate(chosen.date)} at ${chosen.time}, at ${chosen.experienceCenterName}. The phone number is ${next.phone.split("").join(" ")}. Say yes to book.`);
          return;
        }
      }
      speakRef.current(reply.nextQuestion);
    } catch {
      setMessage("Something went wrong. Please use the form instead.");
    } finally {
      setIsThinking(false);
    }
  }, [createBooking, onBooked]);

  const handleUtteranceRef = useRef(handleUtterance);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    handleUtteranceRef.current = handleUtterance;
  }, [handleUtterance]);

  useEffect(() => {
    if (!waitingForSlotsRef.current || !captured.city || voiceSlots === undefined) return;
    waitingForSlotsRef.current = false;
    if (voiceSlots.length === 0) {
      speakRef.current(`There are no open visits in ${captured.city}. Please use the form to choose another city.`);
      return;
    }
    const options = voiceSlots.map((slot, index) => `Option ${index + 1}: ${readableVoiceDate(slot.date)} at ${slot.time}`).join(". ");
    speakRef.current(`${options}. Which option would you like?`);
  }, [captured.city, voiceSlots]);

  useEffect(() => {
    mountedRef.current = true;
    if (!startedRef.current) {
      startedRef.current = true;
      speakRef.current(firstQuestion);
    }
    return () => {
      mountedRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.abort();
      window.speechSynthesis.cancel();
    };
  }, []);

  const selectedSlot = useMemo(() => voiceSlots?.find((slot) => slot._id === captured.slotId), [captured.slotId, voiceSlots]);

  return (
    <section className="form-panel voice-panel" aria-labelledby="voice-title">
      <div className="voice-topline">
        <span className="eyebrow">Voice booking</span>
        <button className="type-instead" type="button" onClick={exitToForm}>Type instead</button>
      </div>
      <h2 id="voice-title">Tell us when you’d like to visit.</h2>

      <div className="voice-status" data-listening={isListening} aria-live="polite">
        <span className="voice-orb" aria-hidden="true">{isListening ? <Mic size={22} /> : isThinking ? <Volume2 size={22} /> : <MicOff size={22} />}</span>
        <div><strong>{isListening ? "Listening…" : isThinking ? "Thinking…" : "Your booking agent"}</strong><p>{liveWords || lastQuestion}</p></div>
      </div>

      <dl className="voice-fields">
        <div><dt>City</dt><dd>{captured.city ?? "Waiting…"}</dd></div>
        <div><dt>Visit</dt><dd>{selectedSlot ? `${readableVoiceDate(selectedSlot.date)}, ${selectedSlot.time}` : "Waiting…"}</dd></div>
        <div><dt>Name</dt><dd>{captured.name ?? "Waiting…"}</dd></div>
        <div><dt>Phone</dt><dd>{captured.phone ? `+91 ${captured.phone}` : "Waiting…"}</dd></div>
      </dl>

      <div className="transcript-box" aria-live="polite">
        <span>What you said</span>
        <p>{liveWords || transcript.at(-1) || "Your words will appear here while you speak."}</p>
      </div>
      {message ? <div className="voice-error" role="alert"><p>{message}</p><button type="button" onClick={exitToForm}>Return to the form</button></div> : null}
    </section>
  );
}
