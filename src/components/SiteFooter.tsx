"use client";

import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";

const footerLinks = [
  { label: "Home", href: "#home" },
  { label: "Amenities", href: "#amenities" },
  { label: "Floor Plans", href: "#floor-plans" },
  { label: "Contact", href: "#contact" },
];

const portalLinks = [
  { label: "Tenant Portal", href: "https://montagne.appfolio.com/connect/users/sign_in?a=cw&utm_source=apmsites_v3&utm_campaign=pay_rent_button" },
  { label: "Owner Portal", href: "https://montagne.appfolio.com/oportal/users/log_in?a=cw&utm_source=apmsites_v3&utm_campaign=oportal_login" },
];

export default function SiteFooter() {
  const { theme } = useTheme();
  return (
    <footer
      className="relative w-full pt-16 pb-10 px-6"
      style={{ background: "var(--color-bg)" }}
      role="contentinfo"
    >
      {/* Gold top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, var(--color-accent) 30%, var(--color-accent) 70%, transparent 100%)",
          opacity: 0.5,
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Logo + tagline */}
          <div className="flex flex-col">
            <a href="#home" aria-label="Emory Woods - back to top">
              <img
                src={theme === "dark" ? "/LogoWhite.png" : "https://lirp.cdn-website.com/6cfb94ae/dms3rep/multi/opt/emorywoodslogo-01-423w.png"}
                alt="Emory Woods Apartments"
                className="h-10 w-auto object-contain mb-5"
                loading="lazy"
              />
            </a>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                fontSize: "13px",
                color: "var(--color-text-muted)",
                lineHeight: 1.8,
                maxWidth: "260px",
              }}
            >
              A 24-acre wooded sanctuary in Decatur, Georgia - minutes from
              Emory University and the heart of Atlanta.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p
              className="mb-5"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 400,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
              }}
            >
              Navigate
            </p>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3" role="list">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="cursor-pointer"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 300,
                        fontSize: "14px",
                        color: "var(--color-text-muted)",
                        textDecoration: "none",
                        transition: "color 0.25s ease",
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
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Portals + Contact */}
          <div>
            <p
              className="mb-5"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 400,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
              }}
            >
              Resident Services
            </p>
            <ul className="space-y-3 mb-8" role="list">
              {portalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer inline-flex items-center gap-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 300,
                      fontSize: "14px",
                      color: "var(--color-text-muted)",
                      textDecoration: "none",
                      transition: "color 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--color-accent)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--color-text-muted)";
                    }}
                  >
                    {link.label}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 8L8 2M4 2h4v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>

            {/* Contact details */}
            <div className="space-y-2">
              <a
                href="tel:+14046343777"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  display: "block",
                  textDecoration: "none",
                  transition: "color 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-muted)";
                }}
              >
                Phone: (404) 634-3777
              </a>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                }}
              >
                Fax: (404) 634-9694
              </p>
              <a
                href="mailto:leasing@emorywoods.com"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  display: "block",
                  textDecoration: "none",
                  transition: "color 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-muted)";
                }}
              >
                leasing@emorywoods.com
              </a>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                }}
              >
                2085 Powell Ln, Decatur, GA 30033
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: "12px",
              color: "var(--color-text-muted)",
              opacity: 0.7,
            }}
          >
            &copy; 2026 Emory Woods Apartments. All rights reserved.
          </p>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: "13px",
              color: "var(--color-text-muted)",
              opacity: 0.4,
              letterSpacing: "0.05em",
            }}
          >
            Decatur, Georgia 30033
          </p>
        </div>
      </div>
    </footer>
  );
}
