"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { useGenieStore, GOAL_META, type GoalKey } from "@/lib/store";
import { cn } from "@/lib/utils";

const GOALS = Object.entries(GOAL_META) as [GoalKey, (typeof GOAL_META)[GoalKey]][];

export default function OnboardingPage() {
  const router = useRouter();
  const goal = useGenieStore((s) => s.goal);
  const setGoal = useGenieStore((s) => s.setGoal);
  const celebrate = useGenieStore((s) => s.celebrate);

  const pick = (key: GoalKey) => {
    setGoal(key);
    celebrate();
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What are we wishing for?
          </h1>
          <p className="genie-voice mt-2 text-muted-foreground">
            Your goal tunes my aura — and which doors I point you to first.
          </p>
        </div>
        <div className="grid w-full gap-4 sm:grid-cols-2">
          {GOALS.map(([key, meta], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <button className="w-full text-left" onClick={() => pick(key)}>
                <Card
                  className={cn(
                    "group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg",
                    goal === key && "ring-2 ring-primary"
                  )}
                >
                  <CardContent className="flex items-center gap-4 p-5">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                      style={{ background: `${meta.auraColor}22` }}
                    >
                      {meta.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{meta.label}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {meta.blurb}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          You can change this any time — your genie adapts.
        </p>
      </main>
    </div>
  );
}
