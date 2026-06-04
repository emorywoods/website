"use client";

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

function displayStatus(u: Unit): string {
  if (u.status === "vacant" && u.move_in_date) return "Vacant (Rented)";
  return u.status.charAt(0).toUpperCase() + u.status.slice(1);
}

export default function ExportPDF({ units }: ExportPDFProps) {
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

  function doExport() {
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });

    function buildRows(rows: Unit[], isVacant = false): string {
      const cols = 13;
      if (rows.length === 0) {
        return `<tr><td colspan="${cols}" style="text-align:center;color:#999;padding:16px;font-style:italic">No entries</td></tr>`;
      }
      return rows.map((u, i) => {
        const hasFuture = !!(u.future_tenant || u.future_move_in_date);
        const bg = i % 2 === 0 ? "#ffffff" : "#f7f3ec";
        const rowStyle = `background:${bg};border-left:3px solid ${hasFuture && isVacant ? "#c9a84c" : isVacant ? "#e05c5c" : "#9bbfa8"};`;
        function cb(checked: boolean): string {
          return checked
            ? `<td style="text-align:center;border-right:1px solid #f0ebe0;padding:1px 3px;background:rgba(26,58,37,0.08);">&#10003;</td>`
            : `<td style="text-align:center;border-right:1px solid #f0ebe0;padding:1px 3px;"></td>`;
        }
        const items = (u.maintenance_needed || "").split(",").map((s: string) => s.trim()).filter(Boolean);
        const maintCells = [
          cb(items.includes("Paint")),
          cb(items.includes("Maintenance")),
          cb(items.includes("Cleaning")),
          cb(items.includes("Flooring")),
          cb(!!u.maintenance_done),
          cb(!!u.lock_change_needed),
        ].join("");
        return `
        <tr style="${rowStyle}">
          <td style="font-weight:600;letter-spacing:0.02em;">${unitCode(u.building, u.apt_number)}</td>
          <td>${displayStatus(u)}</td>
          <td>${u.unit_type || ""}</td>
          <td>${u.unit_condition || ""}</td>
          <td>${u.rent || ""}</td>
          ${isVacant
            ? `<td>${u.future_tenant || ""}</td>
               <td>${u.future_move_in_date ? fmt(u.future_move_in_date) : ""}</td>`
            : `<td>${u.move_in_date ? fmt(u.move_in_date) : u.move_out_date ? fmt(u.move_out_date) : ""}</td>
               <td>${u.tenant_name || ""}</td>`
          }
          ${maintCells}
        </tr>
      `}).join("");
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Emory Woods — Leasing Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #111; padding: 14px; font-size: 11px; }
    header { margin-bottom: 10px; display: flex; align-items: baseline; gap: 14px; }
    header h1 { font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; color: #1a3a25; }
    header p { color: #777; font-size: 9px; letter-spacing: 0.04em; }
    .two-col { display: flex; gap: 14px; align-items: flex-start; }
    .two-col section { flex: 1; min-width: 0; margin-bottom: 0; }
    section h2 {
      font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
      color: #888; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-bottom: 5px;
    }
    table { width: 100%; border-collapse: collapse; border: 1px solid #ddd; }
    thead tr { background: #f5f0e8; }
    th {
      text-align: left; padding: 3px 5px; font-size: 8px;
      letter-spacing: 0.07em; text-transform: uppercase; color: #555;
      border-bottom: 2px solid #c9a84c; border-right: 1px solid #e0d8c8; white-space: nowrap;
    }
    th:last-child { border-right: none; }
    td { padding: 1px 4px; border-bottom: 1px solid #eee; border-right: 1px solid #f0ebe0; vertical-align: middle; font-size: 9px; line-height: 1.15; }
    td:last-child { border-right: none; }
    tr:last-child td { border-bottom: none; }
    footer { margin-top: 10px; font-size: 8px; color: #bbb; text-align: right; letter-spacing: 0.04em; }
    @page { margin: 0.7cm; size: A4 landscape; }
    @media print {
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
            <th>Unit</th><th>Status</th><th>Type</th>
            <th>Cond</th><th>Rent</th><th>Future Tenant</th><th>Move-In</th>
            <th style="text-align:center;width:18px;">P</th><th style="text-align:center;width:18px;">M</th><th style="text-align:center;width:18px;">C</th><th style="text-align:center;width:18px;">F</th><th style="text-align:center;width:28px;">Done</th><th style="text-align:center;width:36px;border-right:none;">Lock</th>
          </tr>
        </thead>
        <tbody>${buildRows(vacants, true)}</tbody>
      </table>
    </section>

    <section>
      <h2>Move-Out Notices (${notices.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Unit</th><th>Status</th><th>Type</th>
            <th>Cond</th><th>Rent</th><th>Move-Out</th><th>Tenant</th>
            <th style="text-align:center;width:18px;">P</th><th style="text-align:center;width:18px;">M</th><th style="text-align:center;width:18px;">C</th><th style="text-align:center;width:18px;">F</th><th style="text-align:center;width:28px;">Done</th><th style="text-align:center;width:36px;border-right:none;">Lock</th>
          </tr>
        </thead>
        <tbody>${buildRows(notices)}</tbody>
      </table>
    </section>
  </div>

  <footer>Generated by Emory Woods Leasing Dashboard</footer>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  }

  return (
    <button
      onClick={doExport}
      style={{
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
      }}
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
      Export PDF
    </button>
  );
}
