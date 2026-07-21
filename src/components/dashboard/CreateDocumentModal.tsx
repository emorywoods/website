"use client";

import { useMemo, useState } from "react";
import type { Unit } from "@/lib/units";
import DepositReceiptModal from "./DepositReceiptModal";

interface CreateDocumentModalProps {
  units: Unit[];
  onClose: () => void;
}

type DocType = "welcome" | "deposit" | "policy" | "insurance";

function unitCode(building: string, apt: string): string {
  return building.replace(/\s+/g, "") + apt.replace(/\s+/g, "");
}

const selectStyle: React.CSSProperties = {
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
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "1rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  marginBottom: "5px",
};

export default function CreateDocumentModal({ units, onClose }: CreateDocumentModalProps) {
  const [docType, setDocType] = useState<DocType | "">("");
  const [unitKey, setUnitKey] = useState("");

  const { withFutureTenant, others } = useMemo(() => {
    const withFutureTenant: Unit[] = [];
    const others: Unit[] = [];
    for (const u of units) {
      if (u.future_tenant && u.future_tenant.trim()) withFutureTenant.push(u);
      else others.push(u);
    }
    const byCode = (a: Unit, b: Unit) => unitCode(a.building, a.apt_number).localeCompare(unitCode(b.building, b.apt_number));
    withFutureTenant.sort(byCode);
    others.sort(byCode);
    return { withFutureTenant, others };
  }, [units]);

  const selectedUnit = units.find((u) => unitCode(u.building, u.apt_number) === unitKey) ?? null;

  if (docType && selectedUnit) {
    return (
      <DepositReceiptModal
        unit={selectedUnit}
        onlyDoc={docType}
        onClose={onClose}
      />
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 110,
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "28px 24px",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-text)", fontSize: "1.2rem", fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 20px" }}>
          Create Document
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Document Type</label>
          <select
            style={selectStyle}
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType | "")}
          >
            <option value="">Select document…</option>
            <option value="welcome">Welcome Letter</option>
            <option value="deposit">Deposit Receipt</option>
            <option value="policy">Policy Letter</option>
            <option value="insurance">Renters Insurance</option>
          </select>
        </div>

        {docType && (
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Apartment</label>
            <select
              style={selectStyle}
              value={unitKey}
              onChange={(e) => setUnitKey(e.target.value)}
            >
              <option value="">Select apartment…</option>
              {withFutureTenant.length > 0 && (
                <optgroup label="Future Tenant">
                  {withFutureTenant.map((u) => (
                    <option key={unitCode(u.building, u.apt_number)} value={unitCode(u.building, u.apt_number)}>
                      {unitCode(u.building, u.apt_number)} — {u.future_tenant}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="All Apartments">
                {others.map((u) => (
                  <option key={unitCode(u.building, u.apt_number)} value={unitCode(u.building, u.apt_number)}>
                    {unitCode(u.building, u.apt_number)}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: "100%", background: "transparent", border: "1px solid var(--color-border)",
            borderRadius: "6px", padding: "11px", color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)", fontSize: "1rem", letterSpacing: "0.08em",
            textTransform: "uppercase", cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
