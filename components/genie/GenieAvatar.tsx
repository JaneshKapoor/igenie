"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { GenieModel } from "./GenieModel";
import { cn } from "@/lib/utils";

interface GenieAvatarProps {
  className?: string;
  /** Camera distance — smaller = closer crop. */
  zoom?: number;
}

/**
 * The iGenie 3D avatar. Renders client-side only (Canvas has no SSR story),
 * with a soft CSS glow placeholder until the canvas mounts.
 */
export function GenieAvatar({ className, zoom = 5.4 }: GenieAvatarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={cn("relative h-full w-full", className)} aria-hidden>
      {/* soft ground glow behind the canvas */}
      <div className="pointer-events-none absolute inset-x-[15%] bottom-[8%] h-1/4 rounded-full bg-primary/20 blur-3xl" />
      {mounted && (
        <Canvas
          camera={{ position: [0, 0.4, zoom], fov: 36 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[3, 6, 4]} intensity={1.5} />
          <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#bfe3d8" />
          <Suspense fallback={null}>
            <group position={[0, -1.75, 0]}>
              <GenieModel />
            </group>
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
