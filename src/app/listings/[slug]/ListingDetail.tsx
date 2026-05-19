"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ImageLightbox from "@/components/ImageLightbox";

type Listing = {
  address: string;
  unit: string;
  city: string;
  type: string;
  badge: string;
  price: string;
  sqft: string;
  bedrooms: number;
  bathrooms: number;
  available: string;
  description: string;
  features: readonly string[];
  nearby: readonly string[];
  contact: { phone: string; email: string };
  image?: string;
  applyUrl: string;
};

export default function ListingDetail({ listing }: { listing: Listing }) {
  const [lightbox, setLightbox] = useState(false);

  return (
    <main style={{ background: "var(--color-bg)", minHeight: "100vh", color: "var(--color-text)" }}>
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Link
          href="/listings"
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
          All Listings
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.05, color: "var(--color-text)" }}>
            {listing.address}
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--color-text-muted)", marginTop: "8px", letterSpacing: "0.05em" }}>
            {listing.city} &nbsp;·&nbsp; {listing.unit}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
            {listing.image ? (
              <div
                onClick={() => setLightbox(true)}
                style={{ position: "relative", padding: "3px", background: "linear-gradient(135deg, rgba(201,168,76,0.7) 0%, rgba(201,168,76,0.15) 50%, rgba(201,168,76,0.5) 100%)", boxShadow: "0 12px 48px rgba(0,0,0,0.5)", cursor: "zoom-in", marginBottom: "32px" }}
              >
                <img src={listing.image} alt={`${listing.type} floor plan`} style={{ width: "100%", height: "auto", display: "block", filter: "brightness(0.94) contrast(1.04)" }} />
                <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(0,0,0,0.65)", border: "1px solid rgba(201,168,76,0.45)", color: "rgba(201,168,76,0.95)", padding: "5px 10px", fontSize: "13px", letterSpacing: "0.18em", fontFamily: "var(--font-body)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1h3M1 1v3M9 9H6M9 9V6M9 1H6M9 1v3M1 9h3M1 9V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                  View Full Plan
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "32px", height: "320px", background: "var(--color-surface)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>Floor Plan Coming Soon</span>
              </div>
            )}

            <div style={{ padding: "3px", background: "linear-gradient(135deg, rgba(201,168,76,0.4) 0%, rgba(201,168,76,0.08) 50%, rgba(201,168,76,0.3) 100%)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d830.2!2d-84.32856!3d33.79432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f5066b1a94d4e5%3A0x84a82b6b1c0e7a0e!2s${encodeURIComponent(listing.address + ", " + listing.city)}!5e0!3m2!1sen!2sus!4v1234567890`}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", filter: "grayscale(0.3) brightness(0.85)" }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title={`${listing.address} location map`}
                />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} className="flex flex-col gap-10">
            <div className="grid grid-cols-3 gap-4" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "32px" }}>
              {[{ label: "Type", value: listing.badge }, { label: "Sq Ft", value: listing.sqft }, { label: "Bath", value: `${listing.bathrooms} Bath` }].map(({ label, value }) => (
                <div key={label}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "6px" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "22px", fontWeight: 300, color: "var(--color-text)" }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "32px" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "8px" }}>Monthly Rent</span>
              <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(32px, 4vw, 48px)", color: "var(--color-accent)", lineHeight: 1 }}>{listing.price}</span>
            </div>

            <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "32px" }}>
              <p style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: "14px", color: "var(--color-text-muted)", lineHeight: 1.85 }}>{listing.description}</p>
            </div>

            <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "32px" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "16px" }}>Unit Features</span>
              <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
                {listing.features.map((f) => (
                  <li key={f} style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 300, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--color-accent)", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "32px" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "16px" }}>Nearby</span>
              <ul className="grid grid-cols-1 gap-y-3">
                {listing.nearby.map((n) => (
                  <li key={n} style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 300, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--color-moss)", flexShrink: 0 }} />
                    {n}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href={`/?message=${encodeURIComponent(`Hello,\n\nI am interested in starting a rental application for the ${listing.type} at ${listing.address}, ${listing.unit}, ${listing.city}.\n\nPlease let me know the next steps to proceed.\n\nThank you.`)}#contact`}
                style={{ display: "block", textAlign: "center", padding: "16px 32px", background: "var(--color-accent)", color: "var(--color-bg)", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", transition: "opacity 0.3s ease" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
              >
                Apply Now
              </a>
              <a
                href={`/?message=${encodeURIComponent(`Hello,\n\nI would like to schedule a tour for the ${listing.type} at ${listing.address}, ${listing.unit}, ${listing.city}.\n\nPlease let me know your available times.\n\nThank you.`)}#contact`}
                style={{ display: "block", textAlign: "center", padding: "15px 32px", background: "transparent", color: "var(--color-accent)", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 400, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", border: "1px solid var(--color-accent)", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "var(--color-accent)"; el.style.color = "var(--color-bg)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "transparent"; el.style.color = "var(--color-accent)"; }}
              >
                Schedule a Tour
              </a>
              <div style={{ textAlign: "center", paddingTop: "8px", fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>
                {listing.contact.phone} &nbsp;·&nbsp; {listing.contact.email}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {lightbox && listing.image && (
        <ImageLightbox src={listing.image} alt={`${listing.type} floor plan`} onClose={() => setLightbox(false)} />
      )}
    </main>
  );
}
