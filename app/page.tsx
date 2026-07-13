import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/app-header";
import { GenieAvatar } from "@/components/genie/GenieAvatar";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <span className="rounded-full bg-secondary px-4 py-1 text-xs font-medium text-secondary-foreground">
          IDBI Innovate 2026 · Wealth Advisory
        </span>
        <div className="h-64 w-64 sm:h-80 sm:w-80">
          <GenieAvatar />
        </div>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Meet <span className="text-gradient-genie">iGenie</span>, your AI
          wealth companion
        </h1>
        <p className="genie-voice max-w-xl text-lg text-muted-foreground">
          A genie that reads your money story, talks to you, and grows as your
          financial health does.
        </p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/onboarding">
            Summon your genie <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </main>
    </div>
  );
}
