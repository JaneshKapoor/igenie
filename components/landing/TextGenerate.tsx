"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Aceternity-style text-generate: words fade in one by one.
 * Gradient/clip styles must go on `wordClassName` (each animated span makes
 * its own stacking context, so a parent's background-clip:text won't reach it).
 */
export function TextGenerate({
  text,
  className,
  wordClassName,
  delay = 0,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i}>
          <motion.span
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.45, delay: delay + i * 0.07 }}
            className={cn("inline-block", wordClassName)}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
