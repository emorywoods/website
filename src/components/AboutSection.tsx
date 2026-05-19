"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function useCountUp(target: number, duration: number = 2000, active: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    let startTime: number | null = null;
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startValue + (target - startValue) * eased));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);

  return count;
}

function StatBox({
  value,
  label,
  suffix = "",
  active,
}: {
  value: number;
  label: string;
  suffix?: string;
  active: boolean;
}) {
  const count = useCountUp(value, 1800, active);

  return (
    <motion.div
      className="relative p-8 rounded-sm text-center"
      style={{
        border: "1px solid rgba(201, 168, 76, 0.3)",
        background: "rgba(42, 74, 53, 0.1)",
      }}
      whileHover={{
        borderColor: "rgba(201, 168, 76, 0.6)",
        background: "rgba(42, 74, 53, 0.2)",
        transition: { duration: 0.3 },
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-6 h-px" style={{ background: "var(--color-accent)" }} />
      <div className="absolute top-0 right-0 w-px h-6" style={{ background: "var(--color-accent)" }} />
      <div className="absolute bottom-0 left-0 w-6 h-px" style={{ background: "var(--color-accent)" }} />
      <div className="absolute bottom-0 left-0 w-px h-6" style={{ background: "var(--color-accent)" }} />

      <div
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: "clamp(48px, 6vw, 72px)",
          color: "var(--color-accent)",
          lineHeight: 1,
          marginBottom: "0.5rem",
        }}
      >
        {count}{suffix}
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 300,
          fontSize: "12px",
          letterSpacing: "0.2em",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full py-16 md:py-24 lg:py-32 px-5 md:px-6 overflow-hidden noise-overlay"
      style={{ background: "var(--color-bg)" }}
      aria-labelledby="about-heading"
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(42, 74, 53, 0.15) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.03 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="aboutNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#aboutNoise)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        {/* Label */}
        <motion.span
          className="section-label"
          style={{ display: "block", textAlign: "center" }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Our Story
        </motion.span>

        {/* Heading */}
        <motion.h2
          id="about-heading"
          className="mb-10"
          initial={{ opacity: 0, y: 35 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(44px, 6vw, 72px)",
            color: "var(--color-text)",
            lineHeight: 1.08,
          }}
        >
          A History of
          <br />
          Excellence
        </motion.h2>

        {/* Gold rule centered */}
        <motion.div
          className="mx-auto mb-10"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "60px",
            height: "1px",
            background: "var(--color-accent)",
            transformOrigin: "center",
          }}
        />

        {/* Body 1 */}
        <motion.p
          className="mb-6"
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            fontSize: "16px",
            color: "var(--color-text-muted)",
            lineHeight: 1.85,
            maxWidth: "680px",
            margin: "0 auto 1.5rem",
          }}
        >
          For decades, Emory Woods has stood as a premier residential community
          in Decatur, Georgia. Our dedicated team of property managers are
          polite, hardworking, efficient and considerate, ensuring smooth
          operations and courteous communication with every resident.
        </motion.p>

        {/* Body 2 */}
        <motion.p
          className="mb-16"
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            fontSize: "16px",
            color: "var(--color-text-muted)",
            lineHeight: 1.85,
            maxWidth: "680px",
            margin: "0 auto 4rem",
          }}
        >
          We believe exceptional living begins with exceptional service. Our
          staff maintains the highest standards, from tending our lush 24-acre
          grounds to addressing every resident need with care and
          professionalism.
        </motion.p>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <StatBox value={24} label="Wooded Acres" active={isInView} />
          <StatBox value={50} label="Years of Excellence" suffix="+" active={isInView} />
        </motion.div>
      </div>
    </section>
  );
}
