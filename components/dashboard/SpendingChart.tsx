"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR, spendByCategory, ESSENTIAL_CATEGORIES } from "@/lib/mockData";

const data = spendByCategory();

/**
 * Spend by category — magnitude across categories, so a single hue.
 * Discretionary categories get the saffron accent to make the "where the
 * leak is" story visible at a glance.
 */
export function SpendingChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 64, left: 0, bottom: 0 }}
          barCategoryGap={6}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="category"
            axisLine={false}
            tickLine={false}
            width={98}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                  <p className="font-medium">{payload[0].payload.category}</p>
                  <p className="tabular-nums text-muted-foreground">
                    {formatINR(payload[0].value as number)}
                  </p>
                </div>
              ) : null
            }
          />
          <Bar
            dataKey="amount"
            radius={[0, 4, 4, 0]}
            maxBarSize={18}
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell
                key={d.category}
                fill={
                  ESSENTIAL_CATEGORIES.includes(d.category)
                    ? "var(--chart-1)"
                    : "var(--saffron)"
                }
              />
            ))}
            <LabelList
              dataKey="amount"
              position="right"
              formatter={(v) => formatINR(Number(v))}
              style={{
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-1 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" /> Essential
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-saffron" /> Discretionary
        </span>
      </div>
    </div>
  );
}
