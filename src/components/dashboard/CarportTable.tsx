"use client";

import { useState, useMemo, useEffect } from "react";
import type { CarportSpace, CarportAssignedTo } from "@/lib/carportSpaces";
import type { Unit } from "@/lib/units";
import { carportByCode } from "@/lib/carports";
import CarportModal from "./CarportModal";

interface CarportTableProps {
  spaces: CarportSpace[];
  units: Unit[];
  loading: boolean;
  accessCode: string;
  onRefresh: () => void;
  initialAddressFilter?: string;
}

type ColKey = "address" | "space_number" | "status" | "tenant_name" | "tenant_address" | "rental_date" | "rate" | "notes";
type SortDir = "asc" | "desc";

function fmt(date: string | null): string {
  if (!date) return "—";
  return new Date(date.slice(0, 10) + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

const STATUS_LABEL: Record<NonNullable<CarportAssignedTo> | "available", string> = {
  available: "Available",
  tenant: "Tenant",
  office: "Office",
  shop: "Shop",
  external: "External",
};

const STATUS_STYLE: Record<NonNullable<CarportAssignedTo> | "available", { bg: string; color: string; border: string }> = {
  available: { bg: "rgba(42,74,53,0.3)",   color: "var(--color-text-muted)", border: "var(--color-border)"        },
  tenant:    { bg: "rgba(80,50,140,0.2)",   color: "rgba(160,120,255,1)",    border: "rgba(80,50,140,0.5)"        },
  office:    { bg: "rgba(40,100,180,0.15)", color: "rgb(80,150,230)",        border: "rgba(40,100,180,0.4)"       },
  shop:      { bg: "rgba(180,100,30,0.15)", color: "rgb(220,140,60)",        border: "rgba(180,100,30,0.4)"       },
  external:  { bg: "rgba(20,140,120,0.15)", color: "rgb(40,190,160)",        border: "rgba(20,140,120,0.4)"       },
};

function statusKey(s: CarportSpace): NonNullable<CarportAssignedTo> | "available" {
  return s.assigned_to ?? "available";
}

function cellValue(s: CarportSpace, key: ColKey): string {
  switch (key) {
    case "address":        return carportByCode(s.building)?.address ?? s.building;
    case "space_number":   return s.space_number;
    case "status":         return STATUS_LABEL[statusKey(s)];
    case "tenant_name":    return s.tenant_name;
    case "tenant_address": return s.tenant_address;
    case "rental_date":    return s.rental_date ? fmt(s.rental_date) : "";
    case "rate":           return s.rate;
    case "notes":          return s.notes ?? "";
  }
}

const COLS: { key: ColKey; label: string; filterable: "text" | "select" }[] = [
  { key: "address",        label: "Carport Address",  filterable: "text"   },
  { key: "space_number",   label: "Carport #",        filterable: "text"   },
  { key: "status",         label: "Status",           filterable: "select" },
  { key: "tenant_name",    label: "Tenant Name",      filterable: "text"   },
  { key: "tenant_address", label: "Tenant Address",   filterable: "text"   },
  { key: "rental_date",    label: "Rental Date",      filterable: "text"   },
  { key: "rate",           label: "Rate",             filterable: "text"   },
  { key: "notes",          label: "Notes",            filterable: "text"   },
];

const thBase: React.CSSProperties = {
  padding: "0",
  textAlign: "left",
  fontSize: "0.72rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  borderBottom: "2px solid rgba(80,50,140,0.8)",
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

export default function CarportTable({ spaces, units, loading, accessCode, onRefresh, initialAddressFilter }: CarportTableProps) {
  const [sortCol, setSortCol] = useState<ColKey>("address");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<Partial<Record<ColKey, string>>>({
    address: initialAddressFilter ?? "",
  });
  const [modalBuilding, setModalBuilding] = useState<string | null>(null);

  useEffect(() => {
    setFilters((f) => ({ ...f, address: initialAddressFilter ?? "" }));
  }, [initialAddressFilter]);

  function toggleSort(key: ColKey) {
    if (sortCol === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(key); setSortDir("asc"); }
  }

  function setFilter(key: ColKey, val: string) {
    setFilters((f) => ({ ...f, [key]: val }));
  }

  const displayed = useMemo(() => {
    let rows = [...spaces];

    for (const [key, val] of Object.entries(filters) as [ColKey, string][]) {
      if (!val) continue;
      const col = COLS.find((c) => c.key === key)!;
      if (col.filterable === "select") {
        rows = rows.filter((s) => cellValue(s, key) === val);
      } else {
        const q = val.toLowerCase();
        rows = rows.filter((s) => cellValue(s, key).toLowerCase().includes(q));
      }
    }

    rows.sort((a, b) => {
      const av = sortCol === "rental_date"
        ? (a.rental_date ? new Date(a.rental_date).getTime() : 0)
        : cellValue(a, sortCol).toLowerCase();
      const bv = sortCol === "rental_date"
        ? (b.rental_date ? new Date(b.rental_date).getTime() : 0)
        : cellValue(b, sortCol).toLowerCase();
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [spaces, filters, sortCol, sortDir]);

  const activeFilters = Object.values(filters).filter(Boolean).length;

  const availableCount = spaces.filter((s) => !s.assigned_to).length;
  const tenantCount = spaces.filter((s) => s.assigned_to === "tenant").length;
  const officeCount = spaces.filter((s) => s.assigned_to === "office").length;
  const shopCount = spaces.filter((s) => s.assigned_to === "shop").length;

  if (loading) return <p style={{ padding: "20px", color: "var(--color-text-muted)" }}>Loading carports…</p>;

  return (
    <>
      {modalBuilding && (
        <CarportModal
          buildingCode={modalBuilding}
          spaces={spaces}
          units={units}
          accessCode={accessCode}
          onSaved={() => { onRefresh(); }}
          onClose={() => setModalBuilding(null)}
        />
      )}

      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Summary bar */}
        <div style={{
          padding: "6px 14px", background: "rgba(80,50,140,0.08)",
          borderBottom: "1px solid rgba(80,50,140,0.25)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: "0.82rem",
        }}>
          <span style={{ color: "rgba(160,120,255,1)" }}>
            {availableCount} available · {tenantCount} tenant · {officeCount} office · {shopCount} shop · {spaces.length} total
          </span>
          {activeFilters > 0 && (
            <button
              onClick={() => setFilters({})}
              style={{
                background: "transparent", border: "1px solid rgba(80,50,140,0.5)",
                borderRadius: "4px", padding: "2px 8px", color: "rgba(160,120,255,1)",
                fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              }}
            >
              Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
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
                          color: active ? "rgba(160,120,255,1)" : "var(--color-text-muted)",
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
              <tr style={{ background: "var(--color-surface)" }}>
                {COLS.map((col) => (
                  <th key={col.key} style={{ ...thBase, borderBottom: "2px solid rgba(80,50,140,0.8)", padding: "0 6px 6px" }}>
                    {col.filterable === "select" ? (
                      <select
                        value={filters[col.key] ?? ""}
                        onChange={(e) => setFilter(col.key, e.target.value)}
                        style={{ ...inputS, cursor: "pointer" }}
                      >
                        <option value="">All</option>
                        <option value="Available">Available</option>
                        <option value="Tenant">Tenant</option>
                        <option value="Office">Office</option>
                        <option value="Shop">Shop</option>
                        <option value="External">External</option>
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
                  <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                    No carport spaces match filters.
                  </td>
                </tr>
              ) : displayed.map((s, i) => {
                const isAssigned = !!s.assigned_to;
                const rowBg = i % 2 === 0 ? "var(--color-bg)" : "var(--color-surface)";
                return (
                  <tr
                    key={s.id}
                    style={{ background: rowBg, cursor: "pointer", transition: "background 0.1s", opacity: isAssigned ? 1 : 0.75 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(80,50,140,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
                    onClick={() => setModalBuilding(s.building.replace(/-[AB]$/, "") + "-A")}
                  >
                    <td style={{ ...tdBase, color: "rgba(160,120,255,1)", fontWeight: 600 }}>
                      {carportByCode(s.building)?.address ?? s.building}
                    </td>
                    <td style={{ ...tdBase, fontWeight: 600 }}>{s.space_number}</td>
                    <td style={{ ...tdBase }}>
                      {(() => {
                        const sk = statusKey(s);
                        const ss = STATUS_STYLE[sk];
                        return (
                          <span style={{ padding: "2px 7px", borderRadius: "4px", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                            {STATUS_LABEL[sk]}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={tdBase}>{s.tenant_name || "—"}</td>
                    <td style={tdBase}>{s.tenant_address || "—"}</td>
                    <td style={tdBase}>{s.rental_date ? fmt(s.rental_date) : "—"}</td>
                    <td style={tdBase}>{s.rate || "—"}</td>
                    <td style={{ ...tdBase, whiteSpace: "normal", maxWidth: "200px" }}>{s.notes || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
