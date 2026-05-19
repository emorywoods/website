"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        cursor: "zoom-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          padding: "3px",
          background:
            "linear-gradient(135deg, rgba(201,168,76,0.7) 0%, rgba(201,168,76,0.15) 50%, rgba(201,168,76,0.5) 100%)",
          cursor: "default",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            display: "block",
            maxWidth: "85vw",
            maxHeight: "85vh",
            width: "auto",
            height: "auto",
          }}
        />
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "-15px",
            right: "-15px",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "var(--color-bg)",
            border: "1px solid rgba(201,168,76,0.5)",
            color: "rgba(201,168,76,0.9)",
            fontSize: "18px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
