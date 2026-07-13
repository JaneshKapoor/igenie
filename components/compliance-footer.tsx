import { ShieldCheck } from "lucide-react";

export function ComplianceFooter() {
  return (
    <footer className="sticky bottom-0 z-50 border-t border-border bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        <p className="text-center text-[11px] leading-tight text-muted-foreground">
          iGenie gives personalized suggestions, not investment advice. Mutual
          fund and market-linked investments are subject to market risks.
        </p>
      </div>
    </footer>
  );
}
