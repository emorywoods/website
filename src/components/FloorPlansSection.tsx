"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ImageLightbox from "./ImageLightbox";

const row1Plans = [
  {
    type: "Studio",
    badge: "Studio",
    price: "From $880/mo",
    tagline: "Efficient, elegant living.",
    description:
      "Perfectly curated for one. Every square foot intentional, every detail considered. Includes access to all community amenities.",
    features: ["All utilities access", "Central HVAC", "Modern finishes", "Community amenities"],
    gradient: "linear-gradient(160deg, rgba(42, 74, 53, 0.4) 0%, rgba(13, 26, 18, 0.1) 100%)",
    floorPlanImage: "/studio_render.png",
    slug: "2148-north-decatur-unit-1",
  },
  {
    type: "2 Bedroom Renovated",
    badge: "2 BR",
    price: "From $1,850/mo",
    tagline: "Garden-style townhome.",
    description:
      "Private entry. Light-filled interiors. A townhome that breathes with the forest around it — your own ground-level retreat with premium finishes.",
    features: ["Private entry", "Garden-facing", "Two full bedrooms", "Covered carport"],
    gradient: "linear-gradient(160deg, rgba(201, 168, 76, 0.15) 0%, rgba(13, 26, 18, 0.1) 100%)",
    floorPlanImage: "/2bedroom_render.png",
    slug: "539-webster-unit-1",
  },
  {
    type: "3 Bedroom Townhome",
    badge: "3 BR",
    price: "From $2,250/mo",
    tagline: "Generous family living.",
    description:
      "Multi-level layout with wooded views. Space for everyone - and then some. Where family life unfolds naturally.",
    features: ["Multi-level layout", "Wooded views", "Three bedrooms", "Hardwood floors available"],
    gradient: "linear-gradient(160deg, rgba(42, 61, 46, 0.5) 0%, rgba(13, 26, 18, 0.1) 100%)",
    floorPlanImage: "/3bedroom_render.png",
    slug: "551-webster-unit-6",
  },
];

const row2Plan = {
  type: "2 Bedroom Classic",
  badge: "2 BR",
  price: "From $1,225/mo",
  tagline: "Classic townhome living.",
  description:
    "Spacious 2 bedroom, 1 bath townhome offering comfortable living near Emory University. Great value with access to all community amenities.",
  features: ["Townhome layout", "Spacious green spaces", "Two full bedrooms", "On-site parking"],
  gradient: "linear-gradient(160deg, rgba(201, 168, 76, 0.1) 0%, rgba(13, 26, 18, 0.08) 100%)",
  floorPlanImage: "/2bedroom_classicfloorplan.jpeg",
  slug: "2122-powell-unit-5",
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function FloorPlansSection() {
  return (
    <section
      id="floor-plans"
      className="relative w-full py-16 md:py-24 lg:py-32 px-5 md:px-6"
      style={{ background: "var(--color-bg)" }}
      aria-labelledby="floorplans-heading"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(42, 74, 53, 0.12) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="mb-10 md:mb-16 lg:mb-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-label" style={{ display: "block", textAlign: "center" }}>
            Floor Plans
          </span>
          <h2
            id="floorplans-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(44px, 6vw, 72px)",
              color: "var(--color-text)",
              lineHeight: 1.08,
            }}
          >
            Choose Your Residence
          </h2>
          <div style={{ marginTop: "32px", display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
            <Link
              href="/listings"
              style={{
                display: "inline-block",
                padding: "14px 40px",
                background: "var(--color-accent)",
                color: "var(--color-bg)",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "opacity 0.3s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.82")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
            >
              Check Listings
            </Link>
            <Link
              href="/photo-gallery"
              style={{
                display: "inline-block",
                padding: "14px 40px",
                background: "transparent",
                color: "var(--color-accent)",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                textDecoration: "none",
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
              View Gallery
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {row1Plans.map((plan) => (
              <FloorPlanCard key={plan.type} plan={plan} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="hidden md:block" />
            <FloorPlanCard plan={row2Plan} />
            <div className="hidden md:block" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FloorPlanCard({
  plan,
}: {
  plan: {
    type: string;
    badge: string;
    price: string;
    tagline: string;
    description: string;
    features: string[];
    gradient: string;
    floorPlanImage?: string;
    slug: string;
  };
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * 12,
      y: (x - 0.5) * -12,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      variants={cardVariants}
      className="relative cursor-default"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative h-full rounded-sm overflow-hidden"
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          background: "var(--color-surface)",
          border: `1px solid ${isHovered ? "rgba(201, 168, 76, 0.4)" : "var(--color-border)"}`,
          transition: "border-color 0.4s ease",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: plan.gradient, opacity: isHovered ? 1 : 0.6, transition: "opacity 0.4s ease" }}
        />

        <div className="relative z-10 p-6 md:p-8 flex flex-col h-full" style={{ minHeight: "auto" }}>
          {plan.floorPlanImage && (
            <>
              <div className="mb-6 -mx-8 -mt-8">
                <div
                  onClick={() => setLightbox(true)}
                  style={{
                    position: "relative",
                    padding: "3px",
                    background: "linear-gradient(135deg, rgba(201,168,76,0.7) 0%, rgba(201,168,76,0.15) 50%, rgba(201,168,76,0.5) 100%)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    cursor: "zoom-in",
                  }}
                >
                  <img
                    src={plan.floorPlanImage}
                    alt={`${plan.type} floor plan`}
                    style={{
                      width: "100%",
                      height: "220px",
                      objectFit: "cover",
                      objectPosition: "center top",
                      display: "block",
                      filter: "brightness(0.93) contrast(1.04)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "13px",
                      right: "13px",
                      background: "rgba(0,0,0,0.6)",
                      border: "1px solid rgba(201,168,76,0.4)",
                      color: "rgba(201,168,76,0.9)",
                      padding: "4px 8px",
                      fontSize: "13px",
                      letterSpacing: "0.15em",
                      fontFamily: "var(--font-body)",
                      textTransform: "uppercase",
                    }}
                  >
                    View Full
                  </div>
                </div>
              </div>

              {lightbox && (
                <ImageLightbox
                  src={plan.floorPlanImage}
                  alt={`${plan.type} floor plan`}
                  onClose={() => setLightbox(false)}
                />
              )}
            </>
          )}

          <div className="flex items-start justify-between mb-8">
            <span
              className="text-xs tracking-widest uppercase px-3 py-1.5 rounded-sm"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                letterSpacing: "0.2em",
                background: "rgba(201, 168, 76, 0.15)",
                border: "1px solid rgba(201, 168, 76, 0.35)",
                color: "var(--color-accent)",
              }}
            >
              {plan.badge}
            </span>
          </div>

          <div
            className="mb-6"
            style={{ width: "40px", height: "1px", background: "var(--color-accent)" }}
          />

          <h3
            className="mb-2"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "28px",
              color: "var(--color-text)",
              lineHeight: 1.15,
            }}
          >
            {plan.type}
          </h3>

          <p
            className="mb-4"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "13px",
              color: "var(--color-accent)",
              letterSpacing: "0.05em",
            }}
          >
            {plan.tagline}
          </p>

          <p
            className="mb-8 flex-grow"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: "14px",
              color: "var(--color-text-muted)",
              lineHeight: 1.75,
            }}
          >
            {plan.description}
          </p>

          <ul className="mb-8 space-y-2" role="list">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                }}
              >
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "var(--color-accent)",
                    flexShrink: 0,
                  }}
                />
                {feature}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "20px",
                color: "var(--color-accent)",
              }}
            >
              {plan.price}
            </span>
            <Link
              href={`/listings/${plan.slug}`}
              className="cursor-pointer px-5 py-2.5 text-xs tracking-widest uppercase rounded-sm"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "13px",
                letterSpacing: "0.18em",
                border: "1px solid var(--color-accent)",
                color: "var(--color-accent)",
                background: "transparent",
                textDecoration: "none",
                transition: "all 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
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
              More Details
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}