import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { transactions, investments, goals, monthlyTotals, spendByCategory, formatINR } from "@/lib/mockData";
import { computeWealthScore, derivePillars, pointsToNextTier } from "@/lib/wealthScore";
import { recommend } from "@/lib/recommendationEngine";
import type { GoalKey } from "@/lib/store";

export const runtime = "nodejs";

interface ChatBody {
  message: string;
  goal: GoalKey | null;
  history: { role: "user" | "genie"; text: string }[];
}

export async function POST(req: Request) {
  const body = (await req.json()) as ChatBody;

  // Decision layer — deterministic, auditable, outside the LLM
  const breakdown = computeWealthScore(
    derivePillars(transactions, investments, goals)
  );
  const recommendation = recommend(breakdown, body.goal ?? null);
  const next = pointsToNextTier(breakdown.total);
  const totals = monthlyTotals(transactions);
  const topSpend = spendByCategory().slice(0, 3);

  const fallbackReply =
    `Based on your money story this month, my top suggestion is the ${recommendation.productName}. ` +
    `${recommendation.reason} Shall I set it up? Remember — this is a personalized suggestion, not investment advice.`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: fallbackReply, recommendation });
  }

  const system = `You are iGenie, a warm, sharp genie who lives on an IDBI Bank dashboard as the user's wealth companion. You speak in 2-4 short conversational sentences (this is read aloud via TTS — no lists, no markdown, no emojis). Use ₹ amounts from the data. You are playful but never flippant about money.

The bank's rule engine has already decided what to recommend — your job is ONLY to phrase it naturally and tie it to the user's actual data and their question. Never invent a different product or different numbers.

USER DATA (June): income ${formatINR(totals.income)}, spent ${formatINR(totals.spent)}, saved ${formatINR(totals.saved)}. Top spending: ${topSpend.map((c) => `${c.category} ${formatINR(c.amount)}`).join(", ")}.
Wealth Health Score: ${breakdown.total}/100 (savings ${breakdown.savingsRatio}, diversification ${breakdown.diversification}, goals ${breakdown.goalProgress}, discipline ${breakdown.spendingDiscipline}). Tier: ${breakdown.tier}${next ? `, ${next.points} points from ${next.nextTier}` : ""}.
Primary goal: ${body.goal ?? "not set"}.

RECOMMENDATION TO DELIVER: ${recommendation.productName} — ${recommendation.reason} (CTA: ${recommendation.cta})

If the user asks how the score works, explain the four weighted pillars in one sentence. End with a natural nudge toward the CTA. If asked something unrelated to finances, answer briefly and steer back.`;

  try {
    const anthropic = new Anthropic({ apiKey });
    const messages = [
      ...body.history.slice(-8).map((m) => ({
        role: m.role === "genie" ? ("assistant" as const) : ("user" as const),
        content: m.text,
      })),
      { role: "user" as const, content: body.message },
    ];
    const res = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 300,
      system,
      messages,
    });
    const reply =
      res.content.find((b) => b.type === "text")?.text ?? fallbackReply;
    return NextResponse.json({ reply, recommendation });
  } catch (err) {
    console.error("Claude call failed, using rule-based fallback:", err);
    return NextResponse.json({ reply: fallbackReply, recommendation });
  }
}
