/**
 * Synthetic financial data shaped like a bank sandbox feed (transaction
 * records, UPI-style patterns, product catalog). Swapping in real IDBI
 * sandbox data later should be a config change, not a rewrite.
 *
 * Persona: Ananya Rao, 28, salaried product designer in Pune.
 * ₹95,000/mo take-home, disciplined on rent, generous on dining & shopping.
 */

import type { GoalKey } from "@/lib/store";

export type SpendCategory =
  | "Rent"
  | "Groceries"
  | "Dining"
  | "Shopping"
  | "Transport"
  | "Entertainment"
  | "Utilities"
  | "Health";

export type TxnChannel = "UPI" | "CARD" | "NEFT" | "AUTOPAY" | "ATM";

export interface Transaction {
  id: string;
  date: string; // ISO
  merchant: string;
  category: SpendCategory | "Salary" | "Investment";
  type: "debit" | "credit";
  amount: number; // INR
  channel: TxnChannel;
}

export type InvestmentType = "FD" | "RD" | "MF_SIP" | "EQUITY" | "GOLD" | "NPS";

export interface Investment {
  id: string;
  type: InvestmentType;
  name: string;
  investedAmount: number;
  currentValue: number;
  startDate: string;
}

export interface FinGoal {
  id: string;
  key: GoalKey;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
}

export interface Product {
  id: string;
  name: string;
  category: "FD" | "RD" | "SIP" | "INSURANCE" | "LOAN" | "NPS" | "SAVINGS";
  headline: string;
  rate?: string;
  minAmount: number;
  goalsFit: GoalKey[];
}

/** Distinct asset classes we count toward diversification (out of 5). */
export const ASSET_CLASSES: InvestmentType[] = [
  "FD",
  "RD",
  "MF_SIP",
  "EQUITY",
  "GOLD",
];

export const ESSENTIAL_CATEGORIES: SpendCategory[] = [
  "Rent",
  "Groceries",
  "Transport",
  "Utilities",
  "Health",
];

export const MONTHLY_INCOME = 95_000;

/** Idle savings-account balance — fuel for the sweep-in FD recommendation. */
export const SAVINGS_BALANCE = 68_000;

// ---- One demo month of transactions (June 2026) ----
let seq = 0;
const txn = (
  date: string,
  merchant: string,
  category: Transaction["category"],
  amount: number,
  channel: TxnChannel = "UPI",
  type: "debit" | "credit" = "debit"
): Transaction => ({
  id: `TXN${String(++seq).padStart(4, "0")}`,
  date,
  merchant,
  category,
  type,
  amount,
  channel,
});

export const transactions: Transaction[] = [
  txn("2026-06-01", "TCS Design Studio LLP — Salary", "Salary", 95_000, "NEFT", "credit"),
  txn("2026-06-01", "Green Meadows Housing — Rent", "Rent", 22_000, "NEFT"),
  txn("2026-06-02", "IDBI MF SIP — Nifty Index", "Investment", 3_000, "AUTOPAY"),
  txn("2026-06-03", "BigBasket", "Groceries", 2_850),
  txn("2026-06-04", "Swiggy", "Dining", 640),
  txn("2026-06-05", "Uber", "Transport", 380),
  txn("2026-06-06", "Third Wave Coffee", "Dining", 520, "CARD"),
  txn("2026-06-07", "Myntra", "Shopping", 3_490, "CARD"),
  txn("2026-06-08", "MSEB Electricity", "Utilities", 1_420, "AUTOPAY"),
  txn("2026-06-08", "Zomato", "Dining", 780),
  txn("2026-06-10", "PVR Cinemas", "Entertainment", 900, "CARD"),
  txn("2026-06-11", "Blinkit", "Groceries", 1_240),
  txn("2026-06-12", "Barbeque Nation", "Dining", 2_450, "CARD"),
  txn("2026-06-13", "Ola", "Transport", 310),
  txn("2026-06-14", "Apollo Pharmacy", "Health", 860),
  txn("2026-06-15", "Amazon", "Shopping", 2_190, "CARD"),
  txn("2026-06-16", "Swiggy", "Dining", 710),
  txn("2026-06-17", "Airtel Postpaid + Fiber", "Utilities", 1_190, "AUTOPAY"),
  txn("2026-06-18", "BookMyShow — Concert", "Entertainment", 2_500, "CARD"),
  txn("2026-06-19", "Zudio", "Shopping", 1_680, "CARD"),
  txn("2026-06-20", "BigBasket", "Groceries", 2_310),
  txn("2026-06-21", "Zomato", "Dining", 890),
  txn("2026-06-22", "Uber", "Transport", 420),
  txn("2026-06-23", "Starbucks", "Dining", 640, "CARD"),
  txn("2026-06-24", "Nykaa", "Shopping", 1_540, "CARD"),
  txn("2026-06-25", "Swiggy Instamart", "Groceries", 980),
  txn("2026-06-26", "Netflix + Spotify", "Entertainment", 848, "AUTOPAY"),
  txn("2026-06-27", "Cult.fit Membership", "Health", 1_500, "AUTOPAY"),
  txn("2026-06-28", "Dominos", "Dining", 560),
  txn("2026-06-28", "MakeMyTrip — Goa weekend", "Entertainment", 8_900, "CARD"),
  txn("2026-06-29", "Uber", "Transport", 350),
  txn("2026-06-29", "Farzi Cafe", "Dining", 1_950, "CARD"),
  txn("2026-06-30", "Croma — AirPods", "Shopping", 3_300, "CARD"),
  txn("2026-06-30", "Zara", "Shopping", 3_970, "CARD"),
  txn("2026-06-30", "H&M", "Shopping", 2_850, "CARD"),
];

export const investments: Investment[] = [
  {
    id: "INV001",
    type: "FD",
    name: "IDBI Suvidha Fixed Deposit",
    investedAmount: 1_50_000,
    currentValue: 1_61_200,
    startDate: "2025-04-10",
  },
  {
    id: "INV002",
    type: "MF_SIP",
    name: "Nifty 50 Index Fund — SIP ₹3,000/mo",
    investedAmount: 36_000,
    currentValue: 41_300,
    startDate: "2025-06-01",
  },
];

export const goals: FinGoal[] = [
  {
    id: "GOAL001",
    key: "home",
    name: "Home down payment",
    targetAmount: 12_00_000,
    savedAmount: 4_10_000,
    targetDate: "2029-06-30",
  },
  {
    id: "GOAL002",
    key: "travel",
    name: "Japan trip",
    targetAmount: 2_50_000,
    savedAmount: 1_45_000,
    targetDate: "2027-03-31",
  },
];

export const productCatalog: Product[] = [
  {
    id: "PRD001",
    name: "IDBI Suvidha Fixed Deposit",
    category: "FD",
    headline: "Lock surplus cash at assured returns",
    rate: "7.00% p.a.",
    minAmount: 10_000,
    goalsFit: ["home", "education", "travel"],
  },
  {
    id: "PRD002",
    name: "IDBI Recurring Deposit",
    category: "RD",
    headline: "Turn a monthly habit into a goal corpus",
    rate: "6.80% p.a.",
    minAmount: 500,
    goalsFit: ["travel", "education"],
  },
  {
    id: "PRD003",
    name: "Equity Index SIP (via IDBI Capital)",
    category: "SIP",
    headline: "Long-horizon compounding, one tap a month",
    rate: "12-14% historical",
    minAmount: 500,
    goalsFit: ["home", "retirement", "education"],
  },
  {
    id: "PRD004",
    name: "National Pension System (NPS)",
    category: "NPS",
    headline: "Retirement corpus + extra ₹50k tax break",
    rate: "9-11% historical",
    minAmount: 1_000,
    goalsFit: ["retirement"],
  },
  {
    id: "PRD005",
    name: "IDBI Term Life Cover",
    category: "INSURANCE",
    headline: "Protect the plan, not just the money",
    minAmount: 700,
    goalsFit: ["home", "education", "retirement", "travel"],
  },
  {
    id: "PRD006",
    name: "IDBI Home Loan",
    category: "LOAN",
    headline: "From down payment to door keys",
    rate: "8.45% p.a.",
    minAmount: 0,
    goalsFit: ["home"],
  },
  {
    id: "PRD007",
    name: "Auto-Sweep Savings (Sweep-in FD)",
    category: "SAVINGS",
    headline: "Idle balance auto-earns FD rates",
    rate: "up to 7.00% p.a.",
    minAmount: 25_000,
    goalsFit: ["travel", "home", "education", "retirement"],
  },
];

// ---- Aggregations ----

export function spendByCategory(txns: Transaction[] = transactions) {
  const map = new Map<SpendCategory, number>();
  for (const t of txns) {
    if (t.type !== "debit" || t.category === "Salary" || t.category === "Investment")
      continue;
    map.set(
      t.category as SpendCategory,
      (map.get(t.category as SpendCategory) ?? 0) + t.amount
    );
  }
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function monthlyTotals(txns: Transaction[] = transactions) {
  const income = txns
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + t.amount, 0);
  const invested = txns
    .filter((t) => t.type === "debit" && t.category === "Investment")
    .reduce((s, t) => s + t.amount, 0);
  const spent = txns
    .filter((t) => t.type === "debit" && t.category !== "Investment")
    .reduce((s, t) => s + t.amount, 0);
  return { income, spent, invested, saved: income - spent };
}

export const formatINR = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
