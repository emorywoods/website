"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        background: "var(--color-bg)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background radial */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(42, 74, 53, 0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "600px" }}>
        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(120px, 20vw, 200px)",
              color: "transparent",
              WebkitTextStroke: "1px rgba(201,168,76,0.25)",
              lineHeight: 1,
              display: "block",
              letterSpacing: "-0.02em",
            }}
          >
            404
          </span>
        </motion.div>

        {/* Gold rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{
            width: "48px",
            height: "1px",
            background: "var(--color-accent)",
            margin: "0 auto 28px",
          }}
        />

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(28px, 4vw, 44px)",
            color: "var(--color-text)",
            marginBottom: "16px",
            lineHeight: 1.15,
          }}
        >
          Page Not Found
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            fontSize: "14px",
            color: "var(--color-text-muted)",
            lineHeight: 1.85,
            marginBottom: "48px",
          }}
        >
          The page you're looking for has moved, or may never have existed.
          <br />
          Return home and find your place among the trees.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
          style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}
        >
          <Link
            href="/"
            style={{
              padding: "14px 36px",
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              textDecoration: "none",
              display: "inline-block",
              transition: "opacity 0.3s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.82")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
          >
            Back to Home
          </Link>
          <Link
            href="/#contact"
            style={{
              padding: "13px 36px",
              background: "transparent",
              color: "var(--color-accent)",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 400,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              textDecoration: "none",
              display: "inline-block",
              border: "1px solid var(--color-accent)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "var(--color-accent)";
              el.style.color = "var(--color-bg)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "transparent";
              el.style.color = "var(--color-accent)";
            }}
          >
            Contact Us
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
