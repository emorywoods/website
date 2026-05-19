"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ImageLightbox from "@/components/ImageLightbox";

const galleries = [
  {
    category: "Studio",
    images: [
      { src: "/studio_render.png", alt: "Studio apartment render" },
      { src: "/studio_01.png", alt: "Studio apartment photo 1" },
      { src: "/studio_02.png", alt: "Studio apartment photo 2" },
      { src: "/studio_03.png", alt: "Studio apartment photo 3" },
      { src: "/studio_04.png", alt: "Studio apartment photo 4" },
      { src: "/studio_05.png", alt: "Studio apartment photo 5" },
    ],
  },
  {
    category: "2 Bedroom",
    images: [
      { src: "/2bedroom_render.png", alt: "2 Bedroom townhome render" },
      { src: "/2bedroom_01.png", alt: "2 Bedroom townhome photo 1" },
      { src: "/2bedroom_02.png", alt: "2 Bedroom townhome photo 2" },
      { src: "/2bedroom_03.png", alt: "2 Bedroom townhome photo 3" },
      { src: "/2bedroom_04.png", alt: "2 Bedroom townhome photo 4" },
    ],
  },
  {
    category: "3 Bedroom",
    images: [
      { src: "/3bedroom_render.png", alt: "3 Bedroom townhome render" },
      { src: "/3bedroom_01.png", alt: "3 Bedroom townhome photo 1" },
      { src: "/3bedroom_02.png", alt: "3 Bedroom townhome photo 2" },
      { src: "/3bedroom_03.png", alt: "3 Bedroom townhome photo 3" },
      { src: "/3bedroom_04.png", alt: "3 Bedroom townhome photo 4" },
      { src: "/3bedroom_05.png", alt: "3 Bedroom townhome photo 5" },
    ],
  },
];

const allImages = galleries.flatMap((g) => g.images.map((img) => ({ ...img, category: g.category })));

export default function PhotoGalleryPage() {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...galleries.map((g) => g.category)];
  const filtered =
    activeCategory === "All"
      ? allImages
      : allImages.filter((img) => img.category === activeCategory);

  return (
    <main style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <section className="relative w-full pt-28 pb-8 px-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(42, 74, 53, 0.18) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              marginBottom: "32px",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-accent)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-muted)")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </Link>

          <span className="section-label" style={{ display: "block" }}>
            Photo Gallery
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(44px, 6vw, 72px)",
              color: "var(--color-text)",
              lineHeight: 1.08,
              marginTop: "8px",
            }}
          >
            Life at Emory Woods
          </h1>
        </div>
      </section>

      <section className="w-full px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  padding: "8px 20px",
                  border: `1px solid ${activeCategory === cat ? "var(--color-accent)" : "var(--color-border)"}`,
                  background: activeCategory === cat ? "rgba(201,168,76,0.12)" : "transparent",
                  color: activeCategory === cat ? "var(--color-accent)" : "var(--color-text-muted)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== cat) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.4)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== cat) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)";
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            layout
          >
            {filtered.map((img, i) => (
              <GalleryTile
                key={img.src}
                img={img}
                index={i}
                onClick={() => setLightbox({ src: img.src, alt: img.alt })}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </main>
  );
}

function GalleryTile({
  img,
  index,
  onClick,
}: {
  img: { src: string; alt: string; category: string };
  index: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "zoom-in",
        border: `1px solid ${hovered ? "rgba(201,168,76,0.5)" : "var(--color-border)"}`,
        transition: "border-color 0.35s ease",
        background: "var(--color-surface)",
      }}
    >
      <div style={{ paddingBottom: "66.67%", position: "relative" }}>
        <img
          src={img.src}
          alt={img.alt}
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: hovered
              ? "linear-gradient(180deg, transparent 40%, rgba(13,26,18,0.75) 100%)"
              : "linear-gradient(180deg, transparent 60%, rgba(13,26,18,0.45) 100%)",
            transition: "background 0.4s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "14px",
            left: "16px",
            right: "16px",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.9)",
              display: "block",
              marginBottom: "4px",
            }}
          >
            {img.category}
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "rgba(245,239,224,0.85)",
              lineHeight: 1.4,
            }}
          >
            {img.alt}
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.35s ease",
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(201,168,76,0.4)",
            padding: "4px 8px",
            color: "rgba(201,168,76,0.9)",
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          View
        </div>
      </div>
    </motion.div>
  );
}
