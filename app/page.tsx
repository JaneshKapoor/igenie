import Link from "next/link";
import { ArrowRight, Brain, Mic, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/app-header";
import { GenieAvatar } from "@/components/genie/GenieAvatar";
import { GenieStateControls } from "@/components/genie/GenieStateControls";
import { Spotlight } from "@/components/landing/Spotlight";
import { TextGenerate } from "@/components/landing/TextGenerate";

const FEATURES = [
  {
    icon: Mic,
    title: "Talks like a friend",
    body: "Push-to-talk voice, spoken answers, zero jargon.",
  },
  {
    icon: Brain,
    title: "Reasons over your data",
    body: "Every nudge is computed from your real spending — and explainable.",
  },
  {
    icon: TrendingUp,
    title: "Grows as you do",
    body: "Spark → Ember → Flame → Blaze. Your genie levels up with your score.",
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ debug?: string }>;
}) {
  const { debug } = await searchParams;
  return (
    <div className="relative flex flex-1 flex-col">
      <Spotlight />
      <AppHeader />
      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
        <span className="rounded-full border border-saffron/30 bg-saffron/10 px-4 py-1 text-xs font-medium text-[#b45309]">
          IDBI Innovate 2026 · Wealth Advisory
        </span>
        <div className="h-64 w-64 sm:h-80 sm:w-80">
          <GenieAvatar />
        </div>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
          <TextGenerate text="Meet" />{" "}
          <TextGenerate
            text="iGenie"
            delay={0.1}
            wordClassName="text-gradient-genie"
          />
          <TextGenerate text=", your AI wealth companion" delay={0.2} />
        </h1>
        <p className="genie-voice max-w-xl text-lg text-muted-foreground">
          <TextGenerate
            text="A genie that reads your money story, talks to you, and grows as your financial health does."
            delay={0.6}
          />
        </p>
        <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
          <Link href="/onboarding">
            Summon your genie <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        {debug === "1" && <GenieStateControls />}

        <div className="mt-10 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card/70 p-5 text-left shadow-sm backdrop-blur transition-transform hover:-translate-y-1"
            >
              <f.icon className="h-5 w-5 text-primary" aria-hidden />
              <p className="mt-2 font-semibold">{f.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
