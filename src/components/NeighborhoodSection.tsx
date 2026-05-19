"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const proximityItems = [
  { place: "Emory University", distance: "0.8 miles" },
  { place: "CDC Headquarters", distance: "1.2 miles" },
  { place: "Emory University Hospital", distance: "1.0 miles" },
  { place: "MARTA Station", distance: "Walking distance" },
  { place: "Downtown Decatur", distance: "2 miles" },
];

export default function NeighborhoodSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const isImageInView = useInView(imageRef, { once: true, margin: "-100px" });
  const isContentInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="neighborhood"
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ background: "var(--color-surface)" }}
      aria-labelledby="neighborhood-heading"
    >
      {/* Top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "var(--color-border)" }}
      />

      <div className="max-w-none grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">
        {/* Left: Image */}
        <div
          ref={imageRef}
          className="relative overflow-hidden"
          style={{ minHeight: "280px" }}
        >
          {/* Clip-path reveal animation left to right wipe */}
          <motion.div
            className="absolute inset-0"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={
              isImageInView
                ? { clipPath: "inset(0 0% 0 0)" }
                : { clipPath: "inset(0 100% 0 0)" }
            }
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <img
              src="https://lirp.cdn-website.com/6cfb94ae/dms3rep/multi/opt/decatur_2-1920w.jpg"
              alt="Decatur neighborhood near Emory Woods Apartments, tree-lined streets and local charm"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, transparent 70%, var(--color-surface) 100%)",
              }}
            />
          </motion.div>

          {/* Vertical text label */}
          <motion.span
            className="absolute bottom-12 left-8 text-xs tracking-widest uppercase"
            initial={{ opacity: 0, x: -20 }}
            animate={isImageInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              letterSpacing: "0.25em",
              color: "rgba(245, 239, 224, 0.5)",
              writingMode: "vertical-rl",
            }}
          >
            Decatur, Georgia
          </motion.span>
        </div>

        {/* Right: Content */}
        <div className="flex items-center py-12 px-6 md:py-16 md:px-10 lg:py-24 lg:px-16 xl:px-24">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, x: 40 }}
            animate={isContentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-label">Location</span>

            <h2
              id="neighborhood-heading"
              className="mb-6"
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(40px, 5vw, 64px)",
                color: "var(--color-text)",
                lineHeight: 1.08,
              }}
            >
              The Heart of
              <br />
              Decatur
            </h2>

            <p
              className="mb-10"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                fontSize: "15px",
                color: "var(--color-text-muted)",
                lineHeight: 1.8,
                maxWidth: "420px",
              }}
            >
              Nestled just minutes from Emory University, the CDC, and Emory
              University Hospital. Walk to local shops, cafes, and MARTA.
              Explore the vibrant DeKalb County lifestyle while returning to
              your wooded sanctuary.
            </p>

            {/* Proximity list */}
            <ul className="mb-10 space-y-4" role="list" aria-label="Nearby destinations">
              {proximityItems.map((item, index) => (
                <motion.li
                  key={item.place}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: 20 }}
                  animate={
                    isContentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
                  }
                  transition={{
                    duration: 0.6,
                    delay: 0.5 + index * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Gold dot */}
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "var(--color-accent)",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 300,
                        fontSize: "14px",
                        color: "var(--color-text)",
                      }}
                    >
                      {item.place}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      fontSize: "12px",
                      color: "var(--color-accent)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.distance}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* Divider */}
            <div
              className="mb-8"
              style={{ height: "1px", background: "var(--color-border)" }}
            />

            {/* CTA */}
            <a
              href="https://maps.google.com/?q=2085+Powell+Ln,+Decatur+GA+30033"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 cursor-pointer group"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "13px",
                letterSpacing: "0.2em",
                color: "var(--color-accent)",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "gap 0.3s ease",
              }}
            >
              Get Directions
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="group-hover:translate-x-1 transition-transform duration-300"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "var(--color-border)" }}
      />
    </section>
  );
}
