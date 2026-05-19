"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "./ThemeProvider";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Amenities", href: "#amenities" },
  { label: "Floor Plans", href: "#floor-plans" },
  { label: "Neighborhood", href: "#neighborhood" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax: image moves slower than scroll (0.3x speed)
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  // Scale grows slightly as user scrolls
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.0, 1.08]);
  // Hero content fades + rises out
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.4], ["0px", "-60px"]);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-[100dvh] w-full overflow-hidden"
      aria-label="Hero section - Emory Woods Apartments"
    >
      {/* Parallax background image */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ y: imageY, scale: imageScale }}
      >
        <img
          src="https://lirp.cdn-website.com/6cfb94ae/dms3rep/multi/opt/Emory_4-1920w.jpg"
          alt="Emory Woods Apartments exterior nestled among 24 acres of mature Georgia forest"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Forest overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "var(--hero-overlay)" }}
        />
        {/* Gradient vignette bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-64"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--hero-gradient))",
          }}
        />
      </motion.div>

      {/* Floating navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        aria-label="Primary navigation"
      >
        <div
          className="mx-4 mt-4 flex items-center justify-between px-6 py-3 rounded-sm"
          style={{
            background: "var(--nav-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--nav-border)",
          }}
        >
          {/* Logo */}
          <a href="#home" className="flex-shrink-0" aria-label="Emory Woods home">
            <img
              src={theme === "dark" ? "/LogoWhite.png" : "https://lirp.cdn-website.com/6cfb94ae/dms3rep/multi/opt/emorywoodslogo-01-423w.png"}
              alt="Emory Woods Apartments logo"
              className="h-8 w-auto object-contain"
            />
          </a>

          {/* Nav links - hidden on mobile */}
          <ul className="hidden md:flex items-center gap-8" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative text-xs font-normal tracking-widest uppercase cursor-pointer group"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-muted)",
                    letterSpacing: "0.2em",
                    transition: "color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "var(--color-text)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "var(--color-text-muted)";
                  }}
                >
                  {link.label}
                  {/* Gold underline on hover */}
                  <span
                    className="absolute -bottom-1 left-0 h-px w-0 group-hover:w-full"
                    style={{
                      background: "var(--color-accent)",
                      transition: "width 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
                    }}
                  />
                </a>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href="#contact"
            className="cursor-pointer text-xs font-medium tracking-widest uppercase px-5 py-2.5 rounded-sm"
            style={{
              fontFamily: "var(--font-body)",
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              letterSpacing: "0.15em",
              transition: "all 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "#d4b558";
              (e.currentTarget as HTMLAnchorElement).style.transform =
                "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "var(--color-accent)";
              (e.currentTarget as HTMLAnchorElement).style.transform =
                "translateY(0)";
            }}
          >
            Schedule Tour
          </a>
        </div>
      </nav>

      {/* Hero content - centered */}
      <motion.div
        className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* Location label */}
        <motion.span
          className="section-label mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ letterSpacing: "0.3em" }}
        >
          Decatur, Georgia
        </motion.span>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(56px, 9vw, 104px)",
            lineHeight: 1.05,
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
            marginBottom: "1.5rem",
            maxWidth: "900px",
          }}
        >
          Where Forest Meets
          <br />
          Home
        </motion.h1>

        {/* Sub-heading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "18px",
            color: "var(--color-text-muted)",
            letterSpacing: "0.03em",
            marginBottom: "3rem",
            maxWidth: "460px",
            lineHeight: 1.65,
          }}
        >
          24-acre wooded sanctuary near Emory University
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <a
            href="#amenities"
            className="cursor-pointer px-8 py-3.5 text-xs tracking-widest uppercase rounded-sm"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              letterSpacing: "0.18em",
              border: "1px solid var(--color-accent)",
              color: "var(--color-accent)",
              background: "transparent",
              transition: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "rgba(201, 168, 76, 0.12)";
              el.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "transparent";
              el.style.transform = "translateY(0)";
            }}
          >
            Explore Residences
          </a>

          <a
            href="#contact"
            className="cursor-pointer px-8 py-3.5 text-xs tracking-widest uppercase rounded-sm"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              letterSpacing: "0.18em",
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              border: "1px solid var(--color-accent)",
              transition: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "#d4b558";
              el.style.transform = "translateY(-2px)";
              el.style.boxShadow = "0 8px 32px rgba(201, 168, 76, 0.3)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "var(--color-accent)";
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
            }}
          >
            Schedule Tour
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ opacity: useTransform(scrollYProgress, [0, 0.15], [1, 0]) }}
      >
        <span
          className="text-xs tracking-widest uppercase"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-muted)",
            fontSize: "13px",
            letterSpacing: "0.25em",
          }}
        >
          Scroll
        </span>
        {/* Animated chevron */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 6l5 5 5-5"
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
