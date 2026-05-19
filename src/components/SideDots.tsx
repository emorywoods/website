"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { id: "home", label: "Home" },
  { id: "amenities", label: "Amenities" },
  { id: "floor-plans", label: "Floor Plans" },
  { id: "neighborhood", label: "Neighborhood" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export default function SideDots() {
  const [activeSection, setActiveSection] = useState("home");
  const [hoveredDot, setHoveredDot] = useState<string | null>(null);
  const observersRef = useRef<IntersectionObserver[]>([]);

  useEffect(() => {
    // Clean up previous observers
    observersRef.current.forEach((obs) => obs.disconnect());
    observersRef.current = [];

    const sectionElements = sections.map((s) =>
      document.getElementById(s.id)
    );

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    });

    sectionElements.forEach((el) => {
      if (el) observer.observe(el);
    });

    observersRef.current.push(observer);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-5"
      role="navigation"
      aria-label="Section navigation dots"
    >
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        const isHovered = hoveredDot === section.id;

        return (
          <div
            key={section.id}
            className="relative flex items-center justify-end"
          >
            {/* Tooltip label */}
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-8 whitespace-nowrap text-xs tracking-widest uppercase"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    letterSpacing: "0.2em",
                    color: "var(--color-text-muted)",
                    background: "rgba(13, 26, 18, 0.85)",
                    backdropFilter: "blur(8px)",
                    padding: "4px 8px",
                    borderRadius: "2px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {section.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Dot */}
            <a
              href={`#${section.id}`}
              aria-label={`Navigate to ${section.label} section`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredDot(section.id)}
              onMouseLeave={() => setHoveredDot(null)}
            >
              <motion.div
                className="relative flex items-center justify-center"
                style={{ width: "20px", height: "20px" }}
                animate={{ scale: isActive ? 1 : 0.85 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              >
                {/* Outer ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `1px solid ${isActive ? "var(--color-accent)" : "rgba(168, 159, 140, 0.4)"}`,
                    transition: "border-color 0.3s ease",
                  }}
                />
                {/* Inner fill */}
                <motion.div
                  className="rounded-full"
                  animate={{
                    width: isActive ? "8px" : "4px",
                    height: isActive ? "8px" : "4px",
                    backgroundColor: isActive
                      ? "var(--color-accent)"
                      : "rgba(168, 159, 140, 0.5)",
                  }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                />
              </motion.div>
            </a>
          </div>
        );
      })}
    </div>
  );
}
