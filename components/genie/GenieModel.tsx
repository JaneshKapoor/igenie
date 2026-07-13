"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useGenieStore, speechAmplitude, GOAL_META } from "@/lib/store";
import { TIER_ORDER } from "@/lib/wealthScore";

const COLORS = {
  body: "#00836c",
  bodyDeep: "#045c4d",
  gold: "#e8a13d",
  goldBright: "#f5b95a",
  saffron: "#f58220",
  eye: "#1a2420",
  smoke: "#bfe3d8",
};

const damp = THREE.MathUtils.damp;

/** Tier index 0–3 (Spark → Blaze) drives size, trim, and glow. */
function useTierIndex() {
  const tier = useGenieStore((s) => s.tier);
  return TIER_ORDER.indexOf(tier);
}

export function GenieModel() {
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const eyes = useRef<THREE.Group>(null!);
  const mouth = useRef<THREE.Mesh>(null!);
  const orbit = useRef<THREE.Group>(null!);
  const baseGlow = useRef<THREE.PointLight>(null!);
  const wisps = useRef<THREE.Mesh[]>([]);
  const handL = useRef<THREE.Mesh>(null!);
  const handR = useRef<THREE.Mesh>(null!);

  const nextBlink = useRef(2.5);

  const tierIndex = useTierIndex();
  const goal = useGenieStore((s) => s.goal);
  const avatarState = useGenieStore((s) => s.avatarState);
  const aura = goal ? GOAL_META[goal].auraColor : COLORS.gold;

  // Tapering body profile, rotated around Y into a lathe surface
  const bodyProfile = useMemo(() => {
    const pts: THREE.Vector2[] = [
      new THREE.Vector2(0.02, 0),
      new THREE.Vector2(0.14, 0.12),
      new THREE.Vector2(0.3, 0.42),
      new THREE.Vector2(0.44, 0.78),
      new THREE.Vector2(0.46, 1.05),
      new THREE.Vector2(0.38, 1.32),
      new THREE.Vector2(0.3, 1.48),
    ];
    return new THREE.LatheGeometry(pts, 32);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const s = useGenieStore.getState();
    const mode = s.avatarState;
    const g = root.current;
    if (!g) return;

    // ----- posture & bob per state -----
    let bobY = Math.sin(t * 1.4) * 0.05;
    let swayZ = Math.sin(t * 0.7) * 0.035;
    let leanX = 0;
    let eyeScale = 1;
    let eyeScaleY = 1;

    if (mode === "listening") {
      leanX = 0.13;
      eyeScale = 1.18;
      bobY = Math.sin(t * 1.8) * 0.03;
    } else if (mode === "thinking") {
      eyeScaleY = 0.55;
      leanX = -0.04;
      swayZ = Math.sin(t * 0.5) * 0.02;
    } else if (mode === "speaking") {
      leanX = 0.05;
      bobY = Math.sin(t * 2.2) * 0.04;
    } else if (mode === "celebrating") {
      bobY = Math.abs(Math.sin(t * 5)) * 0.22;
      swayZ = Math.sin(t * 8) * 0.06;
    }

    g.position.y = damp(g.position.y, bobY, 6, delta);
    g.rotation.z = damp(g.rotation.z, swayZ, 6, delta);
    g.rotation.x = damp(g.rotation.x, leanX, 5, delta);
    g.rotation.y = damp(
      g.rotation.y,
      mode === "celebrating" ? Math.sin(t * 3) * 0.25 : Math.sin(t * 0.4) * 0.08,
      4,
      delta
    );

    // ----- tier scale (Spark 0.92 → Blaze 1.16) -----
    const tierScale = 0.9 + tierIndex * 0.07;
    const sc = damp(g.scale.x, tierScale, 4, delta);
    g.scale.setScalar(sc);

    // ----- blink -----
    let blink = 1;
    const sinceBlink = t - nextBlink.current;
    if (sinceBlink > 0) {
      if (sinceBlink < 0.1) blink = 1 - sinceBlink / 0.1;
      else if (sinceBlink < 0.2) blink = (sinceBlink - 0.1) / 0.1;
      else nextBlink.current = t + 2.5 + Math.random() * 3;
    }
    if (eyes.current) {
      eyes.current.scale.x = damp(eyes.current.scale.x, eyeScale, 8, delta);
      eyes.current.scale.y = eyeScaleY * blink * eyeScale;
    }

    // ----- mouth (amplitude-driven lip sync) -----
    if (mouth.current) {
      const target =
        mode === "speaking"
          ? 0.6 + Math.min(1, speechAmplitude.value) * 1.6
          : mode === "celebrating"
            ? 1.5
            : 1;
      mouth.current.scale.y = damp(mouth.current.scale.y, target, 14, delta);
    }

    // ----- thinking orbit particles -----
    if (orbit.current) {
      orbit.current.rotation.y += delta * 2.4;
      const targetVis = mode === "thinking" ? 1 : 0;
      orbit.current.children.forEach((child) => {
        const m = child as THREE.Mesh;
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.opacity = damp(mat.opacity, targetVis, 8, delta);
        m.visible = mat.opacity > 0.02;
      });
    }

    // ----- floating hands -----
    if (handL.current && handR.current) {
      handL.current.position.y = 1.45 + Math.sin(t * 1.6) * 0.06;
      handR.current.position.y = 1.45 + Math.sin(t * 1.6 + 1.3) * 0.06;
      if (mode === "celebrating") {
        handL.current.position.y = 1.8 + Math.sin(t * 6) * 0.12;
        handR.current.position.y = 1.8 + Math.sin(t * 6 + 0.5) * 0.12;
      }
    }

    // ----- base glow: brighter per tier, pulses while listening -----
    if (baseGlow.current) {
      const base = 0.9 + tierIndex * 0.55;
      const pulse =
        mode === "listening"
          ? Math.sin(t * 7) * 0.5 + 0.6
          : mode === "celebrating"
            ? Math.sin(t * 10) * 0.8 + 1
            : Math.sin(t * 1.2) * 0.12;
      baseGlow.current.intensity = base + pulse;
    }

    // ----- smoke wisps rising from the base -----
    wisps.current.forEach((w, i) => {
      if (!w) return;
      const speed = 0.22 + i * 0.05;
      const cycle = (t * speed + i * 0.37) % 1;
      w.position.y = 0.15 + cycle * 1.1;
      w.position.x = Math.sin(t * 0.9 + i * 2.4) * (0.22 + cycle * 0.15);
      w.position.z = Math.cos(t * 0.7 + i * 1.9) * 0.18;
      const grow = 0.5 + cycle * 0.9;
      w.scale.setScalar(grow * (0.16 + i * 0.03));
      (w.material as THREE.MeshStandardMaterial).opacity =
        0.35 * Math.sin(cycle * Math.PI);
    });
  });

  return (
    <group ref={root}>
      {/* ===== lamp base ===== */}
      <mesh position={[0, 0.02, 0]} scale={[1, 0.28, 1]}>
        <sphereGeometry args={[0.55, 32, 16]} />
        <meshStandardMaterial
          color={COLORS.gold}
          metalness={0.85}
          roughness={0.25}
          emissive={COLORS.gold}
          emissiveIntensity={0.15 + tierIndex * 0.12}
        />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.035, 12, 32]} />
        <meshStandardMaterial
          color={COLORS.goldBright}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      <pointLight
        ref={baseGlow}
        position={[0, 0.45, 0.3]}
        color={aura}
        intensity={1}
        distance={4.5}
        decay={2}
      />

      {/* ===== smoke wisps ===== */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) wisps.current[i] = el;
          }}
          position={[0, 0.3, 0]}
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color={COLORS.smoke}
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* ===== tapering body ===== */}
      <group ref={body} position={[0, 0.3, 0]}>
        <mesh geometry={bodyProfile}>
          <meshStandardMaterial
            color={COLORS.body}
            roughness={0.45}
            metalness={0.1}
          />
        </mesh>
        {/* waist sash — appears from Ember up */}
        {tierIndex >= 1 && (
          <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.47, 0.05, 12, 40]} />
            <meshStandardMaterial
              color={COLORS.gold}
              metalness={0.85}
              roughness={0.25}
            />
          </mesh>
        )}
      </group>

      {/* ===== floating hands ===== */}
      <mesh ref={handL} position={[-0.72, 1.45, 0.18]}>
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshStandardMaterial color={COLORS.body} roughness={0.45} />
      </mesh>
      <mesh ref={handR} position={[0.72, 1.45, 0.18]}>
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshStandardMaterial color={COLORS.body} roughness={0.45} />
      </mesh>

      {/* ===== head ===== */}
      <group ref={head} position={[0, 2.32, 0]}>
        <mesh scale={[1, 0.95, 0.92]}>
          <sphereGeometry args={[0.62, 32, 32]} />
          <meshStandardMaterial
            color={COLORS.body}
            roughness={0.45}
            metalness={0.1}
          />
        </mesh>

        {/* eyes — big, expressive, ~1/3 of face */}
        <group ref={eyes} position={[0, 0.08, 0]}>
          {[-0.23, 0.23].map((x) => (
            <group key={x} position={[x, 0, 0.42]}>
              <mesh scale={[1, 1.3, 0.55]}>
                <sphereGeometry args={[0.16, 20, 20]} />
                <meshStandardMaterial color="#fdfefc" roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.01, 0.09]} scale={[1, 1.25, 0.5]}>
                <sphereGeometry args={[0.095, 16, 16]} />
                <meshStandardMaterial color={COLORS.eye} roughness={0.15} />
              </mesh>
              <mesh position={[0.035, 0.07, 0.14]}>
                <sphereGeometry args={[0.028, 10, 10]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#ffffff"
                  emissiveIntensity={0.6}
                />
              </mesh>
            </group>
          ))}
        </group>

        {/* mouth — scales with speech amplitude */}
        <mesh ref={mouth} position={[0, -0.22, 0.5]} scale={[1.3, 1, 0.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={COLORS.bodyDeep} roughness={0.3} />
        </mesh>

        {/* golden earrings — appear from Flame up */}
        {tierIndex >= 2 &&
          [-0.58, 0.58].map((x) => (
            <mesh key={x} position={[x, -0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.07, 0.02, 10, 24]} />
              <meshStandardMaterial
                color={COLORS.gold}
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
          ))}

        {/* topknot swirl + gold band */}
        <mesh position={[0, 0.62, 0]} rotation={[0, 0, 0.18]}>
          <coneGeometry args={[0.24, 0.5, 24]} />
          <meshStandardMaterial color={COLORS.bodyDeep} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.04, 12, 32]} />
          <meshStandardMaterial
            color={COLORS.gold}
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
        {/* forehead jewel — Blaze only */}
        {tierIndex >= 3 && (
          <mesh position={[0, 0.28, 0.55]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial
              color={COLORS.saffron}
              emissive={COLORS.saffron}
              emissiveIntensity={0.9}
              roughness={0.2}
            />
          </mesh>
        )}
      </group>

      {/* ===== thinking orbit particles ===== */}
      <group ref={orbit} position={[0, 3.1, 0]}>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.75, Math.sin(i * 2.1) * 0.08, Math.sin(angle) * 0.75]}
            >
              <sphereGeometry args={[0.045, 10, 10]} />
              <meshStandardMaterial
                color={COLORS.goldBright}
                emissive={COLORS.goldBright}
                emissiveIntensity={1.2}
                transparent
                opacity={0}
              />
            </mesh>
          );
        })}
      </group>

      {/* ===== ambient sparkles — denser & warmer at higher tiers ===== */}
      <Sparkles
        count={14 + tierIndex * 10 + (avatarState === "celebrating" ? 40 : 0)}
        scale={[1.8, 2.6, 1.8]}
        position={[0, 1.4, 0]}
        size={avatarState === "celebrating" ? 5 : 2.5}
        speed={avatarState === "celebrating" ? 1.4 : 0.4}
        color={aura}
        opacity={0.8}
      />
    </group>
  );
}
