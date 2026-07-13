"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  FastForward,
  Lightbulb,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/app-header";
import { GenieAvatar } from "@/components/genie/GenieAvatar";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { TierBadge } from "@/components/dashboard/TierBadge";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { AllocationDonut } from "@/components/dashboard/AllocationDonut";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGenieStore, GOAL_META } from "@/lib/store";
import { formatINR, monthlyTotals, transactions } from "@/lib/mockData";
import { getNudges, getScoreBreakdown } from "@/lib/insights";
import { ChatSheet } from "@/components/chat/ChatSheet";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const baseBreakdown = useMemo(() => getScoreBreakdown(), []);
  const nudges = useMemo(() => getNudges(), []);
  const totals = useMemo(() => monthlyTotals(transactions), []);

  /**
   * Demo level-up: "July, if Ananya follows the plan" — SIP started
   * (+20 diversification) and ₹4k less discretionary spend (+9 discipline).
   * Same pure score function, better inputs.
   */
  const [julyApplied, setJulyApplied] = useState(false);
  const breakdown = useMemo(() => {
    if (!julyApplied) return baseBreakdown;
    const improved = {
      savingsRatio: baseBreakdown.savingsRatio + 4,
      diversification: baseBreakdown.diversification + 20,
      goalProgress: baseBreakdown.goalProgress + 2,
      spendingDiscipline: baseBreakdown.spendingDiscipline + 9,
    };
    return {
      ...improved,
      total:
        Math.round(
          improved.savingsRatio * 0.3 +
            improved.diversification * 0.25 +
            improved.goalProgress * 0.25 +
            improved.spendingDiscipline * 0.2
        ),
      tier: baseBreakdown.tier,
    };
  }, [julyApplied, baseBreakdown]);

  const tier = useGenieStore((s) => s.tier);
  const goal = useGenieStore((s) => s.goal);
  const setScore = useGenieStore((s) => s.setScore);

  useEffect(() => {
    setScore(breakdown.total);
  }, [breakdown.total, setScore]);

  const stats = [
    {
      label: "Income",
      value: totals.income,
      icon: ArrowUpRight,
      tone: "text-primary",
    },
    {
      label: "Spent",
      value: totals.spent,
      icon: ArrowDownRight,
      tone: "text-destructive",
    },
    {
      label: "Saved",
      value: totals.saved,
      icon: PiggyBank,
      tone: "text-primary",
    },
    {
      label: "Invested",
      value: totals.invested,
      icon: TrendingUp,
      tone: "text-saffron",
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {/* ===== hero row: genie + score ===== */}
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr_1fr]">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <Card className="h-full overflow-hidden">
              <CardContent className="relative flex h-full min-h-72 flex-col items-center justify-end p-0">
                <GenieAvatar className="absolute inset-0" zoom={5.8} />
                <div className="relative z-10 mb-4 flex flex-col items-center gap-1.5">
                  <TierBadge tier={tier} />
                  {goal && (
                    <span className="text-[11px] text-muted-foreground">
                      {GOAL_META[goal].emoji} Growing toward{" "}
                      {GOAL_META[goal].label}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="h-full">
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-base">Wealth Health Score</CardTitle>
                <CardDescription className="text-xs">
                  savings × 30 + diversification × 25 + goals × 25 + discipline × 20
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScoreRing breakdown={breakdown} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">June at a glance</CardTitle>
                <CardDescription className="text-xs">
                  Salary account ····2841
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <s.icon className={`h-3.5 w-3.5 ${s.tone}`} aria-hidden />
                      {s.label}
                    </div>
                    <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">
                      {formatINR(s.value)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ===== charts + nudges row ===== */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.25 }}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Where June went</CardTitle>
                <CardDescription className="text-xs">
                  Spend by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SpendingChart />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Portfolio</CardTitle>
                <CardDescription className="text-xs">
                  Corpus by asset class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AllocationDonut />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.35 }}>
            <Card className="h-full border-saffron/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4 text-saffron" aria-hidden />
                  Genie insights
                </CardTitle>
                <CardDescription className="text-xs">
                  Do this, gain that — every point accounted for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full rounded-full"
                  variant={julyApplied ? "secondary" : "default"}
                  disabled={julyApplied}
                  onClick={() => setJulyApplied(true)}
                >
                  <FastForward className="mr-1 h-4 w-4" />
                  {julyApplied
                    ? "July plan applied — genie grew!"
                    : "Fast-forward: follow the plan"}
                </Button>
                {nudges.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">
                        {n.title}
                      </p>
                      <span className="shrink-0 rounded-full bg-saffron/15 px-2 py-0.5 text-[11px] font-semibold text-[#b45309]">
                        +{n.deltaPoints} pts
                      </span>
                    </div>
                    <p className="genie-voice mt-1 text-xs leading-relaxed text-muted-foreground">
                      {n.detail}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* floating push-to-talk entry point */}
      <div className="fixed bottom-14 right-5 z-50">
        <ChatSheet />
      </div>
    </div>
  );
}
