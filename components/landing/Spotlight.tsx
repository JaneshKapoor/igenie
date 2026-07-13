"use client";

import { motion } from "framer-motion";

/** Aceternity-style spotlight sweep — pure CSS/SVG, no dependency. */
export function Spotlight() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.6 }}
      aria-hidden
    >
      <div
        className="absolute -top-1/4 left-1/2 h-[80vh] w-[60vw] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, #00836c33 0%, #f5822014 45%, transparent 70%)",
        }}
      />
      {/* drifting beams */}
      <motion.div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        animate={{ y: [0, 320, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-saffron/30 to-transparent"
        animate={{ y: [0, 420, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </motion.div>
  );
}
