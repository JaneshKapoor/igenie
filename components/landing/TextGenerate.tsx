"use client";

import { motion } from "framer-motion";

/** Aceternity-style text-generate: words fade in one by one. */
export function TextGenerate({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.45, delay: delay + i * 0.07 }}
          className="inline-block"
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}
