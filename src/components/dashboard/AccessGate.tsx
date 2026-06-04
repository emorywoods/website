"use client";

import { useState } from "react";

interface AccessGateProps {
  onUnlock: (code: string) => void;
}

export default function AccessGate({ onUnlock }: AccessGateProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  async function attempt() {
    const code = input.trim();
    if (!code) return;
    const res = await fetch("/api/units", { headers: { "x-access-code": code } });
    if (res.ok || res.status !== 401) {
      setError(false);
      localStorage.setItem("ew-dash-auth", code);
      onUnlock(code);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "380px",
          textAlign: "center",
          animation: shake ? "shake 0.5s ease" : undefined,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "1px solid var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text)",
            fontSize: "1.9rem",
            fontWeight: 400,
            letterSpacing: "0.08em",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          Emory Woods
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.96rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "36px",
          }}
        >
          Leasing Dashboard
        </p>

        <input
          type="password"
          placeholder="Access code"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === "Enter" && attempt()}
          style={{
            width: "100%",
            background: "var(--color-bg)",
            border: `1px solid ${error ? "#e05c5c" : "var(--color-border)"}`,
            borderRadius: "6px",
            padding: "12px 14px",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
            fontSize: "1.1rem",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: "12px",
            transition: "border-color 0.2s",
          }}
        />

        {error && (
          <p style={{ color: "#e05c5c", fontSize: "0.96rem", marginBottom: "12px" }}>
            Incorrect access code.
          </p>
        )}

        <button
          onClick={attempt}
          style={{
            width: "100%",
            background: "var(--color-accent)",
            color: "#0D1A12",
            border: "none",
            borderRadius: "6px",
            padding: "12px",
            fontFamily: "var(--font-body)",
            fontSize: "1.1rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Enter
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
