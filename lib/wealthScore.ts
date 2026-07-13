/**
 * Wealth Health Score — a transparent, explainable 0–100 score.
 *
 * score = 30% savings ratio + 25% diversification + 25% goal progress + 20% spending discipline
 *
 * Each pillar is normalized to 0–100 first, so every weight is inspectable
 * and the answer to "how did you calculate that" is one sentence.
 */

export type Tier = "Spark" | "Ember" | "Flame" | "Blaze";

export interface ScorePillars {
  /** (income - expenses) / income, normalized: 30%+ saved = full marks */
  savingsRatio: number;
  /** count of distinct asset classes held, out of 5 (FD, RD, MF, equity, gold) */
  diversification: number;
  /** average progress across active goals */
  goalProgress: number;
  /** share of spend that is essential vs. discretionary: 60/40 or better = full marks */
  spendingDiscipline: number;
}

export interface ScoreBreakdown extends ScorePillars {
  total: number;
  tier: Tier;
}

export const PILLAR_WEIGHTS = {
  savingsRatio: 0.3,
  diversification: 0.25,
  goalProgress: 0.25,
  spendingDiscipline: 0.2,
} as const;

const clamp = (v: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, v));

export function computeWealthScore(pillars: ScorePillars): ScoreBreakdown {
  const total = Math.round(
    clamp(pillars.savingsRatio) * PILLAR_WEIGHTS.savingsRatio +
      clamp(pillars.diversification) * PILLAR_WEIGHTS.diversification +
      clamp(pillars.goalProgress) * PILLAR_WEIGHTS.goalProgress +
      clamp(pillars.spendingDiscipline) * PILLAR_WEIGHTS.spendingDiscipline
  );
  return { ...pillars, total, tier: tierFromScore(total) };
}

// ---- Pillar derivation from raw account data ----

import {
  ASSET_CLASSES,
  ESSENTIAL_CATEGORIES,
  monthlyTotals,
  spendByCategory,
  type FinGoal,
  type Investment,
  type Transaction,
} from "@/lib/mockData";

export function derivePillars(
  txns: Transaction[],
  investments: Investment[],
  goals: FinGoal[]
): ScorePillars {
  const { income, saved } = monthlyTotals(txns);

  // (a) savings ratio — saving 30%+ of income = full marks
  const savingsRatio = clamp((saved / income / 0.3) * 100);

  // (b) diversification — distinct asset classes held, out of 5
  const held = new Set(
    investments.map((i) => i.type).filter((t) => (ASSET_CLASSES as string[]).includes(t))
  );
  const diversification = (held.size / ASSET_CLASSES.length) * 100;

  // (c) goal progress — average completion across active goals
  const goalProgress =
    goals.length === 0
      ? 0
      : clamp(
          (goals.reduce((s, g) => s + g.savedAmount / g.targetAmount, 0) /
            goals.length) *
            100
        );

  // (d) spending discipline — discretionary share of spend; 40% or less = full marks
  const byCat = spendByCategory(txns);
  const total = byCat.reduce((s, c) => s + c.amount, 0);
  const essential = byCat
    .filter((c) => ESSENTIAL_CATEGORIES.includes(c.category))
    .reduce((s, c) => s + c.amount, 0);
  const discretionaryShare = total === 0 ? 0 : (total - essential) / total;
  const spendingDiscipline =
    discretionaryShare <= 0.4
      ? 100
      : clamp(100 - ((discretionaryShare - 0.4) / 0.3) * 100);

  return {
    savingsRatio: Math.round(savingsRatio),
    diversification: Math.round(diversification),
    goalProgress: Math.round(goalProgress),
    spendingDiscipline: Math.round(spendingDiscipline),
  };
}

export const TIER_THRESHOLDS: Record<Tier, number> = {
  Spark: 0,
  Ember: 40,
  Flame: 60,
  Blaze: 80,
};

export const TIER_ORDER: Tier[] = ["Spark", "Ember", "Flame", "Blaze"];

export function tierFromScore(score: number): Tier {
  if (score >= TIER_THRESHOLDS.Blaze) return "Blaze";
  if (score >= TIER_THRESHOLDS.Flame) return "Flame";
  if (score >= TIER_THRESHOLDS.Ember) return "Ember";
  return "Spark";
}

/** Points needed to reach the next tier, or null if already Blaze. */
export function pointsToNextTier(
  score: number
): { nextTier: Tier; points: number } | null {
  const tier = tierFromScore(score);
  const idx = TIER_ORDER.indexOf(tier);
  if (idx === TIER_ORDER.length - 1) return null;
  const nextTier = TIER_ORDER[idx + 1];
  return { nextTier, points: TIER_THRESHOLDS[nextTier] - score };
}
