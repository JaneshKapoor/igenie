"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatINR, investments, SAVINGS_BALANCE } from "@/lib/mockData";

const TYPE_LABELS: Record<string, string> = {
  FD: "Fixed Deposit",
  RD: "Recurring Deposit",
  MF_SIP: "Mutual Funds",
  EQUITY: "Equity",
  GOLD: "Gold",
  NPS: "NPS",
};

const data = [
  ...investments.map((i) => ({
    name: TYPE_LABELS[i.type] ?? i.type,
    value: i.currentValue,
  })),
  { name: "Savings (idle)", value: SAVINGS_BALANCE },
];

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const total = data.reduce((s, d) => s + d.value, 0);

/** Portfolio allocation — identity (parts of a whole), categorical hues in fixed order. */
export function AllocationDonut() {
  return (
    <div className="flex h-72 w-full flex-col">
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                    <p className="font-medium">{payload[0].name}</p>
                    <p className="tabular-nums text-muted-foreground">
                      {formatINR(payload[0].value as number)} ·{" "}
                      {Math.round(((payload[0].value as number) / total) * 100)}%
                    </p>
                  </div>
                ) : null
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell key={d.name} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-muted-foreground">Total corpus</span>
          <span className="text-lg font-semibold tabular-nums">
            {formatINR(total)}
          </span>
        </div>
      </div>
      <ul className="mt-2 space-y-1.5">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1 text-muted-foreground">{d.name}</span>
            <span className="font-medium tabular-nums">{formatINR(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
