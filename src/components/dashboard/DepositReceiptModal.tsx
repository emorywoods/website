"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { Unit } from "@/lib/units";
import { buildingByCode } from "@/lib/buildings";

type DocType = "welcome" | "deposit" | "policy" | "insurance" | "brochure";

interface DepositReceiptModalProps {
  unit?: Unit;
  onClose: () => void;
  onlyDoc?: DocType;
}

const docLabels: Record<DocType, string> = {
  welcome: "Welcome Letter",
  deposit: "Deposit Receipt",
  policy: "Policy Letter",
  insurance: "Renters Insurance",
  brochure: "Brochure Pricing",
};

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

// True if move-in falls within the last 3 days of the month (daysRemaining < 4) — rolls into next month's rent
function rollsToNextMonth(moveIn: Date): boolean {
  const daysInMonth = endOfMonth(moveIn).getUTCDate();
  const daysRemaining = daysInMonth - moveIn.getUTCDate() + 1;
  return daysRemaining < 4;
}

// Prorated rent for the partial first month: (days from move-in through end of month, inclusive) / days in month * monthly amount
// If move-in rolls to next month, add that next month's full rent too
function proratedFirstMonth(moveIn: Date, monthlyAmount: number): number {
  const daysInMonth = endOfMonth(moveIn).getUTCDate();
  const daysRemaining = daysInMonth - moveIn.getUTCDate() + 1;
  const prorated = (daysRemaining / daysInMonth) * monthlyAmount;
  return rollsToNextMonth(moveIn) ? prorated + monthlyAmount : prorated;
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

// First day of the month following moveIn (skips an extra month if moveIn already rolled into it)
function nextPaymentDate(moveIn: Date): Date {
  const extra = rollsToNextMonth(moveIn) ? 1 : 0;
  return new Date(Date.UTC(moveIn.getUTCFullYear(), moveIn.getUTCMonth() + 1 + extra, 1));
}

// Last day of the month containing `d`
function endOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
}

const defaultPrices = {
  studioBase: "890", studioWs: "25",
  twoClassicBase: "1225", twoClassicWs: "45",
  twoRenovBase: "1750", twoRenovWs: "60",
  threeClassicBase: "1400", threeClassicWs: "60",
  threeRenovBase: "2250", threeRenovWs: "80",
};

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export default function DepositReceiptModal({ unit, onClose, onlyDoc }: DepositReceiptModalProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocType>(onlyDoc ?? "deposit");
  const [applicantName, setApplicantName] = useState(unit?.future_tenant || "");
  const [moveInDate, setMoveInDate] = useState(
    unit?.future_move_in_date ? unit.future_move_in_date.slice(0, 10) : ""
  );
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [adults, setAdults] = useState(defaultAdults(unit?.unit_type ?? ""));
  const [children, setChildren] = useState("0");
  const [liabilityInsurance, setLiabilityInsurance] = useState(false);
  const [pet, setPet] = useState(false);
  const [prices, setPrices] = useState(defaultPrices);
  const [generatingDeposit, setGeneratingDeposit] = useState(false);
  const [generatingWelcome, setGeneratingWelcome] = useState(false);
  const [generatingPolicy, setGeneratingPolicy] = useState(false);
  const [generatingInsurance, setGeneratingInsurance] = useState(false);
  const [generatingBrochure, setGeneratingBrochure] = useState(false);
  const [error, setError] = useState("");

  const building = unit ? buildingByCode(unit.building) : null;
  const unitNo = unit ? unitCode(unit.building, unit.apt_number) : "";
  const fullAddress = unit && building ? `${building.address} #${unit.apt_number}` : "";

  function computeAmounts() {
    const moveIn = parseUTCDate(moveInDate);
    const nextPay = moveIn ? nextPaymentDate(moveIn) : null;
    const dueThrough = nextPay ? endOfMonth(nextPay) : null;
    const rent = parseMoney(unit?.rent);
    const deposit = parseMoney(securityDeposit);
    const petFee = pet ? 300 : 0;
    const ws = unit ? waterSewer(unit.unit_type, unit.unit_condition) : 0;
    const monthlyRent = rent + ws;
    const firstMonthRent = moveIn ? proratedFirstMonth(moveIn, monthlyRent) : 0;
    const balanceDue = firstMonthRent + petFee;
    return { moveIn, nextPay, dueThrough, deposit, petFee, monthlyRent, firstMonthRent, balanceDue };
  }

  async function doGenerateDeposit() {
    if (!unit) return;
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

      function setField(name: string, value: string, fontSize?: number) {
        if (!value) return;
        try {
          const field = form.getTextField(name);
          if (fontSize) field.setFontSize(fontSize);
          field.setText(value);
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
      setField("untitled24", otherLabels.join(", "), 6);
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
    if (!unit) return;
    setGeneratingWelcome(true);
    setError("");
    const tab = window.open("", "_blank");
    try {
      const { moveIn, balanceDue } = computeAmounts();

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
      setWlField("rent_amount", moveIn ? `$${fmtMoney(balanceDue)}` : "");

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

  async function doGeneratePolicy() {
    setGeneratingPolicy(true);
    setError("");
    const tab = window.open("", "_blank");
    try {
      const { moveIn } = computeAmounts();

      const res = await fetch("/PolicyLetter.pdf");
      const bytes = await res.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const page = pdfDoc.getPages()[0];

      page.drawText(moveIn ? fmtSlash(moveIn) : "", { x: 96, y: 623, size: 11, font });
      page.drawText(applicantName, { x: 109, y: 611.5, size: 11, font });
      page.drawText(fullAddress, { x: 111, y: 600, size: 11, font });

      const filled = await pdfDoc.save();
      const blob = new Blob([filled.slice().buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      else window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      tab?.close();
      setError("Failed to generate policy letter.");
    } finally {
      setGeneratingPolicy(false);
    }
  }

  async function doGenerateInsurance() {
    setGeneratingInsurance(true);
    setError("");
    const tab = window.open("", "_blank");
    try {
      const { moveIn } = computeAmounts();

      const res = await fetch("/RentersInsurance.pdf");
      const bytes = await res.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const page = pdfDoc.getPages()[0];

      const dateStr = moveIn ? fmtSlash(moveIn) : "";
      page.drawText(dateStr, { x: 307, y: 641.5, size: 11, font });
      page.drawText(applicantName, { x: 307, y: 630, size: 11, font });
      page.drawText(fullAddress, { x: 307, y: 618.5, size: 11, font });

      const filled = await pdfDoc.save();
      const blob = new Blob([filled.slice().buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      else window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      tab?.close();
      setError("Failed to generate renters insurance addendum.");
    } finally {
      setGeneratingInsurance(false);
    }
  }

  async function doGenerateBrochure() {
    setGeneratingBrochure(true);
    setError("");
    const tab = window.open("", "_blank");
    try {
      const res = await fetch("/Emory%20Woods%20brochure%20design.pdf");
      const bytes = await res.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.getPages()[1];
      const { height } = page.getSize();
      const color = rgb(0.078, 0.075, 0.067);
      const white = rgb(1, 1, 1);
      const SIZE = 9.5;

      function drawRow(xStart: number, topAnchor: number, rightEdge: number, text: string) {
        const y = height - topAnchor - SIZE;
        page.drawRectangle({ x: xStart - 1, y: y - 1.5, width: rightEdge - xStart + 2, height: SIZE + 3, color: white });
        page.drawText(text, { x: xStart, y, size: SIZE, font, color });
      }

      const studioBase = fmtInt(parseMoney(prices.studioBase));
      const twoClassicBase = fmtInt(parseMoney(prices.twoClassicBase));
      const twoClassicWs = fmtInt(parseMoney(prices.twoClassicWs));
      const twoRenovBase = fmtInt(parseMoney(prices.twoRenovBase));
      const twoRenovWs = fmtInt(parseMoney(prices.twoRenovWs));
      const threeClassicBase = fmtInt(parseMoney(prices.threeClassicBase));
      const threeClassicWs = fmtInt(parseMoney(prices.threeClassicWs));
      const threeRenovBase = fmtInt(parseMoney(prices.threeRenovBase));
      const threeRenovWs = fmtInt(parseMoney(prices.threeRenovWs));

      drawRow(49.9, 525.9, 120, `From $${studioBase} /mo`);
      drawRow(307.1, 281.8, 470, `$${twoClassicBase} base rent + $${twoClassicWs} water/sewer`);
      drawRow(307.1, 543.4, 470, `From $${twoRenovBase}/mo + $${twoRenovWs} water/sewer`);
      drawRow(564.3, 279.6, 728, `$${threeClassicBase} base rent + $${threeClassicWs} water/sewer`);
      drawRow(564.3, 541.9, 728, `$${threeRenovBase} base rent + $${threeRenovWs} water/sewer`);

      const filled = await pdfDoc.save();
      const blob = new Blob([filled.slice().buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      else window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      tab?.close();
      setError("Failed to generate brochure.");
    } finally {
      setGeneratingBrochure(false);
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
            {onlyDoc ? docLabels[onlyDoc] : docLabels[selectedDoc]}
          </h2>
          {unit && <span style={{ color: "var(--color-text-muted)", fontSize: "0.94rem" }}>Unit {unitCode(unit.building, unit.apt_number)}</span>}
        </div>

        {(onlyDoc ?? selectedDoc) !== "brochure" && (
          <>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Applicant Full Name</label>
              <input style={inputStyle} placeholder="Full name" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Move-In Date</label>
              <input type="date" style={inputStyle} value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} />
            </div>
          </>
        )}

        {(onlyDoc ?? selectedDoc) === "brochure" && (
          <div style={{ marginBottom: "18px" }}>
            {[
              { label: "Studio", baseKey: "studioBase", wsKey: "studioWs" },
              { label: "2-Bedroom Classic", baseKey: "twoClassicBase", wsKey: "twoClassicWs" },
              { label: "2-Bedroom Renovated", baseKey: "twoRenovBase", wsKey: "twoRenovWs" },
              { label: "3-Bedroom Classic", baseKey: "threeClassicBase", wsKey: "threeClassicWs" },
              { label: "3-Bedroom Renovated", baseKey: "threeRenovBase", wsKey: "threeRenovWs" },
            ].map(({ label, baseKey, wsKey }) => (
              <div key={baseKey} style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>{label}</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <input
                      type="number"
                      min="0"
                      style={inputStyle}
                      placeholder="Base rent"
                      value={prices[baseKey as keyof typeof prices]}
                      onChange={(e) => setPrices((p) => ({ ...p, [baseKey]: e.target.value }))}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      style={inputStyle}
                      placeholder="Water/sewer"
                      value={prices[wsKey as keyof typeof prices]}
                      onChange={(e) => setPrices((p) => ({ ...p, [wsKey]: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {onlyDoc === undefined && (
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Document Type</label>
            <select
              style={selectStyle}
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value as DocType)}
            >
              {(Object.keys(docLabels) as DocType[]).map((d) => (
                <option key={d} value={d}>{docLabels[d]}</option>
              ))}
            </select>
          </div>
        )}

        {((onlyDoc ?? selectedDoc) === "deposit" || (onlyDoc ?? selectedDoc) === "welcome") && (
          <>
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
          </>
        )}

        {error && <p style={{ color: "#e05c5c", fontSize: "1rem", marginBottom: "12px" }}>{error}</p>}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
          {(onlyDoc ?? selectedDoc) === "deposit" && (
            <button
              onClick={doGenerateDeposit}
              disabled={generatingDeposit}
              style={{
                flex: "1 1 45%", background: "var(--color-accent)", border: "none", borderRadius: "6px",
                padding: "11px", color: "#0D1A12", fontFamily: "var(--font-body)", fontSize: "1rem",
                fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: generatingDeposit ? "not-allowed" : "pointer", opacity: generatingDeposit ? 0.7 : 1,
              }}
            >
              {generatingDeposit ? "Generating..." : "Deposit Receipt"}
            </button>
          )}
          {(onlyDoc ?? selectedDoc) === "welcome" && (
            <button
              onClick={doGenerateWelcome}
              disabled={generatingWelcome}
              style={{
                flex: "1 1 45%", background: "var(--color-accent)", border: "none", borderRadius: "6px",
                padding: "11px", color: "#0D1A12", fontFamily: "var(--font-body)", fontSize: "1rem",
                fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: generatingWelcome ? "not-allowed" : "pointer", opacity: generatingWelcome ? 0.7 : 1,
              }}
            >
              {generatingWelcome ? "Generating..." : "Welcome Letter"}
            </button>
          )}
          {(onlyDoc ?? selectedDoc) === "policy" && (
            <button
              onClick={doGeneratePolicy}
              disabled={generatingPolicy}
              style={{
                flex: "1 1 45%", background: "var(--color-accent)", border: "none", borderRadius: "6px",
                padding: "11px", color: "#0D1A12", fontFamily: "var(--font-body)", fontSize: "1rem",
                fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: generatingPolicy ? "not-allowed" : "pointer", opacity: generatingPolicy ? 0.7 : 1,
              }}
            >
              {generatingPolicy ? "Generating..." : "Policy Letter"}
            </button>
          )}
          {(onlyDoc ?? selectedDoc) === "insurance" && (
            <button
              onClick={doGenerateInsurance}
              disabled={generatingInsurance}
              style={{
                flex: "1 1 45%", background: "var(--color-accent)", border: "none", borderRadius: "6px",
                padding: "11px", color: "#0D1A12", fontFamily: "var(--font-body)", fontSize: "1rem",
                fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: generatingInsurance ? "not-allowed" : "pointer", opacity: generatingInsurance ? 0.7 : 1,
              }}
            >
              {generatingInsurance ? "Generating..." : "Renters Insurance"}
            </button>
          )}
          {(onlyDoc ?? selectedDoc) === "brochure" && (
            <button
              onClick={doGenerateBrochure}
              disabled={generatingBrochure}
              style={{
                flex: "1 1 45%", background: "var(--color-accent)", border: "none", borderRadius: "6px",
                padding: "11px", color: "#0D1A12", fontFamily: "var(--font-body)", fontSize: "1rem",
                fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: generatingBrochure ? "not-allowed" : "pointer", opacity: generatingBrochure ? 0.7 : 1,
              }}
            >
              {generatingBrochure ? "Generating..." : "Generate Brochure"}
            </button>
          )}
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
