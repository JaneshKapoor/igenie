"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";
import { PILLAR_WEIGHTS, type ScoreBreakdown } from "@/lib/wealthScore";

const PILLAR_LABELS: Record<keyof typeof PILLAR_WEIGHTS, string> = {
  savingsRatio: "Savings ratio",
  diversification: "Diversification",
  goalProgress: "Goal progress",
  spendingDiscipline: "Spending discipline",
};

interface ScoreRingProps {
  breakdown: ScoreBreakdown;
  size?: number;
}

/**
 * Animated Wealth Health Score ring with the four transparent pillars below —
 * the formula is on screen, not in a black box.
 */
export function ScoreRing({ breakdown, size = 180 }: ScoreRingProps) {
  const stroke = 13;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = (breakdown.total / 100) * c;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - filled }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-semibold tabular-nums tracking-tight">
            <AnimatedNumber value={breakdown.total} duration={1.4} />
          </span>
          <span className="text-xs text-muted-foreground">out of 100</span>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {(
          Object.keys(PILLAR_WEIGHTS) as (keyof typeof PILLAR_WEIGHTS)[]
        ).map((key) => (
          <li key={key} className="flex items-center gap-2 text-xs">
            <span className="w-36 shrink-0 text-muted-foreground">
              {PILLAR_LABELS[key]}
              <span className="ml-1 opacity-60">
                ×{Math.round(PILLAR_WEIGHTS[key] * 100)}%
              </span>
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary/70"
                initial={{ width: 0 }}
                animate={{ width: `${breakdown[key]}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
              />
            </div>
            <span className="w-7 text-right font-medium tabular-nums">
              {breakdown[key]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
