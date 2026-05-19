"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ListingsMap = dynamic(() => import("@/components/ListingsMap"), { ssr: false });

const units = [
  {
    slug: "539-webster-unit-1",
    address: "539 Webster Drive",
    unit: "Unit No. 1",
    city: "Decatur, GA 30033",
    headline: "Brand New Renovated 2 Bedroom Apartment Located Near Emory University",
    badge: "2 BR",
    bedrooms: 2,
    bathrooms: 1,
    price: "$1,850 / mo",
    sqft: "1,040 sqft.",
    image: "/2bedroom_render.png",
    lat: 33.7917834,
    lng: -84.3041630,
  },
  {
    slug: "2148-north-decatur-unit-1",
    address: "2148 North Decatur Road",
    unit: "Unit No. 1",
    city: "Decatur, GA 30033",
    headline: "Renovated Studio Apartment Located Near Emory University",
    badge: "Studio",
    bedrooms: 0,
    bathrooms: 1,
    price: "$880 / mo",
    sqft: "360 sqft.",
    image: "/studio_render.png",
    lat: 33.7917954,
    lng: -84.2980586,
  },
  {
    slug: "551-webster-unit-6",
    address: "551 Webster Drive",
    unit: "Unit No. 6",
    city: "Decatur, GA 30033",
    headline: "Brand New Renovated 3 Bedroom Townhome Apartment Located Near Emory University",
    badge: "3 BR",
    bedrooms: 3,
    bathrooms: 2,
    price: "$2,250 / mo",
    sqft: "1,265 sqft.",
    image: "/2bedroom_render.png",
    lat: 33.7920936,
    lng: -84.3043556,
  },
];

export default function ListingsPage() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const router = useRouter();


  return (
    <main style={{ background: "var(--color-bg)", height: "100vh", overflow: "hidden", color: "var(--color-text)", display: "flex", flexDirection: "column" }}>
      {/* Top nav bar */}
      <div style={{ padding: "16px 32px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "24px", flexShrink: 0 }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Home
        </Link>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
          ·
        </span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
          Showing {units.length} of {units.length} results
        </span>
      </div>

      {/* Split layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 53px)" }}>
        {/* Left: sticky map */}
        <div style={{ width: "55%", flexShrink: 0, position: "sticky", top: 0, height: "100%", overflow: "hidden" }}>
          <ListingsMap units={units} activeSlug={activeSlug} />
        </div>

        {/* Right: scrollable listings */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 32px 64px" }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: "28px" }}
          >
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(28px, 3.5vw, 48px)",
                lineHeight: 1.05,
                color: "var(--color-text)",
              }}
            >
              Available Units
            </h1>
          </motion.div>

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {units.map((unit, i) => (
              <motion.div
                key={unit.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
                onMouseEnter={() => setActiveSlug(unit.slug)}
                onMouseLeave={() => setActiveSlug(null)}
              >
                <div
                  style={{
                    background: "var(--color-surface)",
                    border: `1px solid ${activeSlug === unit.slug ? "rgba(201,168,76,0.5)" : "var(--color-border)"}`,
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    boxShadow: activeSlug === unit.slug ? "0 8px 32px rgba(0,0,0,0.3)" : "none",
                    overflow: "hidden",
                  }}
                >
                  {/* Property image */}
                  <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
                    <img
                      src={unit.image}
                      alt={unit.address}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        filter: "brightness(0.9) contrast(1.05)",
                        transition: "transform 0.5s ease",
                        transform: activeSlug === unit.slug ? "scale(1.03)" : "scale(1)",
                      }}
                    />
                    {/* Address overlay */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
                        padding: "32px 20px 16px",
                      }}
                    >
                      <h2
                        style={{
                          fontFamily: "var(--font-display)",
                          fontStyle: "italic",
                          fontWeight: 300,
                          fontSize: "18px",
                          color: "#fff",
                          lineHeight: 1.2,
                          margin: 0,
                        }}
                      >
                        {unit.address} {unit.unit}, {unit.city}
                      </h2>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "20px 24px 0" }}>
                    {/* Price */}
                    <div style={{ marginBottom: "14px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontStyle: "italic",
                          fontWeight: 300,
                          fontSize: "26px",
                          color: "var(--color-accent)",
                        }}
                      >
                        {unit.price}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "13px",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--color-text-muted)",
                          marginLeft: "8px",
                        }}
                      >
                        / month
                      </span>
                    </div>

                    {/* Stats row */}
                    <div
                      style={{
                        display: "flex",
                        gap: "24px",
                        paddingBottom: "14px",
                        borderBottom: "1px solid var(--color-border)",
                        marginBottom: "14px",
                      }}
                    >
                      {[
                        { icon: "bed", label: unit.bedrooms === 0 ? "Studio" : `${unit.bedrooms} beds` },
                        { icon: "bath", label: `${unit.bathrooms} bath` },
                        { icon: "sqft", label: unit.sqft },
                      ].map(({ icon, label }) => (
                        <div key={icon} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: "var(--color-text-muted)" }}>
                            {icon === "bed" && <path d="M3 12V7a1 1 0 011-1h16a1 1 0 011 1v5M3 12h18M3 12v5h18v-5M7 6V4M17 6V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                            {icon === "bath" && <path d="M4 12h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4zM6 12V6a2 2 0 012-2h1a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                            {icon === "sqft" && <path d="M3 3h5M3 3v5M21 3h-5M21 3v5M3 21h5M3 21v-5M21 21h-5M21 21v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                          </svg>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text-muted)" }}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Headline */}
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 300,
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        lineHeight: 1.65,
                        marginBottom: "20px",
                      }}
                    >
                      {unit.headline}
                    </p>
                  </div>

                  {/* CTA buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--color-border)" }}>
                    <Link
                      href={`/listings/${unit.slug}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "14px",
                        background: "var(--color-surface)",
                        fontFamily: "var(--font-body)",
                        fontSize: "13px",
                        fontWeight: 500,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--color-text)",
                        textDecoration: "none",
                        borderRight: "1px solid var(--color-border)",
                        transition: "background 0.25s ease",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-surface)"; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M6.5 4v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      View Details
                    </Link>
                    <a
                      href="/#contact"
                      onClick={(e) => { e.preventDefault(); router.push("/#contact"); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "14px",
                        background: "rgba(201,168,76,0.15)",
                        fontFamily: "var(--font-body)",
                        fontSize: "13px",
                        fontWeight: 500,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--color-accent)",
                        textDecoration: "none",
                        transition: "background 0.25s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(201,168,76,0.28)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(201,168,76,0.15)"; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M11 2L2 11M11 2H7M11 2V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Apply Now
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
