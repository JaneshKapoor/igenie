"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useGenieStore,
  speechAmplitude,
  type ChatMessage,
  type Recommendation,
} from "@/lib/store";
import { cn } from "@/lib/utils";

/* Minimal typings for the vendor-prefixed Web Speech API */
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, new () => SpeechRecognitionLike>;
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="mt-2 rounded-xl border border-primary/25 bg-secondary/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
        {rec.category} · Recommended
      </p>
      <p className="mt-0.5 text-sm font-semibold">{rec.productName}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {rec.reason}
      </p>
      <Button size="sm" className="mt-2 h-7 rounded-full text-xs">
        {rec.cta}
      </Button>
    </div>
  );
}

export function ChatSheet({ trigger }: { trigger?: React.ReactNode }) {
  const messages = useGenieStore((s) => s.messages);
  const addMessage = useGenieStore((s) => s.addMessage);
  const setAvatarState = useGenieStore((s) => s.setAvatarState);
  const goal = useGenieStore((s) => s.goal);

  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages.length]);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.02;
      u.pitch = 1.15;
      const voice = window.speechSynthesis
        .getVoices()
        .find((v) => v.lang.startsWith("en-IN")) ??
        window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("en"));
      if (voice) u.voice = voice;

      // Simple amplitude simulation drives the avatar's mouth
      const amp = setInterval(() => {
        speechAmplitude.value = 0.35 + Math.random() * 0.65;
      }, 90);
      u.onstart = () => setAvatarState("speaking");
      u.onend = () => {
        clearInterval(amp);
        speechAmplitude.value = 0;
        setAvatarState("idle");
      };
      window.speechSynthesis.speak(u);
    },
    [setAvatarState]
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setInput("");
      setBusy(true);
      const history = useGenieStore
        .getState()
        .messages.map((m) => ({ role: m.role, text: m.text }));
      addMessage({ id: crypto.randomUUID(), role: "user", text: trimmed });
      setAvatarState("thinking");
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, goal, history }),
        });
        const data = (await res.json()) as {
          reply: string;
          recommendation?: Recommendation;
        };
        const msg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "genie",
          text: data.reply,
          recommendation: data.recommendation,
        };
        addMessage(msg);
        speak(data.reply);
      } catch {
        const apology =
          "My lamp flickered — I couldn't reach the clouds. Ask me again?";
        addMessage({ id: crypto.randomUUID(), role: "genie", text: apology });
        setAvatarState("idle");
      } finally {
        setBusy(false);
      }
    },
    [addMessage, busy, goal, setAvatarState, speak]
  );

  // Push-to-talk: explicit toggle, never passive listening
  const toggleMic = useCallback(() => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = getRecognition();
    if (!rec) {
      send("(Voice not supported in this browser — tell me about my spending)");
      return;
    }
    recRef.current = rec;
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      send(transcript);
    };
    rec.onend = () => {
      setListening(false);
      if (useGenieStore.getState().avatarState === "listening")
        setAvatarState("idle");
    };
    rec.onerror = rec.onend;
    setListening(true);
    setAvatarState("listening");
    rec.start();
  }, [listening, send, setAvatarState]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button className="rounded-full px-6 shadow-lg" size="lg">
            <Sparkles className="mr-1 h-4 w-4" /> Ask iGenie
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> Ask iGenie
          </SheetTitle>
          <SheetDescription className="text-xs">
            Voice or text — your genie knows your money story.
          </SheetDescription>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="genie-voice rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm text-secondary-foreground">
              Rub the lamp — er, tap the mic — and ask me anything. Try{" "}
              <em>&ldquo;Where did my money go this month?&rdquo;</em> or{" "}
              <em>&ldquo;How do I level up?&rdquo;</em>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[85%] text-sm leading-relaxed",
                m.role === "user" ? "ml-auto" : ""
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5",
                  m.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "genie-voice rounded-tl-sm bg-secondary text-secondary-foreground"
                )}
              >
                {m.text}
              </div>
              {m.recommendation && <RecommendationCard rec={m.recommendation} />}
            </div>
          ))}
          {busy && (
            <div className="genie-voice flex items-center gap-1.5 px-2 text-xs text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
              <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
              <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
              iGenie is thinking…
            </div>
          )}
        </div>

        <form
          className="flex items-center gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Button
            type="button"
            size="icon"
            variant={listening ? "default" : "outline"}
            onClick={toggleMic}
            className={cn("shrink-0 rounded-full", listening && "mic-live bg-saffron text-saffron-foreground hover:bg-saffron")}
            aria-label={listening ? "Stop listening" : "Push to talk"}
          >
            {listening ? <X className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          {listening && (
            <span className="text-xs font-medium text-saffron">Listening…</span>
          )}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your money…"
            className="rounded-full"
            disabled={listening}
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-full"
            disabled={busy || !input.trim()}
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
