"use client";

import { useState } from "react";
import type { Unit, UnitStatus, UnitPatch } from "@/lib/units";

interface UnitRosterProps {
  units: Unit[];
  selectedBuilding: string | null | "all";
  accessCode: string;
  onRefresh: () => void;
  loading: boolean;
  emptyMessage?: string;
}

const UNIT_TYPES = ["Studio", "2BR", "3BR"];
const CONDITIONS = ["Classic", "Renovated"];
const STATUSES: UnitStatus[] = ["occupied", "vacant", "notice"];

const STATUS_COLORS: Record<UnitStatus | "vacant_rented", { bg: string; color: string; border: string }> = {
  occupied: {
    bg: "rgba(42,74,53,0.3)",
    color: "var(--color-text-muted)",
    border: "var(--color-border)",
  },
  vacant: {
    bg: "rgba(201,168,76,0.15)",
    color: "var(--color-accent)",
    border: "rgba(201,168,76,0.4)",
  },
  vacant_rented: {
    bg: "rgba(80,140,220,0.12)",
    color: "rgb(60,120,210)",
    border: "rgba(80,140,220,0.4)",
  },
  notice: {
    bg: "rgba(40,140,80,0.12)",
    color: "rgb(30,150,80)",
    border: "rgba(40,140,80,0.4)",
  },
};

function resolveDisplayStatus(unit: Unit): { key: UnitStatus | "vacant_rented"; label: string } {
  if (unit.status === "vacant" && unit.move_in_date) {
    return { key: "vacant_rented", label: "Vacant (Rented)" };
  }
  return { key: unit.status, label: unit.status.charAt(0).toUpperCase() + unit.status.slice(1) };
}

function StatusBadge({ unit }: { unit: Unit }) {
  const { key, label } = resolveDisplayStatus(unit);
  const s = STATUS_COLORS[key];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "0.88rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {label}
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  padding: "9px 11px",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "1.15rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "1rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  marginBottom: "5px",
};

function toDateInput(val: string | null | undefined): string {
  if (!val) return "";
  return val.slice(0, 10);
}

function parseUTCDate(val: string | null | undefined): Date | null {
  if (!val) return null;
  const d = new Date(toDateInput(val) + "T00:00:00Z");
  return isNaN(d.getTime()) ? null : d;
}

function fmt(date: string | null): string {
  if (!date) return "—";
  return new Date(toDateInput(date) + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export const LEASE_WARN_DAYS = 30;

export interface LeaseAlert {
  daysUntil: number;
  anniversary: string;
}

function leaseEndDate(moveIn: Date): Date {
  // Lease ends on the last day of the same month, one year later
  // e.g. move-in Oct 24 2025 → end Oct 31 2026
  // day=0 of next month = last day of current month
  const endYear = moveIn.getUTCFullYear() + 1;
  return new Date(Date.UTC(endYear, moveIn.getUTCMonth() + 1, 0));
}

export function getLeaseAlert(unit: Unit): LeaseAlert | null {
  if (unit.lease_type !== "12-month" || !unit.move_in_date) return null;
  const moveIn = parseUTCDate(unit.move_in_date);
  if (!moveIn) return null;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const anniversary = leaseEndDate(moveIn);
  const daysUntil = Math.round((anniversary.getTime() - today.getTime()) / 86_400_000);
  if (daysUntil > LEASE_WARN_DAYS) return null;

  return {
    daysUntil,
    anniversary: anniversary.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
  };
}

interface EditModalProps {
  unit: Unit;
  accessCode: string;
  onSaved: () => void;
  onCancel: () => void;
}

export function EditModal({ unit, accessCode, onSaved, onCancel }: EditModalProps) {
  function computedLeaseEnd(moveInVal: string | null | undefined): string {
    const d = parseUTCDate(moveInVal);
    return d ? toDateInput(leaseEndDate(d).toISOString()) : "";
  }

  const initMoveIn = toDateInput(unit.move_in_date);
  const initMoveOut = toDateInput(unit.move_out_date) || (
    unit.status === "occupied" && unit.lease_type === "12-month" ? computedLeaseEnd(unit.move_in_date) : ""
  );

  const [form, setForm] = useState<UnitPatch>({
    status: unit.status,
    tenant_name: unit.tenant_name,
    tenant_contact: unit.tenant_contact,
    unit_type: unit.unit_type,
    unit_condition: unit.unit_condition,
    rent: unit.rent,
    lease_type: unit.lease_type,
    move_in_date: initMoveIn,
    move_out_date: initMoveOut,
    notice_date: toDateInput(unit.notice_date),
    maintenance_needed: unit.maintenance_needed,
    notes: unit.notes,
    future_tenant: unit.future_tenant ?? "",
    future_move_in_date: toDateInput(unit.future_move_in_date),
  });
  const [showFutureTenant, setShowFutureTenant] = useState(
    !!(unit.future_tenant || unit.future_move_in_date)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof UnitPatch, value: string) {
    setForm((f) => {
      const next = { ...f, [key]: value || null };
      // Auto-update lease end when move-in changes, only if lease end matches the old computed value
      if (key === "move_in_date" && next.status === "occupied" && next.lease_type === "12-month") {
        const oldComputed = computedLeaseEnd(f.move_in_date);
        if (!f.move_out_date || toDateInput(f.move_out_date as string) === oldComputed) {
          next.move_out_date = computedLeaseEnd(value) || null;
        }
      }
      return next;
    });
  }

  async function submit() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/units?id=${unit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-access-code": accessCode },
        body: JSON.stringify(form),
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

  const fieldWrap: React.CSSProperties = { marginBottom: "14px" };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "28px 24px",
          width: "100%",
          maxWidth: "720px",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "22px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-text)", fontSize: "1.3rem", fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
            Unit {unit.apt_number}
          </h2>
          <span style={{ color: "var(--color-text-muted)", fontSize: "0.94rem" }}>{unit.building}</span>
        </div>

        {/* Lease expiry alert */}
        {(() => {
          const alert = getLeaseAlert(unit);
          if (!alert) return null;
          const urgent = alert.daysUntil <= 0;
          const color = urgent ? "#e05c5c" : "#e09a3c";
          const bg = urgent ? "rgba(224,92,92,0.08)" : "rgba(224,154,60,0.08)";
          const border = urgent ? "rgba(224,92,92,0.35)" : "rgba(224,154,60,0.35)";
          const label = urgent
            ? `Lease ended ${Math.abs(alert.daysUntil)} day${Math.abs(alert.daysUntil) !== 1 ? "s" : ""} ago (${alert.anniversary})`
            : alert.daysUntil === 0
            ? `Lease ends today (${alert.anniversary})`
            : `Lease ends in ${alert.daysUntil} day${alert.daysUntil !== 1 ? "s" : ""} — ${alert.anniversary}`;
          return (
            <div style={{
              background: bg, border: `1px solid ${border}`, borderRadius: "7px",
              padding: "10px 14px", marginBottom: "18px", display: "flex", alignItems: "center", gap: "10px",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span style={{ fontSize: "0.97rem", color, letterSpacing: "0.04em" }}>{label}</span>
            </div>
          );
        })()}

        {/* Status */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Status</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {STATUSES.map((s) => {
              const active = (form.status ?? "occupied") === s;
              const palette: Record<UnitStatus, { bg: string; activeBg: string; color: string; border: string }> = {
                occupied: {
                  bg: "transparent",
                  activeBg: "rgba(42,74,53,0.35)",
                  color: active ? "var(--color-text)" : "var(--color-text-muted)",
                  border: active ? "rgba(42,74,53,0.7)" : "var(--color-border)",
                },
                vacant: {
                  bg: "transparent",
                  activeBg: "rgba(201,168,76,0.18)",
                  color: active ? "var(--color-accent)" : "var(--color-text-muted)",
                  border: active ? "rgba(201,168,76,0.6)" : "var(--color-border)",
                },
                notice: {
                  bg: "transparent",
                  activeBg: "rgba(40,140,80,0.15)",
                  color: active ? "rgb(30,150,80)" : "var(--color-text-muted)",
                  border: active ? "rgba(40,140,80,0.6)" : "var(--color-border)",
                },
              };
              const p = palette[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  style={{
                    flex: 1,
                    padding: "10px 8px",
                    borderRadius: "6px",
                    border: `1px solid ${p.border}`,
                    background: active ? p.activeBg : p.bg,
                    color: p.color,
                    fontFamily: "var(--font-body)",
                    fontSize: "0.88rem",
                    fontWeight: active ? 600 : 400,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tenant */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <div>
            <label style={labelStyle}>Tenant Name</label>
            <input style={inputStyle} placeholder="Full name" value={form.tenant_name ?? ""} onChange={(e) => set("tenant_name", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Contact</label>
            <input style={inputStyle} placeholder="Phone / email" value={form.tenant_contact ?? ""} onChange={(e) => set("tenant_contact", e.target.value)} />
          </div>
        </div>

        {/* Unit type + condition + rent */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <div>
            <label style={labelStyle}>Unit Type</label>
            <select style={inputStyle} value={form.unit_type ?? ""} onChange={(e) => set("unit_type", e.target.value)}>
              <option value="">—</option>
              {UNIT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Condition</label>
            <select style={inputStyle} value={form.unit_condition ?? ""} onChange={(e) => set("unit_condition", e.target.value)}>
              <option value="">—</option>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Rent</label>
            <input style={inputStyle} placeholder="$1,850" value={form.rent ?? ""} onChange={(e) => set("rent", e.target.value)} />
          </div>
        </div>

        {/* Lease type */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Lease Type</label>
          <select style={inputStyle} value={form.lease_type ?? ""} onChange={(e) => set("lease_type", e.target.value)}>
            <option value="">— Select —</option>
            <option value="month-to-month">Month-to-Month</option>
            <option value="12-month">12-Month Lease</option>
          </select>
        </div>

        {/* Dates */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
          <div>
            <label style={labelStyle}>{form.status === "occupied" && form.lease_type === "12-month" ? "Last Lease Renewal / Lease From" : "Move-In"}</label>
            <input type="date" style={inputStyle} value={form.move_in_date ?? ""} onChange={(e) => set("move_in_date", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Notice Date</label>
            <input type="date" style={inputStyle} value={form.notice_date ?? ""} onChange={(e) => set("notice_date", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>{form.status === "occupied" && form.lease_type === "12-month" ? "Lease To" : "Move-Out"}</label>
            <input type="date" style={inputStyle} value={form.move_out_date ?? ""} onChange={(e) => set("move_out_date", e.target.value)} />
          </div>
        </div>

        {/* Maintenance */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Maintenance Needed</label>
          <input style={inputStyle} placeholder="e.g. Paint, carpet, HVAC..." value={form.maintenance_needed ?? ""} onChange={(e) => set("maintenance_needed", e.target.value)} />
        </div>

        {/* Notes */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Notes</label>
          <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Additional notes..." value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
        </div>

        {/* Future tenant — only for vacant / notice */}
        {(form.status === "vacant" || form.status === "notice") && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ borderTop: "1px solid var(--color-border)", marginBottom: "14px" }} />
            {!showFutureTenant ? (
              <button
                type="button"
                onClick={() => setShowFutureTenant(true)}
                style={{
                  background: "transparent",
                  border: "1px dashed rgba(201,168,76,0.4)",
                  borderRadius: "6px",
                  padding: "9px 14px",
                  color: "var(--color-accent)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.94rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Future Tenant
              </button>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                    Future Tenant
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFutureTenant(false);
                      setForm((f) => ({ ...f, future_tenant: "", future_move_in_date: "" }));
                    }}
                    style={{
                      background: "transparent", border: "none", color: "var(--color-text-muted)",
                      fontSize: "0.94rem", cursor: "pointer", padding: "2px 4px",
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={labelStyle}>Tenant Name</label>
                    <input
                      style={inputStyle}
                      placeholder="Future tenant name"
                      value={form.future_tenant ?? ""}
                      onChange={(e) => set("future_tenant", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Scheduled Move-In</label>
                    <input
                      type="date"
                      style={inputStyle}
                      value={form.future_move_in_date ?? ""}
                      onChange={(e) => set("future_move_in_date", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p style={{ color: "#e05c5c", fontSize: "1rem", marginBottom: "12px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, background: "transparent", border: "1px solid var(--color-border)",
              borderRadius: "6px", padding: "11px", color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)", fontSize: "1rem", letterSpacing: "0.08em",
              textTransform: "uppercase", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            style={{
              flex: 2, background: "var(--color-accent)", border: "none", borderRadius: "6px",
              padding: "11px", color: "#0D1A12", fontFamily: "var(--font-body)", fontSize: "1rem",
              fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
              cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Unit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UnitRoster({ units, selectedBuilding, accessCode, onRefresh, loading, emptyMessage }: UnitRosterProps) {
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  if (selectedBuilding === null) {
    return (
      <div
        style={{
          border: "1px dashed var(--color-border)",
          borderRadius: "8px",
          padding: "40px 28px",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "1.02rem",
        }}
      >
        Select a building on the map to view its unit roster.
      </div>
    );
  }

  return (
    <div>
      {editingUnit && (
        <EditModal
          unit={editingUnit}
          accessCode={accessCode}
          onSaved={() => { setEditingUnit(null); onRefresh(); }}
          onCancel={() => setEditingUnit(null)}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ color: "var(--color-text-muted)", fontSize: "0.94rem", letterSpacing: "0.08em" }}>
          {loading ? "…" : `${units.length} ${units.length === 1 ? "unit" : "units"}`}
        </span>
      </div>

      <div style={{ borderTop: "1px solid var(--color-border)", marginBottom: "12px" }} />

      {loading ? (
        <p style={{ color: "var(--color-text-muted)", fontSize: "1rem" }}>Loading...</p>
      ) : units.length === 0 ? (
        <div
          style={{
            border: "1px dashed var(--color-border)", borderRadius: "8px", padding: "28px",
            textAlign: "center", color: "var(--color-text-muted)", fontSize: "1rem",
          }}
        >
          {emptyMessage ?? "No units found."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {units.map((u) => (
            <div
              key={u.id}
              onClick={() => setEditingUnit(u)}
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "12px 16px",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: "1.15rem" }}>
                    {selectedBuilding === "all" ? `${u.building} — Unit ${u.apt_number}` : `Unit ${u.apt_number}`}
                  </span>
                  <StatusBadge unit={u} />
                  {(() => {
                    const alert = getLeaseAlert(u);
                    if (!alert) return null;
                    const urgent = alert.daysUntil <= 0;
                    const color = urgent ? "#e05c5c" : "#e09a3c";
                    const border = urgent ? "rgba(224,92,92,0.4)" : "rgba(224,154,60,0.4)";
                    const bg = urgent ? "rgba(224,92,92,0.1)" : "rgba(224,154,60,0.1)";
                    const label = urgent ? "Lease expired" : `Lease ends in ${alert.daysUntil}d`;
                    return (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "2px 7px", borderRadius: "4px", fontSize: "0.87rem",
                        letterSpacing: "0.07em", textTransform: "uppercase",
                        background: bg, color, border: `1px solid ${border}`,
                      }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        {label}
                      </span>
                    );
                  })()}
                </div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.94rem" }}>
                  {u.unit_type || "—"}{u.unit_condition ? ` · ${u.unit_condition}` : ""}{u.rent ? ` · ${u.rent}` : ""}
                </span>
              </div>
              <div style={{ fontSize: "0.97rem", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                {u.tenant_name ? (
                  <div>
                    <strong style={{ color: "var(--color-text)" }}>Tenant:</strong> <strong style={{ color: "var(--color-text)" }}>{u.tenant_name}</strong>
                    {u.tenant_contact && <span> · {u.tenant_contact}</span>}
                  </div>
                ) : (
                  <div style={{ fontStyle: "italic", opacity: 0.6 }}>No tenant info — click to edit</div>
                )}
                {u.lease_type && (
                  <div><strong style={{ color: "var(--color-text)" }}>Lease:</strong> {u.lease_type === "12-month" ? "12-Month" : u.lease_type === "month-to-month" ? "Month-to-Month" : u.lease_type}</div>
                )}
                {u.move_in_date && u.status === "occupied" && u.lease_type === "12-month" && (
                  <div><strong style={{ color: "var(--color-text)" }}>Lease From:</strong> {fmt(u.move_in_date)}{u.move_out_date && <span style={{ color: "var(--color-text-muted)" }}> → {fmt(u.move_out_date)}</span>}</div>
                )}
                {u.move_in_date && u.status !== "occupied" && (
                  <div><strong style={{ color: "var(--color-text)" }}>Move-in:</strong> {fmt(u.move_in_date)}</div>
                )}
                {u.move_out_date && u.status !== "occupied" && (
                  <div><strong style={{ color: "var(--color-text)" }}>Move-out:</strong> {fmt(u.move_out_date)}</div>
                )}
                {u.notice_date && (
                  <div><strong style={{ color: "var(--color-text)" }}>Notice:</strong> {fmt(u.notice_date)}</div>
                )}
                {u.maintenance_needed && (
                  <div><strong style={{ color: "var(--color-text)" }}>Maintenance:</strong> {u.maintenance_needed}</div>
                )}
                {u.notes && (
                  <div><strong style={{ color: "var(--color-text)" }}>Notes:</strong> {u.notes}</div>
                )}
                {(u.future_tenant || u.future_move_in_date) && (
                  <div
                    style={{
                      marginTop: "4px",
                      padding: "4px 8px",
                      background: "rgba(80,140,220,0.08)",
                      border: "1px solid rgba(80,140,220,0.25)",
                      borderRadius: "4px",
                      display: "inline-flex",
                      gap: "6px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "rgb(60,120,210)", fontSize: "1rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Future:</span>
                    {u.future_tenant && <span style={{ color: "var(--color-text)" }}>{u.future_tenant}</span>}
                    {u.future_move_in_date && <span style={{ color: "var(--color-text-muted)" }}>· moves in {fmt(u.future_move_in_date)}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
