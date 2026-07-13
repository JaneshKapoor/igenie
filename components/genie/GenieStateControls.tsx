"use client";

import { useGenieStore, type AvatarState } from "@/lib/store";
import { TIER_ORDER, TIER_THRESHOLDS } from "@/lib/wealthScore";
import { Button } from "@/components/ui/button";

const STATES: AvatarState[] = [
  "idle",
  "listening",
  "thinking",
  "speaking",
  "celebrating",
];

/**
 * Dev-only trigger strip for the avatar state machine and growth tiers.
 * Mounted behind ?debug=1 — handy for demoing every reaction on demand.
 */
export function GenieStateControls() {
  const avatarState = useGenieStore((s) => s.avatarState);
  const tier = useGenieStore((s) => s.tier);
  const setAvatarState = useGenieStore((s) => s.setAvatarState);
  const setScore = useGenieStore((s) => s.setScore);

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur">
      <div className="flex flex-wrap justify-center gap-1.5">
        {STATES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={avatarState === s ? "default" : "outline"}
            className="rounded-full text-xs capitalize"
            onClick={() => setAvatarState(s)}
          >
            {s}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {TIER_ORDER.map((t) => (
          <Button
            key={t}
            size="sm"
            variant={tier === t ? "secondary" : "ghost"}
            className="rounded-full text-xs"
            onClick={() => setScore(TIER_THRESHOLDS[t] + 5)}
          >
            {t}
          </Button>
        ))}
      </div>
    </div>
  );
}
