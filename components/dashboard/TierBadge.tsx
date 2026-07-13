"use client";

import { Sparkle, Flame, FlameKindling, Crown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tier } from "@/lib/wealthScore";

const TIER_STYLE: Record<Tier, { icon: LucideIcon; className: string }> = {
  Spark: {
    icon: Sparkle,
    className: "bg-muted text-muted-foreground",
  },
  Ember: {
    icon: FlameKindling,
    className: "bg-saffron/15 text-[#b45309]",
  },
  Flame: {
    icon: Flame,
    className: "bg-saffron/25 text-[#9a3412]",
  },
  Blaze: {
    icon: Crown,
    className:
      "bg-gradient-to-r from-saffron/30 to-gold/40 text-[#7c2d12] shadow-sm",
  },
};

export function TierBadge({
  tier,
  className,
}: {
  tier: Tier;
  className?: string;
}) {
  const { icon: Icon, className: tierCls } = TIER_STYLE[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        tierCls,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {tier}
    </span>
  );
}
