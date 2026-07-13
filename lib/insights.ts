/**
 * Explicit, quantified nudges derived from the same pure score math —
 * "do X, gain Y points" — so every insight is verifiable on request.
 */

import {
  transactions,
  investments,
  goals,
  spendByCategory,
  formatINR,
  SAVINGS_BALANCE,
} from "@/lib/mockData";
import {
  computeWealthScore,
  derivePillars,
  pointsToNextTier,
  PILLAR_WEIGHTS,
} from "@/lib/wealthScore";

export interface Nudge {
  id: string;
  title: string;
  detail: string;
  deltaPoints: number;
  kind: "spend" | "invest" | "goal" | "protect";
}

export function getScoreBreakdown() {
  return computeWealthScore(derivePillars(transactions, investments, goals));
}

export function getNudges(): Nudge[] {
  const breakdown = getScoreBreakdown();
  const next = pointsToNextTier(breakdown.total);
  const nudges: Nudge[] = [];

  // 1. Diversification — one new asset class is a fixed, honest +20 pillar / +5 total
  if (breakdown.diversification < 100) {
    const delta = Math.round(20 * PILLAR_WEIGHTS.diversification);
    nudges.push({
      id: "diversify-sip",
      title: "Add a second growth engine",
      detail: `You hold 2 of 5 asset classes. A ₹2,000/mo gold or debt SIP adds a third — +${delta} points on its own.`,
      deltaPoints: delta,
      kind: "invest",
    });
  }

  // 2. Spending discipline — the dining + shopping leak
  const dining = spendByCategory().find((c) => c.category === "Dining");
  if (dining && breakdown.spendingDiscipline < 90) {
    const cut = 4_000;
    nudges.push({
      id: "cut-discretionary",
      title: `Trim dining & shopping by ${formatINR(cut)}`,
      detail: `Discretionary spend is above the 40% healthy line. Cutting ${formatINR(cut)} next month lifts your discipline pillar by ~9 points (+2 overall).`,
      deltaPoints: 2,
      kind: "spend",
    });
  }

  // 3. Idle cash
  nudges.push({
    id: "sweep-idle",
    title: `${formatINR(SAVINGS_BALANCE)} is sleeping at savings rates`,
    detail:
      "An auto-sweep FD earns up to 7% on idle balance with zero effort — pure savings-ratio fuel.",
    deltaPoints: 1,
    kind: "invest",
  });

  if (next) {
    nudges.unshift({
      id: "next-tier",
      title: `${next.points} points to ${next.nextTier}`,
      detail: `Your genie grows at ${breakdown.total + next.points}. The two nudges below get you there within a month.`,
      deltaPoints: next.points,
      kind: "goal",
    });
  }

  return nudges;
}
