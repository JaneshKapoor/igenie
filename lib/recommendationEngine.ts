/**
 * Rule-based recommendation engine. The DECISION lives here — auditable,
 * deterministic, outside the LLM. Claude only phrases the result.
 */

import { productCatalog, SAVINGS_BALANCE, formatINR, investments } from "@/lib/mockData";
import type { ScoreBreakdown } from "@/lib/wealthScore";
import type { GoalKey, Recommendation } from "@/lib/store";

interface Rule {
  id: string;
  productId: string;
  /** Higher = more urgent gap. */
  priority: (b: ScoreBreakdown, goal: GoalKey | null) => number;
  reason: (b: ScoreBreakdown, goal: GoalKey | null) => string;
  cta: string;
}

const RULES: Rule[] = [
  {
    id: "diversify",
    productId: "PRD003",
    priority: (b) => (b.diversification <= 40 ? 100 - b.diversification : 0),
    reason: (b) =>
      `You hold only ${Math.round((b.diversification / 100) * 5)} of 5 asset classes — a second SIP lifts diversification by 20 points (+5 on your score).`,
    cta: "Start a ₹2,000/mo SIP",
  },
  {
    id: "discipline-rd",
    productId: "PRD002",
    priority: (b) => (b.spendingDiscipline < 70 ? 90 - b.spendingDiscipline : 0),
    reason: () =>
      "Discretionary spend is above the healthy 40% line. An auto-debit RD on salary day moves the money before temptation does.",
    cta: "Open an RD for ₹4,000/mo",
  },
  {
    id: "sweep-idle",
    productId: "PRD007",
    priority: () => (SAVINGS_BALANCE > 50_000 ? 45 : 0),
    reason: () =>
      `${formatINR(SAVINGS_BALANCE)} idles in savings earning ~3%. A sweep-in FD auto-earns up to 7% with the same liquidity.`,
    cta: "Enable auto-sweep",
  },
  {
    id: "protect",
    productId: "PRD005",
    priority: () =>
      investments.some((i) => i.type === "NPS") ? 0 : 30,
    reason: () =>
      "Your plan has growth but no protection — a term cover costs less than two Swiggy orders a month.",
    cta: "Get a term cover quote",
  },
  {
    id: "retirement-nps",
    productId: "PRD004",
    priority: (_b, goal) => (goal === "retirement" ? 80 : 10),
    reason: () =>
      "NPS compounds for decades and unlocks an extra ₹50,000 tax deduction under 80CCD(1B).",
    cta: "Open an NPS account",
  },
  {
    id: "home-loan",
    productId: "PRD006",
    priority: (b, goal) =>
      goal === "home" && b.goalProgress >= 30 ? 55 : 0,
    reason: (b) =>
      `Your down-payment goal is ${b.goalProgress}% funded — worth pre-checking home-loan eligibility now to lock the plan.`,
    cta: "Check loan eligibility",
  },
];

/** Goal fit gives a small deterministic boost, never overrides a bigger gap. */
export function recommend(
  breakdown: ScoreBreakdown,
  goal: GoalKey | null
): Recommendation {
  const scored = RULES.map((r) => {
    const product = productCatalog.find((p) => p.id === r.productId)!;
    const goalBoost = goal && product.goalsFit.includes(goal) ? 8 : 0;
    return { rule: r, product, score: r.priority(breakdown, goal) + goalBoost };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0];
  return {
    productId: top.product.id,
    productName: top.product.name,
    category: top.product.category,
    reason: top.rule.reason(breakdown, goal),
    cta: top.rule.cta,
  };
}
