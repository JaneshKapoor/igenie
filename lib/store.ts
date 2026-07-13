import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tierFromScore, type Tier } from "@/lib/wealthScore";

export type AvatarState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "celebrating";

export type GoalKey = "home" | "retirement" | "education" | "travel";

export interface Recommendation {
  productId: string;
  productName: string;
  category: string;
  reason: string;
  cta: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "genie";
  text: string;
  recommendation?: Recommendation;
}

export const GOAL_META: Record<
  GoalKey,
  { label: string; auraColor: string; emoji: string; blurb: string }
> = {
  home: {
    label: "Own a Home",
    auraColor: "#f58220",
    emoji: "🏡",
    blurb: "Build a down payment, then a home loan that fits.",
  },
  retirement: {
    label: "Retire Rich",
    auraColor: "#e8a13d",
    emoji: "🌅",
    blurb: "Long-horizon compounding: NPS, SIPs, pension plans.",
  },
  education: {
    label: "Fund Education",
    auraColor: "#4fa896",
    emoji: "🎓",
    blurb: "Safe, time-bound growth for a fixed-date goal.",
  },
  travel: {
    label: "Travel the World",
    auraColor: "#38bdf8",
    emoji: "✈️",
    blurb: "Short-term goals need liquid, flexible savings.",
  },
};

/**
 * Transient per-frame speech amplitude for lip-sync — deliberately outside
 * React/Zustand state so it never triggers re-renders; the 3D loop reads it
 * directly each frame.
 */
export const speechAmplitude = { value: 0 };

interface GenieStore {
  avatarState: AvatarState;
  setAvatarState: (s: AvatarState) => void;

  score: number;
  /** Set score; auto-celebrates when the tier goes up. */
  setScore: (score: number) => void;
  tier: Tier;

  goal: GoalKey | null;
  setGoal: (g: GoalKey) => void;

  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;

  celebrate: () => void;
}

export const useGenieStore = create<GenieStore>()(
  persist(
    (set, get) => ({
      avatarState: "idle",
      setAvatarState: (avatarState) => set({ avatarState }),

      score: 0,
      tier: "Spark",
      setScore: (score) => {
        const prevTier = get().tier;
        const tier = tierFromScore(score);
        set({ score, tier });
        if (
          prevTier !== tier &&
          ["Spark", "Ember", "Flame"].indexOf(prevTier) <
            ["Spark", "Ember", "Flame", "Blaze"].indexOf(tier)
        ) {
          get().celebrate();
        }
      },

      goal: null,
      setGoal: (goal) => set({ goal }),

      messages: [],
      addMessage: (m) => set({ messages: [...get().messages, m] }),

      celebrate: () => {
        set({ avatarState: "celebrating" });
        setTimeout(() => {
          if (get().avatarState === "celebrating") {
            set({ avatarState: "idle" });
          }
        }, 3200);
      },
    }),
    {
      name: "igenie-store",
      partialize: (state) => ({ goal: state.goal }),
    }
  )
);
