import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            i<span className="text-primary">Genie</span>
          </span>
          <span className="ml-1 hidden rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground sm:inline">
            IDBI Bank
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/onboarding"
            className="rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            Goals
          </Link>
        </nav>
      </div>
    </header>
  );
}
