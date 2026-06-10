"use client";

import { useState } from "react";
import type { CarportSpace, CarportAssignedTo } from "@/lib/carportSpaces";
import type { Unit } from "@/lib/units";
import { carportByCode } from "@/lib/carports";
import { buildingByCode } from "@/lib/buildings";

interface CarportModalProps {
  buildingCode: string;
  spaces: CarportSpace[];
  units: Unit[];
  accessCode: string;
  onSaved: () => void;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  padding: "8px 11px",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "0.9rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const ghostBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--color-border)",
  borderRadius: "5px",
  padding: "5px 10px",
  color: "var(--color-text-muted)",
  fontFamily: "var(--font-body)",
  fontSize: "0.86rem",
  letterSpacing: "0.05em",
  cursor: "pointer",
};

function fmt(date: string | null): string {
  if (!date) return "";
  return date.slice(0, 10);
}

interface SpaceRowProps {
  space: CarportSpace;
  units: Unit[];
  accessCode: string;
  onSaved: () => void;
}

const ASSIGNMENT_OPTS: { value: CarportAssignedTo; label: string }[] = [
  { value: null,       label: "— Available —" },
  { value: "tenant",   label: "Tenant" },
  { value: "office",   label: "Office" },
  { value: "shop",     label: "Shop" },
  { value: "external", label: "External" },
];

const BADGE: Record<NonNullable<CarportAssignedTo> | "available", { bg: string; color: string; border: string; label: string }> = {
  available: { bg: "rgba(42,74,53,0.3)",   color: "var(--color-text-muted)",  border: "var(--color-border)",        label: "Available" },
  tenant:    { bg: "rgba(80,50,140,0.2)",   color: "rgba(160,120,255,1)",      border: "rgba(80,50,140,0.5)",        label: "Tenant"    },
  office:    { bg: "rgba(40,100,180,0.15)", color: "rgb(80,150,230)",          border: "rgba(40,100,180,0.4)",       label: "Office"    },
  shop:      { bg: "rgba(180,100,30,0.15)", color: "rgb(220,140,60)",          border: "rgba(180,100,30,0.4)",       label: "Shop"      },
  external:  { bg: "rgba(20,140,120,0.15)", color: "rgb(40,190,160)",          border: "rgba(20,140,120,0.4)",       label: "External"  },
};

function SpaceRow({ space, units, accessCode, onSaved }: SpaceRowProps) {
  const [editing, setEditing] = useState(false);
  const [assignedTo, setAssignedTo] = useState<CarportAssignedTo>(space.assigned_to);
  const [unitId, setUnitId] = useState<string>(space.unit_id ? String(space.unit_id) : "");
  const [rentalDate, setRentalDate] = useState(fmt(space.rental_date));
  const [rate, setRate] = useState(space.rate);
  const [externalName, setExternalName] = useState(space.external_name ?? "");
  const [externalPhone, setExternalPhone] = useState(space.external_phone ?? "");
  const [notes, setNotes] = useState(space.notes ?? "");
  const [saving, setSaving] = useState(false);

  const isTenant = assignedTo === "tenant";
  const isExternal = assignedTo === "external";
  const selectedUnit = isTenant && unitId ? units.find((u) => u.id === Number(unitId)) : null;
  const previewAddress = selectedUnit ? (buildingByCode(selectedUnit.building)?.address ?? selectedUnit.building) : "";
  const badgeKey = (space.assigned_to ?? "available") as NonNullable<CarportAssignedTo> | "available";
  const badge = BADGE[badgeKey];

  function resetForm() {
    setAssignedTo(space.assigned_to);
    setUnitId(space.unit_id ? String(space.unit_id) : "");
    setRentalDate(fmt(space.rental_date));
    setRate(space.rate);
    setExternalName(space.external_name ?? "");
    setExternalPhone(space.external_phone ?? "");
    setNotes(space.notes ?? "");
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { assigned_to: assignedTo, notes };
      if (assignedTo === "tenant") {
        body.unit_id = unitId ? Number(unitId) : null;
        body.rental_date = rentalDate || null;
        body.rate = rate;
        body.external_name = "";
        body.external_phone = "";
      } else if (assignedTo === "external") {
        body.unit_id = null;
        body.rental_date = rentalDate || null;
        body.rate = rate;
        body.external_name = externalName;
        body.external_phone = externalPhone;
      } else {
        // office/shop/available — clear all person fields
        body.unit_id = null;
        body.rental_date = null;
        body.rate = "";
        body.external_name = "";
        body.external_phone = "";
      }
      await fetch(`/api/carports?id=${space.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-access-code": accessCode },
        body: JSON.stringify(body),
      });
      onSaved();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function unassign() {
    setSaving(true);
    try {
      await fetch(`/api/carports?id=${space.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-access-code": accessCode },
        body: JSON.stringify({ assigned_to: null, unit_id: null, rental_date: null, rate: "", external_name: "", external_phone: "" }),
      });
      setAssignedTo(null);
      setUnitId("");
      setRentalDate("");
      setRate("");
      setExternalName("");
      setExternalPhone("");
      onSaved();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const isAssigned = !!space.assigned_to;

  return (
    <div style={{ border: "1px solid var(--color-border)", borderRadius: "8px", padding: "12px 14px", background: "var(--color-bg)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: editing ? "10px" : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ color: "rgba(80,50,140,1)", fontWeight: 700, fontSize: "1rem" }}>
            {space.space_number}
          </span>
          <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.76rem", letterSpacing: "0.08em", textTransform: "uppercase", background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
            {badge.label}
          </span>
          {space.assigned_to === "tenant" && space.tenant_name && (
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              {space.tenant_name} · {space.tenant_unit}
            </span>
          )}
          {space.assigned_to === "tenant" && space.rate && (
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{space.rate}</span>
          )}
          {space.assigned_to === "external" && space.external_name && (
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              {space.external_name}{space.external_phone ? ` · ${space.external_phone}` : ""}
            </span>
          )}
          {space.assigned_to === "external" && space.rate && (
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{space.rate}</span>
          )}
          {space.notes && (
            <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
              {space.notes}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          {!editing && (
            <button onClick={() => setEditing(true)} style={ghostBtn}>
              {isAssigned ? "Edit" : "Assign"}
            </button>
          )}
          {isAssigned && !editing && (
            <button onClick={unassign} disabled={saving} style={{ ...ghostBtn, color: "#e05c5c", borderColor: "#e05c5c" }}>
              Unassign
            </button>
          )}
        </div>
      </div>

      {editing && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Assignment type */}
          <div>
            <label style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "3px" }}>
              Assign To
            </label>
            <div style={{ display: "flex", gap: "6px" }}>
              {ASSIGNMENT_OPTS.filter((o) => o.value !== null).map((o) => (
                <button
                  key={o.value}
                  onClick={() => {
                    setAssignedTo(o.value);
                    if (o.value !== "tenant") { setUnitId(""); }
                    if (o.value !== "tenant" && o.value !== "external") { setRentalDate(""); setRate(""); }
                    if (o.value !== "external") { setExternalName(""); setExternalPhone(""); }
                  }}
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    borderRadius: "6px",
                    border: `1px solid ${assignedTo === o.value ? BADGE[o.value as NonNullable<CarportAssignedTo>].border : "var(--color-border)"}`,
                    background: assignedTo === o.value ? BADGE[o.value as NonNullable<CarportAssignedTo>].bg : "transparent",
                    color: assignedTo === o.value ? BADGE[o.value as NonNullable<CarportAssignedTo>].color : "var(--color-text-muted)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    fontWeight: assignedTo === o.value ? 600 : 400,
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tenant-only fields */}
          {isTenant && (
            <>
              <div>
                <label style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "3px" }}>
                  Tenant Unit
                </label>
                <select value={unitId} onChange={(e) => setUnitId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">— Select unit —</option>
                  {units
                    .filter((u) => u.status === "occupied" || u.status === "notice")
                    .sort((a, b) => a.building.localeCompare(b.building) || a.apt_number.localeCompare(b.apt_number))
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.building} {u.apt_number}{u.tenant_name ? ` — ${u.tenant_name}` : ""}
                      </option>
                    ))}
                </select>
              </div>
              {selectedUnit && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "3px" }}>Tenant Name (auto)</label>
                    <div style={{ ...inputStyle, color: "var(--color-text-muted)", background: "rgba(42,74,53,0.15)" }}>{selectedUnit.tenant_name || "—"}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "3px" }}>Tenant Address (auto)</label>
                    <div style={{ ...inputStyle, color: "var(--color-text-muted)", background: "rgba(42,74,53,0.15)" }}>{previewAddress || "—"}</div>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "3px" }}>Rental Date</label>
                  <input type="date" value={rentalDate} onChange={(e) => setRentalDate(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "3px" }}>Rate</label>
                  <input type="text" placeholder="e.g. $50/mo" value={rate} onChange={(e) => setRate(e.target.value)} style={inputStyle} />
                </div>
              </div>
            </>
          )}

          {/* External-only fields */}
          {isExternal && (
            <>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "3px" }}>Name</label>
                  <input type="text" placeholder="Person or company name" value={externalName} onChange={(e) => setExternalName(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "3px" }}>Phone</label>
                  <input type="text" placeholder="e.g. (404) 555-0100" value={externalPhone} onChange={(e) => setExternalPhone(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "3px" }}>Rental Date</label>
                  <input type="date" value={rentalDate} onChange={(e) => setRentalDate(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "3px" }}>Rate</label>
                  <input type="text" placeholder="e.g. $50/mo" value={rate} onChange={(e) => setRate(e.target.value)} style={inputStyle} />
                </div>
              </div>
            </>
          )}

          {/* Notes — always visible in edit mode */}
          <div>
            <label style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "3px" }}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button onClick={resetForm} style={ghostBtn}>Cancel</button>
            <button
              onClick={save}
              disabled={saving}
              style={{ background: "rgba(80,50,140,0.2)", border: "1px solid rgba(80,50,140,0.6)", borderRadius: "5px", padding: "5px 14px", color: "rgba(160,120,255,1)", fontFamily: "var(--font-body)", fontSize: "0.86rem", letterSpacing: "0.08em", cursor: "pointer" }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Derive location group prefix: "CP-524CC-A" → "CP-524CC"
function locationGroup(code: string): string {
  return code.replace(/-[AB]$/, "");
}

// Human-readable location label from prefix: "CP-524CC" → "524CC"
function locationLabel(prefix: string): string {
  return prefix.replace(/^CP-/, "");
}

export default function CarportModal({ buildingCode, spaces, units, accessCode, onSaved, onClose }: CarportModalProps) {
  const prefix = locationGroup(buildingCode);

  const groupSpaces = spaces.filter((s) => locationGroup(s.building) === prefix);
  const available = groupSpaces.filter((s) => !s.assigned_to).length;
  const leased = groupSpaces.filter((s) => !!s.assigned_to).length;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "rgba(160,120,255,1)", letterSpacing: "0.06em" }}>
              Carport Area — {locationLabel(prefix)}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
              {available} available · {leased} leased · {groupSpaces.length} total spaces
            </div>
          </div>
          <button onClick={onClose} style={{ ...ghostBtn, fontSize: "1rem", padding: "4px 10px" }}>✕</button>
        </div>

        {/* All spaces flat — sorted by space number */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {groupSpaces.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "20px" }}>No spaces.</p>
          ) : (
            [...groupSpaces]
              .sort((a, b) => Number(a.space_number) - Number(b.space_number))
              .map((space) => (
                <SpaceRow key={space.id} space={space} units={units} accessCode={accessCode} onSaved={onSaved} />
              ))
          )}
        </div>
      </div>
    </div>
  );
}
