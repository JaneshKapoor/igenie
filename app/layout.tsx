import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Quicksand } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ComplianceFooter } from "@/components/compliance-footer";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-genie",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "iGenie — Your AI Wealth Companion | IDBI Bank",
  description:
    "An AI avatar-based digital wealth advisor that grows with your financial health. IDBI Innovate 2026.",
};

export const viewport: Viewport = {
  themeColor: "#00836c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased font-sans",
        geistSans.variable,
        geistMono.variable,
        quicksand.variable
      )}
    >
      <body className="min-h-dvh flex flex-col">
        <div className="flex-1 flex flex-col">{children}</div>
        <ComplianceFooter />
      </body>
    </html>
  );
}
