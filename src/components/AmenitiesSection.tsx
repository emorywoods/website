"use client";

import { motion } from "framer-motion";

const amenities = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12h18M3 12c0 4.418 4.03 8 9 8s9-3.582 9-8M3 12c0-1.5.5-3 2-4.5M21 12c0-1.5-.5-3-2-4.5M5 7.5C6.5 5.5 9 4 12 4s5.5 1.5 7 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 12a4 4 0 0 0 8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Swimming Pool",
    description:
      "Resort-style pool nestled among 24 acres of wooded grounds — your private escape.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="10" width="18" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 10V7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 14h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="17" r="1" fill="currentColor"/>
      </svg>
    ),
    title: "Covered Carports",
    description:
      "Protected parking for every resident, year-round — your vehicle sheltered from Georgia weather.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="14" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="3" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 13h7M14 17h7M14 21h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "On-Site Laundry",
    description:
      "Modern laundry facilities in every building — convenient, clean, and always accessible.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5.636 5.636l2.828 2.828M15.536 15.536l2.828 2.828M5.636 18.364l2.828-2.828M15.536 8.464l2.828-2.828" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Central HVAC",
    description:
      "Climate-controlled comfort in every season — cool Georgia summers, warm winter evenings.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 8h18M8 8v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 13h5M12 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Hardwood Floors",
    description:
      "Select units featuring rich hardwood throughout — warmth underfoot, character in every grain.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M15 17l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 9h10M7 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "MARTA Access",
    description:
      "Minutes from public transit — connect to all of Atlanta seamlessly from your doorstep.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function AmenitiesSection() {
  return (
    <section
      id="amenities"
      className="relative w-full py-16 md:py-24 lg:py-32 px-5 md:px-6"
      style={{ background: "var(--color-surface)" }}
      aria-labelledby="amenities-heading"
    >
      {/* Subtle top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "var(--color-border)" }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="mb-10 md:mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-label">Amenities</span>
          <h2
            id="amenities-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(44px, 6vw, 72px)",
              color: "var(--color-text)",
              lineHeight: 1.08,
              maxWidth: "600px",
            }}
          >
            Everything You Need
            <br />
            Within Your Sanctuary
          </h2>
        </motion.div>

        {/* Amenity cards grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {amenities.map((amenity) => (
            <AmenityCard key={amenity.title} amenity={amenity} />
          ))}
        </motion.div>
      </div>

      {/* Subtle bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "var(--color-border)" }}
      />
    </section>
  );
}

function AmenityCard({
  amenity,
}: {
  amenity: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
}) {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative p-8 rounded-sm cursor-default"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--color-border)",
        transition: "border-color 0.4s cubic-bezier(0.32, 0.72, 0, 1), background 0.4s ease",
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--card-border-hover)";
        el.style.background = "var(--card-bg-hover)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--color-border)";
        el.style.background = "var(--card-bg)";
      }}
    >
      {/* Gold corner accent */}
      <div
        className="absolute top-0 left-0 w-8 h-px"
        style={{
          background: "var(--color-accent)",
          transition: "width 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      />
      <div
        className="absolute top-0 left-0 w-px h-8"
        style={{
          background: "var(--color-accent)",
          transition: "height 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      />

      {/* Icon */}
      <div
        className="mb-6"
        style={{ color: "var(--color-accent)" }}
        aria-hidden="true"
      >
        {amenity.icon}
      </div>

      {/* Title */}
      <h3
        className="mb-3"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "22px",
          color: "var(--color-text)",
          lineHeight: 1.2,
        }}
      >
        {amenity.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 300,
          fontSize: "14px",
          color: "var(--color-text-muted)",
          lineHeight: 1.75,
        }}
      >
        {amenity.description}
      </p>
    </motion.div>
  );
}
