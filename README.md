# iGenie 🧞 — Your AI Wealth Companion

**IDBI Innovate 2026 · Track 01: Wealth Advisory / Conversational AI / Mobile Banking**

iGenie is an AI avatar-based digital wealth advisor that lives on your banking dashboard. A friendly 3D genie reasons over your spending and investment behaviour, talks to you (voice in, voice out), recommends the right IDBI products for your goals — and visibly *grows* as your financial health improves.

## The Pitch (3 sentences)

Wealth advisory today is fragmented, expensive, and inaccessible to the everyday salaried customer. iGenie turns a customer's own transaction data into a living, talking financial companion that gives timely, explainable, goal-aware guidance — and gamifies financial discipline through an avatar that levels up with your Wealth Health Score. For IDBI, it's a retention and cross-sell engine; for the customer, it's a genie that grants the wish of financial clarity.

## Tech Stack

- **Next.js 16** (App Router, TypeScript) + **Tailwind CSS v4**
- **shadcn/ui** primitives, Aceternity-style hero effects, reactbits-style micro-interactions
- **Three.js** via `@react-three/fiber` + `@react-three/drei` — procedural 3D genie avatar
- **Framer Motion** — transitions synced to avatar state
- **Zustand** — global state (wealth score, avatar tier, chat, goal)
- **Recharts** — spending/investment charts
- **Claude API** (`@anthropic-ai/sdk`) — conversational layer, server-side only
- **Web Speech API** — browser-native voice in/out

## Run Locally

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

> Without an API key, chat falls back to the rule-based recommendation engine — the demo still works end to end.

## How It Works

- **Wealth Health Score (0–100)** — a transparent weighted blend of savings ratio, investment diversification, goal progress, and spending discipline (`lib/wealthScore.ts` — a small pure function, not a black box).
- **Recommendations** — a rule-based engine (`lib/recommendationEngine.ts`) maps score gaps to specific IDBI products; Claude only phrases the result conversationally. Decision logic stays auditable and outside the LLM.
- **Avatar growth tiers** — Spark → Ember → Flame → Blaze, tied to the score (never raw balance).
- All financial data is **mocked** (`lib/mockData.ts`), shaped like a real bank sandbox for easy swap-in later.

*iGenie gives personalized suggestions, not investment advice.*
