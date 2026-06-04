"use client";

import { useState, useMemo } from "react";
import type { Unit } from "@/lib/units";
import { getLeaseAlert } from "./UnitRoster";

interface UnitTableProps {
  units: Unit[];
  loading: boolean;
  onClickUnit: (u: Unit) => void;
  selectedBuilding?: string | null;
  onClearBuilding?: () => void;
}

function fmt(date: string | null): string {
  if (!date) return "—";
  return new Date(date.slice(0, 10) + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

type ColKey =
  | "building" | "status" | "unit_type" | "unit_condition"
  | "rent" | "tenant_name" | "lease_type" | "move_in_date" | "move_out_date"
  | "maint_paint" | "maint_maintenance" | "maint_cleaning" | "maint_flooring"
  | "maintenance_done" | "lock_change_needed" | "ready_for_tour" | "notes"
  | "future_tenant" | "future_move_in_date";

type SortDir = "asc" | "desc";

const COLS: { key: ColKey; label: string; filterable: "text" | "select" | "bool" }[] = [
  { key: "building",           label: "Unit",      filterable: "select" },
  { key: "status",             label: "Status",     filterable: "select" },
  { key: "unit_type",          label: "Type",       filterable: "select" },
  { key: "unit_condition",     label: "Cond",       filterable: "select" },
  { key: "rent",               label: "Rent",       filterable: "text"   },
  { key: "tenant_name",        label: "Tenant",     filterable: "text"   },
  { key: "lease_type",         label: "Lease",      filterable: "select" },
  { key: "move_in_date",       label: "Lease From", filterable: "text"   },
  { key: "move_out_date",      label: "Lease To",   filterable: "text"   },
  { key: "maint_paint",        label: "P",          filterable: "bool"   },
  { key: "maint_maintenance",  label: "M",          filterable: "bool"   },
  { key: "maint_cleaning",     label: "C",          filterable: "bool"   },
  { key: "maint_flooring",     label: "F",          filterable: "bool"   },
  { key: "maintenance_done",   label: "Done",       filterable: "bool"   },
  { key: "lock_change_needed", label: "Lock",        filterable: "bool"   },
  { key: "ready_for_tour",     label: "Tour",        filterable: "bool"   },
  { key: "notes",              label: "Notes",       filterable: "text"   },
  { key: "future_tenant",      label: "Future",      filterable: "text"   },
  { key: "future_move_in_date",label: "Future In",   filterable: "text"   },
];

function maintItems(u: Unit): string[] {
  return (u.maintenance_needed || "").split(",").map((s) => s.trim()).filter(Boolean);
}

function cellValue(u: Unit, key: ColKey): string {
  switch (key) {
    case "lease_type": return u.lease_type === "12-month" ? "12-Mo" : u.lease_type === "month-to-month" ? "MTM" : u.lease_type || "";
    case "move_in_date": return u.move_in_date ? fmt(u.move_in_date) : "";
    case "move_out_date": return u.move_out_date ? fmt(u.move_out_date) : "";
    case "future_tenant":       return u.future_tenant || "";
    case "future_move_in_date": return u.future_move_in_date ? fmt(u.future_move_in_date) : "";
    case "maint_paint":        return maintItems(u).includes("Paint") ? "yes" : "no";
    case "maint_maintenance":  return maintItems(u).includes("Maintenance") ? "yes" : "no";
    case "maint_cleaning":     return maintItems(u).includes("Cleaning") ? "yes" : "no";
    case "maint_flooring":     return maintItems(u).includes("Flooring") ? "yes" : "no";
    case "maintenance_done":   return u.maintenance_done ? "yes" : "no";
    case "lock_change_needed": return u.lock_change_needed ? "yes" : "no";
    case "ready_for_tour":     return u.ready_for_tour ? "yes" : "no";
    default: return String((u as unknown as Record<string, unknown>)[key] ?? "");
  }
}

function sortVal(u: Unit, key: ColKey): string | number {
  if (key === "move_in_date" || key === "move_out_date" || key === "future_move_in_date") {
    const v = (u as unknown as Record<string, unknown>)[key] as string | null;
    return v ? new Date(v).getTime() : 0;
  }
  if (key === "rent") {
    const n = parseFloat(String(u.rent).replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  }
  // bool cols sort checked first
  if (["maint_paint","maint_maintenance","maint_cleaning","maint_flooring","maintenance_done","lock_change_needed","ready_for_tour"].includes(key)) {
    return cellValue(u, key) === "yes" ? 0 : 1;
  }
  return cellValue(u, key).toLowerCase();
}

const thBase: React.CSSProperties = {
  padding: "0",
  textAlign: "left",
  fontSize: "0.72rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  borderBottom: "2px solid var(--color-accent)",
  borderRight: "1px solid var(--color-border)",
  whiteSpace: "nowrap",
  background: "var(--color-surface)",
  verticalAlign: "top",
};

const tdBase: React.CSSProperties = {
  padding: "6px 10px",
  borderBottom: "1px solid var(--color-border)",
  borderRight: "1px solid var(--color-border)",
  verticalAlign: "middle",
  fontSize: "0.82rem",
  whiteSpace: "nowrap",
};

const inputS: React.CSSProperties = {
  width: "100%",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "3px",
  padding: "3px 5px",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "0.72rem",
  outline: "none",
  boxSizing: "border-box",
};

export default function UnitTable({ units, loading, onClickUnit, selectedBuilding, onClearBuilding }: UnitTableProps) {
  const [sortCol, setSortCol] = useState<ColKey>("building");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<Partial<Record<ColKey, string>>>({});

  function toggleSort(key: ColKey) {
    if (sortCol === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(key); setSortDir("asc"); }
  }

  function setFilter(key: ColKey, val: string) {
    setFilters((f) => ({ ...f, [key]: val }));
  }

  // Unique values for select filters
  const selectOptions = useMemo(() => {
    const map: Partial<Record<ColKey, string[]>> = {};
    for (const col of COLS) {
      if (col.filterable === "select") {
        const vals = Array.from(new Set(units.map((u) => cellValue(u, col.key)).filter(Boolean))).sort();
        map[col.key] = vals;
      }
    }
    return map;
  }, [units]);

  const displayed = useMemo(() => {
    let rows = selectedBuilding ? units.filter((u) => u.building === selectedBuilding) : [...units];

    // Filter
    for (const [key, val] of Object.entries(filters) as [ColKey, string][]) {
      if (!val) continue;
      const col = COLS.find((c) => c.key === key)!;
      if (col.filterable === "bool") {
        rows = rows.filter((u) => (val === "yes") === (cellValue(u, key) === "yes"));
      } else if (col.filterable === "select") {
        rows = rows.filter((u) => cellValue(u, key) === val);
      } else {
        const q = val.toLowerCase();
        rows = rows.filter((u) => cellValue(u, key).toLowerCase().includes(q));
      }
    }

    // Sort
    const isDateCol = sortCol === "move_in_date" || sortCol === "move_out_date" || sortCol === "future_move_in_date";
    rows.sort((a, b) => {
      const av = sortVal(a, sortCol);
      const bv = sortVal(b, sortCol);
      // Empty dates always sink to bottom regardless of sort direction
      if (isDateCol) {
        const aEmpty = av === 0;
        const bEmpty = bv === 0;
        if (aEmpty && bEmpty) return 0;
        if (aEmpty) return 1;
        if (bEmpty) return -1;
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [units, filters, sortCol, sortDir]);

  const activeFilters = Object.values(filters).filter(Boolean).length;

  if (loading) return <p style={{ padding: "20px", color: "var(--color-text-muted)" }}>Loading...</p>;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Building filter indicator */}
      {selectedBuilding && (
        <div style={{
          padding: "6px 14px", background: "rgba(201,168,76,0.08)",
          borderBottom: "1px solid rgba(201,168,76,0.2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: "0.82rem",
        }}>
          <span style={{ color: "var(--color-accent)" }}>Building: {selectedBuilding}</span>
          {onClearBuilding && (
            <button
              onClick={onClearBuilding}
              style={{
                background: "transparent", border: "1px solid rgba(201,168,76,0.4)",
                borderRadius: "4px", padding: "2px 8px", color: "var(--color-accent)",
                fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      )}
      {/* Active filter count + clear */}
      {activeFilters > 0 && (
        <div style={{
          padding: "6px 14px", background: "rgba(201,168,76,0.08)",
          borderBottom: "1px solid rgba(201,168,76,0.2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: "0.82rem",
        }}>
          <span style={{ color: "var(--color-accent)" }}>
            {activeFilters} filter{activeFilters > 1 ? "s" : ""} active · {displayed.length} of {units.length} units
          </span>
          <button
            onClick={() => setFilters({})}
            style={{
              background: "transparent", border: "1px solid rgba(201,168,76,0.4)",
              borderRadius: "4px", padding: "2px 8px", color: "var(--color-accent)",
              fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
            }}
          >
            Clear all
          </button>
        </div>
      )}

      <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
            {/* Sort row */}
            <tr>
              {COLS.map((col) => {
                const active = sortCol === col.key;
                return (
                  <th key={col.key} style={{ ...thBase, paddingBottom: "2px" }}>
                    <button
                      onClick={() => toggleSort(col.key)}
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        background: "none", border: "none", cursor: "pointer",
                        color: active ? "var(--color-accent)" : "var(--color-text-muted)",
                        fontFamily: "var(--font-body)", fontSize: "0.72rem",
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        padding: "8px 10px 4px", whiteSpace: "nowrap", width: "100%",
                      }}
                    >
                      {col.label}
                      <span style={{ opacity: active ? 1 : 0.3, fontSize: "0.65rem" }}>
                        {active ? (sortDir === "asc" ? "▲" : "▼") : "▲"}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
            {/* Filter row */}
            <tr style={{ background: "var(--color-surface)" }}>
              {COLS.map((col) => (
                <th key={col.key} style={{ ...thBase, borderBottom: "2px solid var(--color-accent)", padding: "0 6px 6px" }}>
                  {col.filterable === "select" ? (
                    <select
                      value={filters[col.key] ?? ""}
                      onChange={(e) => setFilter(col.key, e.target.value)}
                      style={{ ...inputS, cursor: "pointer" }}
                    >
                      <option value="">All</option>
                      {(selectOptions[col.key] ?? []).map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  ) : col.filterable === "bool" ? (
                    <select
                      value={filters[col.key] ?? ""}
                      onChange={(e) => setFilter(col.key, e.target.value)}
                      style={{ ...inputS, cursor: "pointer" }}
                    >
                      <option value="">All</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Filter…"
                      value={filters[col.key] ?? ""}
                      onChange={(e) => setFilter(col.key, e.target.value)}
                      style={inputS}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={19} style={{ padding: "32px", textAlign: "center", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                  No units match filters.
                </td>
              </tr>
            ) : displayed.map((u, i) => {
              const alert = getLeaseAlert(u);
              const rowBg = i % 2 === 0 ? "var(--color-bg)" : "var(--color-surface)";
              const statusColor =
                u.status === "vacant" ? "var(--color-accent)" :
                u.status === "notice" ? "rgb(30,150,80)" : "var(--color-text-muted)";
              return (
                <tr
                  key={u.id}
                  style={{ background: rowBg, cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.07)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
                  onClick={() => onClickUnit(u)}
                >
                  <td style={{ ...tdBase, color: "var(--color-accent)", fontWeight: 600, whiteSpace: "nowrap" }}>{u.building} {u.apt_number}</td>
                  <td style={{ ...tdBase, color: statusColor, textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.06em" }}>{u.status}</td>
                  <td style={tdBase}>{u.unit_type || "—"}</td>
                  <td style={tdBase}>{u.unit_condition || "—"}</td>
                  <td style={tdBase}>{u.rent || "—"}</td>
                  <td style={{ ...tdBase, maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>{u.tenant_name || "—"}</td>
                  <td style={tdBase}>{u.lease_type === "12-month" ? "12-Mo" : u.lease_type === "month-to-month" ? "MTM" : "—"}</td>
                  <td style={tdBase}>{u.move_in_date ? fmt(u.move_in_date) : "—"}</td>
                  <td style={{ ...tdBase, color: alert ? (alert.daysUntil <= 0 ? "#e05c5c" : "#e09a3c") : "inherit", fontWeight: alert ? 600 : 400 }}>
                    {u.move_out_date ? fmt(u.move_out_date) : "—"}
                    {alert && <span style={{ marginLeft: "4px", fontSize: "0.7rem" }}>({alert.daysUntil <= 0 ? "exp" : `${alert.daysUntil}d`})</span>}
                  </td>
                  {(["Paint","Maintenance","Cleaning","Flooring"] as const).map((item) => {
                    const checked = maintItems(u).includes(item);
                    return (
                      <td key={item} style={{ ...tdBase, textAlign: "center", padding: "4px", width: "28px", background: checked ? "rgba(26,58,37,0.08)" : undefined }}>
                        {checked && <span style={{ color: "var(--color-accent)", fontSize: "0.9rem" }}>✓</span>}
                      </td>
                    );
                  })}
                  <td style={{ ...tdBase, textAlign: "center", padding: "4px", width: "28px", background: u.maintenance_done ? "rgba(26,58,37,0.08)" : undefined }}>
                    {u.maintenance_done && <span style={{ color: "rgb(60,150,90)", fontSize: "0.9rem" }}>✓</span>}
                  </td>
                  <td style={{ ...tdBase, textAlign: "center", padding: "4px", width: "28px", background: u.lock_change_needed ? "rgba(224,92,92,0.08)" : undefined }}>
                    {u.lock_change_needed && <span style={{ color: "#e05c5c", fontSize: "0.9rem" }}>✓</span>}
                  </td>
                  <td style={{ ...tdBase, textAlign: "center", padding: "4px", width: "28px", background: u.ready_for_tour ? "rgba(40,140,80,0.08)" : undefined }}>
                    {u.ready_for_tour && <span style={{ color: "rgb(30,150,80)", fontSize: "0.9rem" }}>✓</span>}
                  </td>
                  <td style={{ ...tdBase, maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", color: "var(--color-text-muted)" }}>{u.notes || "—"}</td>
                  <td style={{ ...tdBase, maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", color: u.future_tenant ? "rgb(60,120,210)" : "var(--color-text-muted)" }}>
                    {u.future_tenant || "—"}
                  </td>
                  <td style={{ ...tdBase, color: u.future_move_in_date ? "rgb(60,120,210)" : "var(--color-text-muted)" }}>
                    {u.future_move_in_date ? fmt(u.future_move_in_date) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
