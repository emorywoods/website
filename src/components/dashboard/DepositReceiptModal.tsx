"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { Unit } from "@/lib/units";
import { buildingByCode } from "@/lib/buildings";

interface DepositReceiptModalProps {
  unit: Unit;
  onClose: () => void;
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

function unitCode(building: string, apt: string): string {
  return building.replace(/\s+/g, "") + apt.replace(/\s+/g, "");
}

function defaultAdults(unitType: string): string {
  if (unitType === "Studio") return "1";
  if (unitType === "2BR") return "2";
  if (unitType === "3BR") return "3";
  return "1";
}

function parseMoney(val: string | null | undefined): number {
  if (!val) return 0;
  const n = parseFloat(val.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function fmtMoney(n: number): string {
  return n.toFixed(2);
}

function waterSewer(unitType: string, unitCondition: string): number {
  if (unitType === "Studio") return 25;
  if (unitType === "2BR") return unitCondition === "Renovated" ? 60 : 45;
  if (unitType === "3BR") return unitCondition === "Renovated" ? 80 : 60;
  return 0;
}

// Prorated rent for the partial first month: (days from move-in through end of month, inclusive) / days in month * monthly amount
function proratedFirstMonth(moveIn: Date, monthlyAmount: number): number {
  const daysInMonth = endOfMonth(moveIn).getUTCDate();
  const daysRemaining = daysInMonth - moveIn.getUTCDate() + 1;
  return (daysRemaining / daysInMonth) * monthlyAmount;
}

function parseUTCDate(val: string): Date | null {
  if (!val) return null;
  const d = new Date(val.slice(0, 10) + "T00:00:00Z");
  return isNaN(d.getTime()) ? null : d;
}

function fmtLong(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function fmtSlash(d: Date | null): string {
  if (!d) return "";
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${m}/${day}/${d.getUTCFullYear()}`;
}

// First day of the month following moveIn
function nextPaymentDate(moveIn: Date): Date {
  return new Date(Date.UTC(moveIn.getUTCFullYear(), moveIn.getUTCMonth() + 1, 1));
}

// Last day of the month containing `d`
function endOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
}

export default function DepositReceiptModal({ unit, onClose }: DepositReceiptModalProps) {
  const [applicantName, setApplicantName] = useState(unit.future_tenant || "");
  const [moveInDate, setMoveInDate] = useState(
    unit.future_move_in_date ? unit.future_move_in_date.slice(0, 10) : ""
  );
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [adults, setAdults] = useState(defaultAdults(unit.unit_type));
  const [children, setChildren] = useState("0");
  const [liabilityInsurance, setLiabilityInsurance] = useState(false);
  const [pet, setPet] = useState(false);
  const [generatingDeposit, setGeneratingDeposit] = useState(false);
  const [generatingWelcome, setGeneratingWelcome] = useState(false);
  const [error, setError] = useState("");

  const building = buildingByCode(unit.building);
  const unitNo = unitCode(unit.building, unit.apt_number);

  function computeAmounts() {
    const moveIn = parseUTCDate(moveInDate);
    const nextPay = moveIn ? nextPaymentDate(moveIn) : null;
    const dueThrough = nextPay ? endOfMonth(nextPay) : null;
    const rent = parseMoney(unit.rent);
    const deposit = parseMoney(securityDeposit);
    const petFee = pet ? 300 : 0;
    const ws = waterSewer(unit.unit_type, unit.unit_condition);
    const monthlyRent = rent + ws;
    const firstMonthRent = moveIn ? proratedFirstMonth(moveIn, monthlyRent) : 0;
    const balanceDue = firstMonthRent + petFee;
    return { moveIn, nextPay, dueThrough, deposit, petFee, monthlyRent, firstMonthRent, balanceDue };
  }

  async function doGenerateDeposit() {
    setGeneratingDeposit(true);
    setError("");
    const tab = window.open("", "_blank");
    try {
      const { moveIn, nextPay, dueThrough, deposit, petFee, monthlyRent, firstMonthRent, balanceDue } = computeAmounts();

      const otherLabels: string[] = [];
      if (liabilityInsurance) otherLabels.push("Liability to Landlord Insurance");
      if (pet) otherLabels.push("Pet Fee");

      const res = await fetch("/DepositReceipt.pdf");
      const bytes = await res.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const form = pdfDoc.getForm();

      function setField(name: string, value: string) {
        if (!value) return;
        try {
          form.getTextField(name).setText(value);
        } catch {
          // field missing/renamed — skip
        }
      }

      setField("untitled1", unitNo);
      setField("untitled2", applicantName);
      setField("untitled9", unit.apt_number);
      setField("untitled11", building?.address ?? "");
      setField("untitled12", adults);
      setField("untitled13", children);
      setField("untitled14", moveIn ? fmtLong(moveIn) : "");
      setField("untitled15", monthlyRent ? fmtMoney(monthlyRent) : "");
      setField("untitled29", monthlyRent ? fmtMoney(monthlyRent) : "");
      setField("untitled24", otherLabels.join(", "));
      setField("untitled27", nextPay ? fmtSlash(nextPay) : "");
      setField("untitled28", dueThrough ? fmtSlash(dueThrough) : "");
      setField("untitled17", moveIn ? fmtMoney(firstMonthRent) : "");
      setField("untitled23", moveIn ? fmtMoney(balanceDue) : "");
      if (petFee) setField("untitled20", fmtMoney(petFee));

      if (securityDeposit) {
        const depositStr = fmtMoney(deposit);
        setField("untitled7", depositStr);
        setField("untitled10", depositStr);
        setField("untitled16", depositStr);
        setField("untitled18", depositStr);
        setField("untitled22", depositStr);
      }

      const filled = await pdfDoc.save();
      const blob = new Blob([filled.slice().buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      else window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      tab?.close();
      setError("Failed to generate deposit receipt.");
    } finally {
      setGeneratingDeposit(false);
    }
  }

  async function doGenerateWelcome() {
    setGeneratingWelcome(true);
    setError("");
    const tab = window.open("", "_blank");
    try {
      const { moveIn, firstMonthRent } = computeAmounts();

      const wlFile = unit.unit_type === "Studio" ? "/WelcomeLetterStudio.pdf" : "/WelcomeLetter.pdf";
      const [wlRes, fontRes] = await Promise.all([
        fetch(wlFile),
        fetch("/fonts/Gelasio-Bold.ttf"),
      ]);
      const wlBytes = await wlRes.arrayBuffer();
      const fontBytes = await fontRes.arrayBuffer();

      const wlDoc = await PDFDocument.load(wlBytes);
      wlDoc.registerFontkit(fontkit);
      const gelasioBold = await wlDoc.embedFont(fontBytes);
      const wlForm = wlDoc.getForm();

      function setWlField(name: string, value: string) {
        if (!value) return;
        try {
          const field = wlForm.getTextField(name);
          field.setText(value);
          field.updateAppearances(gelasioBold);
        } catch {
          // field missing/renamed — skip
        }
      }

      setWlField("street_address", building?.address ?? "");
      setWlField("apt_number", `#${unit.apt_number}`);
      setWlField("move_in_date", moveIn ? fmtSlash(moveIn) : "");
      setWlField("rent_amount", moveIn ? `$${fmtMoney(firstMonthRent)}` : "");

      const wlFilled = await wlDoc.save();
      const wlBlob = new Blob([wlFilled.slice().buffer], { type: "application/pdf" });
      const wlUrl = URL.createObjectURL(wlBlob);
      if (tab) tab.location.href = wlUrl;
      else window.open(wlUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(wlUrl), 60_000);
    } catch {
      tab?.close();
      setError("Failed to generate welcome letter.");
    } finally {
      setGeneratingWelcome(false);
    }
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
          maxWidth: "520px",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-text)", fontSize: "1.2rem", fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
            Welcome Letter &amp; Deposit Receipt
          </h2>
          <span style={{ color: "var(--color-text-muted)", fontSize: "0.94rem" }}>Unit {unitCode(unit.building, unit.apt_number)}</span>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>Applicant Full Name</label>
          <input style={inputStyle} placeholder="Full name" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} />
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>Move-In Date</label>
          <input type="date" style={inputStyle} value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <div>
            <label style={labelStyle}>Adults</label>
            <input type="number" min="0" style={inputStyle} value={adults} onChange={(e) => setAdults(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Children</label>
            <input type="number" min="0" style={inputStyle} value={children} onChange={(e) => setChildren(e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Security Deposit ($)</label>
          <input style={inputStyle} placeholder="300" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--color-text)", fontSize: "0.97rem", cursor: "pointer" }}>
            <input type="checkbox" checked={liabilityInsurance} onChange={(e) => setLiabilityInsurance(e.target.checked)} />
            Liability to Landlord Insurance
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--color-text)", fontSize: "0.97rem", cursor: "pointer" }}>
            <input type="checkbox" checked={pet} onChange={(e) => setPet(e.target.checked)} />
            Pet
          </label>
        </div>

        {error && <p style={{ color: "#e05c5c", fontSize: "1rem", marginBottom: "12px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            onClick={doGenerateDeposit}
            disabled={generatingDeposit}
            style={{
              flex: 1, background: "var(--color-accent)", border: "none", borderRadius: "6px",
              padding: "11px", color: "#0D1A12", fontFamily: "var(--font-body)", fontSize: "1rem",
              fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
              cursor: generatingDeposit ? "not-allowed" : "pointer", opacity: generatingDeposit ? 0.7 : 1,
            }}
          >
            {generatingDeposit ? "Generating..." : "Deposit Receipt"}
          </button>
          <button
            onClick={doGenerateWelcome}
            disabled={generatingWelcome}
            style={{
              flex: 1, background: "var(--color-accent)", border: "none", borderRadius: "6px",
              padding: "11px", color: "#0D1A12", fontFamily: "var(--font-body)", fontSize: "1rem",
              fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
              cursor: generatingWelcome ? "not-allowed" : "pointer", opacity: generatingWelcome ? 0.7 : 1,
            }}
          >
            {generatingWelcome ? "Generating..." : "Welcome Letter"}
          </button>
        </div>

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
