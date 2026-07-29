"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Unit } from "@/lib/units";

interface ExportPDFProps {
  units: Unit[];
}

function fmt(date: string | null): string {
  if (!date) return "";
  const d = new Date(date.slice(0, 10) + "T00:00:00Z");
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const y = d.getUTCFullYear();
  return `${m}/${day}/${y}`;
}

function unitCode(building: string, apt: string): string {
  return building.replace(/\s+/g, "") + apt.replace(/\s+/g, "");
}

function lastName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

const ROWS_PER_PAGE = 32;

function buildRows(rows: Unit[], isVacant: boolean, targetRows: number): string {
  function cb(checked: boolean): string {
    return checked
      ? `<td style="text-align:center;border-right:1px solid #f0ebe0;padding:2px 3px;background:rgba(26,58,37,0.08);">&#10003;</td>`
      : `<td style="text-align:center;border-right:1px solid #f0ebe0;padding:2px 3px;"></td>`;
  }

  const realRows = rows.map((u, i) => {
    const hasFuture = !!(u.future_tenant || u.future_move_in_date);
    const bg = i % 2 === 0 ? "#ffffff" : "#f7f3ec";
    const rowStyle = `background:${bg};border-left:3px solid ${hasFuture && isVacant ? "#c9a84c" : isVacant ? "#e05c5c" : "#9bbfa8"};`;
    const items = (u.maintenance_needed || "").split(",").map((s: string) => s.trim()).filter(Boolean);
    const maintCells = isVacant
      ? [
          cb(items.includes("Paint")),
          cb(items.includes("Maintenance")),
          cb(items.includes("Cleaning")),
          cb(items.includes("Flooring")),
          cb(!!u.maintenance_done),
          cb(!!u.lock_change_needed),
          cb(!!u.ready_for_tour),
        ].join("")
      : "";
    return `
    <tr style="${rowStyle}">
      <td style="font-weight:600;letter-spacing:0.02em;">${unitCode(u.building, u.apt_number)}</td>
      <td>${u.unit_type === "Studio" ? "Eff" : u.unit_type || ""}</td>
      <td>${u.rent || ""}</td>
      ${isVacant
        ? `<td>${u.future_tenant ? lastName(u.future_tenant) : ""}</td>
           <td>${u.future_move_in_date ? fmt(u.future_move_in_date) : ""}</td>`
        : `<td>${u.move_out_date ? fmt(u.move_out_date) : ""}</td>
           <td>${u.tenant_name ? lastName(u.tenant_name) : ""}</td>
           <td>${u.future_tenant ? lastName(u.future_tenant) : ""}</td>
           <td>${u.future_move_in_date ? fmt(u.future_move_in_date) : ""}</td>`
      }
      ${maintCells}
    </tr>
  `;
  });

  const colCount = isVacant ? 12 : 6;
  const fillerCount = Math.max(0, targetRows - rows.length);
  const fillerRows = Array.from({ length: fillerCount }, (_, j) => {
    const i = rows.length + j;
    const bg = i % 2 === 0 ? "#ffffff" : "#f7f3ec";
    const rowStyle = `background:${bg};border-left:3px solid ${isVacant ? "#e05c5c" : "#9bbfa8"};opacity:0.35;`;
    return `<tr style="${rowStyle}">${`<td>&nbsp;</td>`.repeat(colCount)}</tr>`;
  });

  return realRows.join("") + fillerRows.join("");
}

function buildReportHtml(vacants: Unit[], notices: Unit[], today: string): string {
  const targetRows = Math.max(ROWS_PER_PAGE, vacants.length, notices.length);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Emory Woods — Leasing Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body { font-family: Arial, sans-serif; color: #111; padding: 14px; font-size: 15px; display: flex; flex-direction: column; overflow: hidden; }
    header { margin-bottom: 10px; display: flex; align-items: baseline; gap: 14px; flex: 0 0 auto; }
    header h1 { font-size: 20px; letter-spacing: 0.08em; text-transform: uppercase; color: #1a3a25; }
    header p { color: #777; font-size: 13px; letter-spacing: 0.04em; }
    .two-col { display: flex; gap: 14px; align-items: stretch; flex: 1 1 auto; min-height: 0; }
    .two-col section { flex: 1; min-width: 0; margin-bottom: 0; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
    section h2 {
      font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase;
      color: #888; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-bottom: 5px;
    }
    table { width: 100%; height: 100%; border-collapse: collapse; border: 1px solid #ddd; table-layout: fixed; }
    thead tr { background: #f5f0e8; }
    th {
      text-align: left; padding: 5px 6px; font-size: 11px;
      letter-spacing: 0.07em; text-transform: uppercase; color: #555;
      border-bottom: 2px solid #c9a84c; border-right: 1px solid #e0d8c8; white-space: nowrap;
    }
    th:last-child { border-right: none; }
    td { padding: 2px 6px; border-bottom: 1px solid #eee; border-right: 1px solid #f0ebe0; vertical-align: middle; font-size: 13px; line-height: 1.15; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    td:last-child { border-right: none; }
    tr:last-child td { border-bottom: none; }
    footer { margin-top: 10px; font-size: 12px; color: #bbb; text-align: right; letter-spacing: 0.04em; flex: 0 0 auto; }
    @page { margin: 0.7cm; size: legal landscape; }
    @media print {
      html, body { height: auto; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <header>
    <h1>Emory Woods</h1>
    <p>Leasing Report &mdash; ${today}</p>
  </header>

  <div class="two-col">
    <section>
      <h2>Vacant Units (${vacants.length})</h2>
      <table>
        <thead>
          <tr>
            <th style="width:92px;">Unit</th><th style="width:44px;">Type</th>
            <th style="width:52px;">Rent</th><th style="width:130px;">Future Tenant</th><th style="width:100px;">Move-In</th>
            <th style="text-align:center;width:24px;">P</th><th style="text-align:center;width:24px;">M</th><th style="text-align:center;width:24px;">C</th><th style="text-align:center;width:24px;">F</th><th style="text-align:center;width:42px;">Done</th><th style="text-align:center;width:48px;">Lock</th><th style="text-align:center;width:48px;border-right:none;">Tour</th>
          </tr>
        </thead>
        <tbody>${buildRows(vacants, true, targetRows)}</tbody>
      </table>
    </section>

    <section>
      <h2>Move-Out Notices (${notices.length})</h2>
      <table>
        <thead>
          <tr>
            <th style="width:92px;">Unit</th><th style="width:44px;">Type</th>
            <th style="width:52px;">Rent</th><th style="width:75px;">Move-Out</th><th style="width:90px;">Tenant</th><th style="width:130px;">Future Tenant</th><th style="width:75px;border-right:none;">Move-In</th>
          </tr>
        </thead>
        <tbody>${buildRows(notices, false, targetRows)}</tbody>
      </table>
    </section>
  </div>

  <footer>Generated by Emory Woods Leasing Dashboard</footer>
</body>
</html>`;
}

export default function ExportPDF({ units }: ExportPDFProps) {
  const [open, setOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { vacants, notices } = useMemo(() => {
    const TYPE_ORDER: Record<string, number> = { Studio: 0, "2BR": 1, "3BR": 2 };
    function typeRank(t: string) { return TYPE_ORDER[t] ?? 99; }

    const vacants = units
      .filter((u) => u.status === "vacant")
      .sort((a, b) => {
        const aHas = !!(a.future_tenant || a.future_move_in_date);
        const bHas = !!(b.future_tenant || b.future_move_in_date);
        if (aHas !== bHas) return Number(aHas) - Number(bHas);
        return typeRank(a.unit_type) - typeRank(b.unit_type);
      });
    const notices = units
      .filter((u) => u.status === "notice")
      .sort((a, b) => typeRank(a.unit_type) - typeRank(b.unit_type));

    return { vacants, notices };
  }, [units]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      }),
    []
  );

  const html = useMemo(() => buildReportHtml(vacants, notices, today), [vacants, notices, today]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  function doPrint() {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
  }

  const ghostButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "1px solid var(--color-border)",
    borderRadius: "6px",
    padding: "7px 14px",
    color: "var(--color-text-muted)",
    fontFamily: "var(--font-body)",
    fontSize: "0.9rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "border-color 0.15s, color 0.15s",
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={ghostButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)";
          e.currentTarget.style.color = "var(--color-accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.color = "var(--color-text-muted)";
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Vacant/ Notices Report
      </button>

      {open && (
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
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              padding: "20px",
              width: "100%",
              maxWidth: "1400px",
              maxHeight: "92dvh",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text)",
                  fontSize: "1.2rem",
                  fontWeight: 400,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Leasing Report
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  onClick={doPrint}
                  style={{
                    background: "var(--color-accent)", border: "none", borderRadius: "6px",
                    padding: "8px 14px", color: "#0D1A12", fontFamily: "var(--font-body)",
                    fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.08em",
                    textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  Print
                </button>
                <button onClick={() => setOpen(false)} style={ghostButtonStyle}>
                  Close
                </button>
              </div>
            </div>

            <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              <iframe
                ref={iframeRef}
                srcDoc={html}
                title="Leasing Report Preview"
                style={{
                  width: "100%",
                  aspectRatio: "14 / 8.5",
                  border: "none",
                  background: "#fff",
                  borderRadius: "6px",
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
