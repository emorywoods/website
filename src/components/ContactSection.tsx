"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const searchParams = useSearchParams();

  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg) {
      setFormState((prev) => ({ ...prev, message: msg }));
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative w-full py-16 md:py-24 lg:py-32 px-5 md:px-6 overflow-hidden"
      style={{ background: "var(--color-surface)" }}
      aria-labelledby="contact-heading"
    >
      {/* Top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "var(--color-border)" }}
      />

      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 20% 50%, rgba(42, 74, 53, 0.12) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24">
        {/* Left: Contact info */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-label">Contact</span>

          <h2
            id="contact-heading"
            className="mb-8"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(40px, 5vw, 64px)",
              color: "var(--color-text)",
              lineHeight: 1.08,
            }}
          >
            Begin Your
            <br />
            Journey Home
          </h2>

          <div
            className="mb-2"
            style={{ width: "40px", height: "1px", background: "var(--color-accent)" }}
          />

          <div className="mt-10 space-y-8">
            {/* Address */}
            <ContactInfoItem
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              }
              label="Address"
              value="2085 Powell Ln, Decatur, GA 30033"
              href="https://maps.google.com/?q=2085+Powell+Ln,+Decatur+GA+30033"
            />

            {/* Phone */}
            <ContactInfoItem
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              }
              label="Phone"
              value="(404) 634-3777"
              href="tel:+14046343777"
            />

            {/* Fax */}
            <ContactInfoItem
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="14" r="1" fill="currentColor"/>
                </svg>
              }
              label="Fax"
              value="(404) 634-9694"
            />

            {/* Email */}
            <ContactInfoItem
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              label="Email"
              value="leasing@emorywoods.com"
              href="mailto:leasing@emorywoods.com"
            />
          </div>

          {/* Pay Rent link */}
          <div className="mt-12">
            <a
              href="https://montagne.appfolio.com/connect/users/sign_in?a=cw&utm_source=apmsites_v3&utm_campaign=pay_rent_button"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 cursor-pointer group"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "13px",
                letterSpacing: "0.2em",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "10px 0",
                borderBottom: "1px solid var(--color-border)",
                transition: "color 0.3s ease, border-color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.color = "var(--color-accent)";
                el.style.borderBottomColor = "var(--color-accent)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.color = "var(--color-text-muted)";
                el.style.borderBottomColor = "var(--color-border)";
              }}
            >
              Tenant Portal - Pay Rent
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="group-hover:translate-x-1 transition-transform duration-300">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {submitted ? (
            <motion.div
              className="flex flex-col items-center justify-center h-full text-center py-24"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="mb-6"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  border: "1px solid var(--color-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3
                className="mb-4"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "32px",
                  color: "var(--color-text)",
                }}
              >
                Inquiry Sent
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  fontSize: "15px",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.75,
                  maxWidth: "360px",
                }}
              >
                Thank you for reaching out. Our leasing team will contact you
                within one business day.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-label="Contact inquiry form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <FormField
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  type="text"
                  value={formState.firstName}
                  onChange={handleChange}
                  required
                />
                <FormField
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  type="text"
                  value={formState.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-5">
                <FormField
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-5">
                <FormField
                  id="phone"
                  name="phone"
                  label="Phone (optional)"
                  type="tel"
                  value={formState.phone}
                  onChange={handleChange}
                  required={false}
                />
              </div>

              <div className="mb-8">
                <label
                  htmlFor="message"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    fontWeight: 400,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formState.message}
                  onChange={handleChange}
                  placeholder="Tell us about your interest in Emory Woods..."
                  style={{
                    width: "100%",
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "2px",
                    padding: "14px 16px",
                    fontFamily: "var(--font-body)",
                    fontWeight: 300,
                    fontSize: "14px",
                    color: "var(--color-text)",
                    resize: "vertical",
                    outline: "none",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-accent)";
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(201, 168, 76, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {error && (
                <p className="mb-4 text-sm" style={{ color: "#c0392b", fontFamily: "var(--font-body)" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full cursor-pointer py-4 text-xs tracking-widest uppercase rounded-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "13px",
                  letterSpacing: "0.2em",
                  background: submitting ? "rgba(201, 168, 76, 0.5)" : "var(--color-accent)",
                  color: "var(--color-bg)",
                  border: "none",
                  transition: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
                  opacity: submitting ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = "#d4b558";
                    el.style.boxShadow = "0 8px 32px rgba(201, 168, 76, 0.25)";
                    el.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = submitting ? "rgba(201, 168, 76, 0.5)" : "var(--color-accent)";
                  el.style.boxShadow = "none";
                  el.style.transform = "translateY(0)";
                }}
              >
                {submitting ? "Sending..." : "Send Inquiry"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function FormField({
  id,
  name,
  label,
  type,
  value,
  onChange,
  required,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          fontWeight: 400,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          display: "block",
          marginBottom: "8px",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--color-accent)", marginLeft: "4px" }} aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={type === "email" ? "email" : type === "tel" ? "tel" : "off"}
        style={{
          width: "100%",
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "2px",
          padding: "12px 16px",
          fontFamily: "var(--font-body)",
          fontWeight: 300,
          fontSize: "14px",
          color: "var(--color-text)",
          outline: "none",
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-accent)";
          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(201, 168, 76, 0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

function ContactInfoItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-4">
      <div
        className="mt-0.5 flex-shrink-0"
        style={{ color: "var(--color-accent)" }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 400,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: "4px",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            fontSize: "15px",
            color: "var(--color-text)",
            lineHeight: 1.5,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="cursor-pointer block"
        style={{ textDecoration: "none", transition: "opacity 0.2s ease" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.opacity = "0.75";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
        }}
      >
        {content}
      </a>
    );
  }

  return <div>{content}</div>;
}
