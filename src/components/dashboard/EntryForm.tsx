"use client";

import { useState } from "react";
import type { EntryKind } from "@/lib/db";
import { BUILDINGS } from "@/lib/buildings";

interface EntryFormProps {
  kind: EntryKind;
  accessCode: string;
  defaultBuilding?: string;
  onSaved: () => void;
  onCancel: () => void;
}

const UNIT_TYPES = ["Studio", "1BR", "2BR", "3BR"];
const CONDITIONS = ["Classic", "Renovated"];

export default function EntryForm({ kind, accessCode, defaultBuilding, onSaved, onCancel }: EntryFormProps) {
  const [form, setForm] = useState({
    building: defaultBuilding ?? (BUILDINGS[0]?.code ?? ""),
    apt_number: "",
    unit_type: "Studio",
    unit_condition: "Classic",
    rent: "",
    notes: "",
    move_in_date: "",
    notice_date: "",
    move_out_date: "",
    maintenance_needed: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!form.building.trim()) { setError("Building required."); return; }
    if (!form.apt_number.trim()) { setError("Unit number required."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-access-code": accessCode },
        body: JSON.stringify({ kind, ...form }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Failed to save.");
        setSaving(false);
        return;
      }
      onSaved();
    } catch {
      setError("Network error.");
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    borderRadius: "6px",
    padding: "10px 12px",
    color: "var(--color-text)",
    fontFamily: "var(--font-body)",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.7rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
    marginBottom: "6px",
  };

  const fieldWrap: React.CSSProperties = { marginBottom: "16px" };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "32px 28px",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text)",
            fontSize: "1.2rem",
            fontWeight: 400,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          Add {kind === "vacant" ? "Vacant Unit" : "Move-Out Notice"}
        </h2>

        {/* Building */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Building *</label>
          <select style={inputStyle} value={form.building} onChange={(e) => set("building", e.target.value)}>
            {BUILDINGS.map((b) => (
              <option key={b.code} value={b.code}>
                {b.address}
              </option>
            ))}
          </select>
        </div>

        {/* Unit number */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Unit # *</label>
          <input
            style={inputStyle}
            placeholder="e.g. 01, 04B"
            value={form.apt_number}
            onChange={(e) => set("apt_number", e.target.value)}
          />
        </div>

        {/* Unit type + condition row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={labelStyle}>Unit Type</label>
            <select style={{ ...inputStyle }} value={form.unit_type} onChange={(e) => set("unit_type", e.target.value)}>
              {UNIT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Condition</label>
            <select style={{ ...inputStyle }} value={form.unit_condition} onChange={(e) => set("unit_condition", e.target.value)}>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Rent */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Rent</label>
          <input style={inputStyle} placeholder="e.g. $1,850" value={form.rent} onChange={(e) => set("rent", e.target.value)} />
        </div>

        {/* Vacant-specific fields */}
        {kind === "vacant" && (
          <>
            <div style={fieldWrap}>
              <label style={labelStyle}>Target Move-In Date</label>
              <input type="date" style={inputStyle} value={form.move_in_date} onChange={(e) => set("move_in_date", e.target.value)} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Maintenance Needed</label>
              <input style={inputStyle} placeholder="e.g. Paint, carpet, HVAC..." value={form.maintenance_needed} onChange={(e) => set("maintenance_needed", e.target.value)} />
            </div>
          </>
        )}

        {/* Notice-specific fields */}
        {kind === "notice" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>Notice Date</label>
                <input type="date" style={inputStyle} value={form.notice_date} onChange={(e) => set("notice_date", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Move-Out Date</label>
                <input type="date" style={inputStyle} value={form.move_out_date} onChange={(e) => set("move_out_date", e.target.value)} />
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Notes</label>
          <textarea
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Additional notes..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>

        {error && <p style={{ color: "#e05c5c", fontSize: "0.8rem", marginBottom: "12px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              padding: "11px",
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            style={{
              flex: 2,
              background: "var(--color-accent)",
              border: "none",
              borderRadius: "6px",
              padding: "11px",
              color: "#0D1A12",
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
