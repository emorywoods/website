"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { DashboardEntry, EntryKind } from "@/lib/db";
import type { Unit } from "@/lib/units";
import { BUILDINGS, buildingByCode } from "@/lib/buildings";
import { CARPORTS, carportByCode } from "@/lib/carports";
import type { CarportSpace } from "@/lib/carportSpaces";
import UnitRoster, { getLeaseAlert, LEASE_WARN_DAYS, EditModal } from "./UnitRoster";
import ExportPDF from "./ExportPDF";
import UnitTable from "./UnitTable";
import CarportTable from "./CarportTable";
import PropertyMap, { type BuildingCounts, type BuildingEntries, type CarportAvail } from "./PropertyMap";
import CreateDocumentModal from "./CreateDocumentModal";

type DashTab = EntryKind | "units" | "renewals" | "carports";
type ViewMode = "map" | "table";
type TableSection = "units" | "carports";

interface DashboardProps {
  accessCode: string;
}

function fmt(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function Badge({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "0.94rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: accent ? "rgba(201,168,76,0.15)" : "rgba(42,74,53,0.3)",
        color: accent ? "var(--color-accent)" : "var(--color-text-muted)",
        border: `1px solid ${accent ? "rgba(201,168,76,0.4)" : "var(--color-border)"}`,
      }}
    >
      {text}
    </span>
  );
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) {
    return (
      <span style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <button onClick={() => setConfirm(false)} style={ghostBtn}>No</button>
        <button onClick={onDelete} style={{ ...ghostBtn, color: "#e05c5c", borderColor: "#e05c5c" }}>Yes, delete</button>
      </span>
    );
  }
  return (
    <button onClick={() => setConfirm(true)} style={ghostBtn}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
      </svg>
    </button>
  );
}

const tdS: React.CSSProperties = {
  padding: "6px 10px",
  borderBottom: "1px solid var(--color-border)",
  borderRight: "1px solid var(--color-border)",
  verticalAlign: "middle",
  fontSize: "0.82rem",
  whiteSpace: "nowrap",
};

const ghostBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--color-border)",
  borderRadius: "5px",
  padding: "4px 8px",
  color: "var(--color-text-muted)",
  fontSize: "0.92rem",
  letterSpacing: "0.05em",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

interface EntryListProps {
  kind: EntryKind;
  entries: DashboardEntry[];
  accessCode: string;
  onRefresh: () => void;
  loading: boolean;
  selectedBuilding: string | null;
  onAdd: () => void;
}

function EntryList({ kind, entries, accessCode, onRefresh, loading, selectedBuilding, onAdd }: EntryListProps) {
  async function del(id: number) {
    await fetch(`/api/dashboard?id=${id}`, {
      method: "DELETE",
      headers: { "x-access-code": accessCode },
    });
    onRefresh();
  }

  const isVacant = kind === "vacant";
  const filtered = selectedBuilding ? entries.filter((e) => e.building === selectedBuilding) : entries;

  return (
    <div>
      {/* Add button row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ color: "var(--color-text-muted)", fontSize: "0.92rem", letterSpacing: "0.08em" }}>
          {loading ? "…" : `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"}`}
          {selectedBuilding && entries.length !== filtered.length && ` of ${entries.length} total`}
        </span>
        <button
          onClick={onAdd}
          style={{
            background: "var(--color-accent)",
            border: "none",
            borderRadius: "6px",
            padding: "7px 14px",
            color: "#0D1A12",
            fontFamily: "var(--font-body)",
            fontSize: "0.92rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add
        </button>
      </div>

      <div style={{ borderTop: "1px solid var(--color-border)", marginBottom: "12px" }} />

      {loading ? (
        <p style={{ color: "var(--color-text-muted)", fontSize: "1rem" }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div
          style={{
            border: "1px dashed var(--color-border)",
            borderRadius: "8px",
            padding: "28px",
            textAlign: "center",
            color: "var(--color-text-muted)",
            fontSize: "1rem",
          }}
        >
          {selectedBuilding
            ? `No ${isVacant ? "vacants" : "notices"} for this building.`
            : `No ${isVacant ? "vacant units" : "move-out notices"} recorded.`}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((e) => (
            <div
              key={e.id}
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <span style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: "1.15rem" }}>
                    Unit {e.apt_number}
                  </span>
                  {e.building && !selectedBuilding && (
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.92rem", marginLeft: "8px" }}>
                      {e.building}
                    </span>
                  )}
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.96rem", marginLeft: "8px" }}>
                    {e.unit_type} · {e.rent || "—"}
                  </span>
                </div>
                <DeleteButton onDelete={() => del(e.id)} />
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                <Badge text={e.unit_condition} />
              </div>
              <div style={{ fontSize: "0.95rem", color: "var(--color-text-muted)", lineHeight: 1.8 }}>
                {isVacant && <div><strong style={{ color: "var(--color-text)" }}>Move-In:</strong> {fmt(e.move_in_date)}</div>}
                {isVacant && e.maintenance_needed && <div><strong style={{ color: "var(--color-text)" }}>Maintenance:</strong> {e.maintenance_needed}</div>}
                {!isVacant && <div><strong style={{ color: "var(--color-text)" }}>Notice:</strong> {fmt(e.notice_date)}</div>}
                {!isVacant && <div><strong style={{ color: "var(--color-text)" }}>Move-Out:</strong> {fmt(e.move_out_date)}</div>}
                {e.notes && <div><strong style={{ color: "var(--color-text)" }}>Notes:</strong> {e.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ accessCode }: DashboardProps) {
  const [vacants, setVacants] = useState<DashboardEntry[]>([]);
  const [notices, setNotices] = useState<DashboardEntry[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [carportSpaces, setCarportSpaces] = useState<CarportSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [carportsLoading, setCarportsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedCarport, setSelectedCarport] = useState<string | null>(null);
  const [tab, setTab] = useState<DashTab>("vacant");
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [tableSection, setTableSection] = useState<TableSection>("units");
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchEditUnit, setSearchEditUnit] = useState<Unit | null>(null);
  const [carportBuildingFilter, setCarportBuildingFilter] = useState<string>("");
  const [rosterFilters, setRosterFilters] = useState<Set<string>>(new Set());
  const [showCreateDoc, setShowCreateDoc] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, nRes] = await Promise.all([
        fetch("/api/dashboard?kind=vacant", { headers: { "x-access-code": accessCode } }),
        fetch("/api/dashboard?kind=notice", { headers: { "x-access-code": accessCode } }),
      ]);
      const [vText, nText] = await Promise.all([vRes.text(), nRes.text()]);
      const vData = vText ? JSON.parse(vText) : {};
      const nData = nText ? JSON.parse(nText) : {};
      if (vData.error) console.error("Vacants API error:", vData.error);
      if (nData.error) console.error("Notices API error:", nData.error);
      setVacants(vData.entries ?? []);
      setNotices(nData.entries ?? []);
    } finally {
      setLoading(false);
    }
  }, [accessCode]);

  const loadUnits = useCallback(async (building: string | null) => {
    setUnitsLoading(true);
    try {
      const url = building
        ? `/api/units?building=${encodeURIComponent(building)}`
        : `/api/units`;
      const res = await fetch(url, { headers: { "x-access-code": accessCode } });
      const data = res.ok ? await res.json() : {};
      if (data.error) console.error("Units API error:", data.error);
      setUnits(data.units ?? []);
    } finally {
      setUnitsLoading(false);
    }
  }, [accessCode]);

  const loadCarports = useCallback(async () => {
    setCarportsLoading(true);
    try {
      const res = await fetch("/api/carports", { headers: { "x-access-code": accessCode } });
      const data = res.ok ? await res.json() : {};
      if (data.error) console.error("Carports API error:", data.error);
      setCarportSpaces(data.spaces ?? []);
    } finally {
      setCarportsLoading(false);
    }
  }, [accessCode]);

  useEffect(() => {
    Promise.all([load(), loadUnits(null), loadCarports()]).finally(() => setInitialLoad(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload units whenever building selection changes
  useEffect(() => {
    loadUnits(selected);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Build per-building counts + entry lists for map pins
  const counts: Record<string, BuildingCounts> = {};
  const entriesByBuilding: Record<string, BuildingEntries> = {};
  for (const e of vacants) {
    if (!counts[e.building]) counts[e.building] = { vacant: 0, notice: 0 };
    counts[e.building].vacant++;
    if (!entriesByBuilding[e.building]) entriesByBuilding[e.building] = { vacant: [], notice: [] };
    entriesByBuilding[e.building].vacant.push(e);
  }
  for (const e of notices) {
    if (!counts[e.building]) counts[e.building] = { vacant: 0, notice: 0 };
    counts[e.building].notice++;
    if (!entriesByBuilding[e.building]) entriesByBuilding[e.building] = { vacant: [], notice: [] };
    entriesByBuilding[e.building].notice.push(e);
  }

  // Per-building carport availability counts for map coloring
  const carportAvail: Record<string, CarportAvail> = {};
  for (const s of carportSpaces) {
    if (!carportAvail[s.building]) carportAvail[s.building] = { available: 0, leased: 0 };
    if (s.assigned_to) carportAvail[s.building].leased++;
    else carportAvail[s.building].available++;
  }

  // Units filtered by status (and building if selected) — drives Vacant/Notice tabs
  const buildingFiltered = selected ? units.filter((u) => u.building === selected) : units;
  const filteredUnits = typeFilter ? buildingFiltered.filter((u) => u.unit_type === typeFilter) : buildingFiltered;
  const vacantUnits = filteredUnits.filter((u) => u.status === "vacant");
  const noticeUnits = filteredUnits.filter((u) => u.status === "notice");
  const renewalUnits = filteredUnits.filter((u) => u.status === "occupied" && getLeaseAlert(u) !== null);

  function applyRosterFilters(list: Unit[]): Unit[] {
    if (rosterFilters.size === 0) return list;
    return list.filter((u) => {
      if (rosterFilters.has("maintenance") && !u.maintenance_needed) return false;
      if (rosterFilters.has("promo") && !u.promo_eligible) return false;
      if (rosterFilters.has("tour") && !u.ready_for_tour) return false;
      if (rosterFilters.has("locks") && !u.lock_change_needed) return false;
      if (rosterFilters.has("done") && !u.maintenance_done) return false;
      return true;
    });
  }

  function toggleRosterFilter(key: string) {
    setRosterFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  // Build a compact slug for a unit: "2194nd01" from code "2194 ND" + apt "01"
  // Also produce a zero-stripped variant: "2194nd1" so either form matches
  function unitSlugs(buildingCode: string, aptNumber: string): string[] {
    const slug = (buildingCode + aptNumber).toLowerCase().replace(/\s+/g, "");
    // strip leading zeros from the unit portion only
    const unitStripped = aptNumber.replace(/^0+(\d)/, "$1").toLowerCase();
    const slugStripped = buildingCode.toLowerCase().replace(/\s+/g, "") + unitStripped;
    return slug === slugStripped ? [slug] : [slug, slugStripped];
  }

  // Search filter — matches unit number, tenant name, building code, address, or compact slug
  const slugQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, "");
  const rawQuery = searchQuery.trim().toLowerCase();
  const allUnitsForSearch = searchQuery.trim()
    ? units.filter((u) => {
        const building = buildingByCode(u.building);
        const matchesType = !typeFilter || u.unit_type === typeFilter;
        if (!matchesType) return false;
        if (
          u.apt_number.toLowerCase().includes(rawQuery) ||
          (u.tenant_name ?? "").toLowerCase().includes(rawQuery) ||
          (u.future_tenant ?? "").toLowerCase().includes(rawQuery) ||
          u.building.toLowerCase().includes(rawQuery) ||
          (building?.address ?? "").toLowerCase().includes(rawQuery) ||
          (u.notes ?? "").toLowerCase().includes(rawQuery)
        ) return true;
        const slugs = unitSlugs(u.building, u.apt_number);
        return slugs.some((s) => s.includes(slugQuery));
      })
    : null;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const selectedBuilding = selected ? buildingByCode(selected) : null;

  const tabStyle = (t: DashTab): React.CSSProperties => ({
    flexShrink: 0,
    padding: "10px 16px",
    background: tab === t ? "var(--color-surface)" : "transparent",
    border: "none",
    borderBottom: tab === t ? "2px solid var(--color-accent)" : "2px solid transparent",
    color: tab === t ? "var(--color-accent)" : "var(--color-text-muted)",
    fontFamily: "var(--font-body)",
    fontSize: "0.94rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontWeight: tab === t ? 600 : 400,
    transition: "color 0.15s, border-color 0.15s",
    whiteSpace: "nowrap",
  });

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", fontFamily: "var(--font-body)" }}>

      {/* Create document modal */}
      {showCreateDoc && (
        <CreateDocumentModal units={units} onClose={() => setShowCreateDoc(false)} />
      )}
      {/* Search result modal */}
      {searchEditUnit && (
        <EditModal
          unit={searchEditUnit}
          accessCode={accessCode}
          onSaved={() => { setSearchEditUnit(null); loadUnits(selected); }}
          onCancel={() => setSearchEditUnit(null)}
        />
      )}
      {/* Initial load overlay */}
      {initialLoad && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(13,26,18,0.82)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            pointerEvents: "all",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            style={{ animation: "ew-spin 0.9s linear infinite" }}
          >
            <circle cx="18" cy="18" r="15" stroke="rgba(201,168,76,0.2)" strokeWidth="3" />
            <path d="M18 3 A15 15 0 0 1 33 18" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span
            style={{
              color: "var(--color-accent)",
              fontSize: "0.92rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            Loading
          </span>
          <style>{`@keyframes ew-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {/* Top bar */}
      <div
        className="dash-topbar"
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Row 1: logo + actions */}
        <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", minWidth: 0 }}>
            <span style={{ fontFamily: "var(--font-display)", color: "var(--color-accent)", fontSize: "1.2rem", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Emory Woods
            </span>
            <span className="dash-subtitle" style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Leasing Dashboard
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <span className="dash-date" style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", whiteSpace: "nowrap" }}>{today}</span>
            <button
              onClick={() => setShowCreateDoc(true)}
              style={{
                background: "var(--color-accent)", border: "none", borderRadius: "6px",
                padding: "8px 14px", color: "#0D1A12", fontFamily: "var(--font-body)",
                fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.08em",
                textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              Create Document
            </button>
            {/* View mode switch */}
            <div style={{ display: "flex", border: "1px solid var(--color-border)", borderRadius: "6px", overflow: "hidden" }}>
              {(["map", "table"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "6px 12px",
                    background: viewMode === mode ? "rgba(201,168,76,0.15)" : "transparent",
                    border: "none",
                    borderRight: mode === "map" ? "1px solid var(--color-border)" : "none",
                    color: viewMode === mode ? "var(--color-accent)" : "var(--color-text-muted)",
                    fontFamily: "var(--font-body)", fontSize: "0.82rem", letterSpacing: "0.08em",
                    textTransform: "uppercase", cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {mode === "map" ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                      <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                  )}
                  {mode}
                </button>
              ))}
            </div>
            <ExportPDF units={units} />
          </div>
        </div>
        {/* Row 2: search + filter */}
        <div style={{ padding: "0 20px 12px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", flex: 1 }}>
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              style={{ position: "absolute", left: "10px", color: "var(--color-text-muted)", pointerEvents: "none" }}
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search unit, tenant, address…"
              defaultValue=""
              onChange={(e) => {
                const val = e.target.value;
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                searchDebounceRef.current = setTimeout(() => setSearchQuery(val), 150);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  if (searchInputRef.current) searchInputRef.current.value = "";
                  setSearchQuery("");
                }
              }}
              className="dash-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  if (searchInputRef.current) searchInputRef.current.value = "";
                  setSearchQuery("");
                }}
                style={{
                  position: "absolute", right: "8px", background: "transparent", border: "none",
                  color: "var(--color-text-muted)", cursor: "pointer", fontSize: "0.9rem", lineHeight: 1,
                }}
              >✕</button>
            )}
          </div>
          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              padding: "8px 12px",
              color: typeFilter ? "var(--color-accent)" : "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              outline: "none",
              cursor: "pointer",
              flexShrink: 0,
              ...(typeFilter ? { borderColor: "rgba(201,168,76,0.5)" } : {}),
            }}
          >
            <option value="">All Types</option>
            <option value="Studio">Studio</option>
            <option value="2BR">2BR</option>
            <option value="3BR">3BR</option>
          </select>
        </div>
      </div>


      {/* Search results overlay */}
      <div className="dash-search-overlay" style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "var(--color-bg)", zIndex: 9, overflowY: "auto", padding: "24px 20px",
        paddingTop: "calc(var(--dash-topbar-h, 120px) + 8px)",
        display: allUnitsForSearch ? "block" : "none",
      }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", letterSpacing: "0.06em" }}>
              {allUnitsForSearch?.length ?? 0} result{(allUnitsForSearch?.length ?? 0) !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
            </span>
          </div>
          {(allUnitsForSearch?.length ?? 0) === 0 ? (
            <div style={{
              border: "1px dashed var(--color-border)", borderRadius: "8px", padding: "40px",
              textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.95rem",
            }}>
              No units match your search.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "720px" }}>
              {(allUnitsForSearch ?? []).map((u) => {
                const building = buildingByCode(u.building);
                return (
                  <div
                    key={u.id}
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      padding: "14px 18px",
                      cursor: "pointer",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                    onClick={() => {
                      setSearchEditUnit(u);
                      if (searchInputRef.current) searchInputRef.current.value = "";
                      setSearchQuery("");
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: "1rem" }}>
                          Unit {u.apt_number}
                        </span>
                        <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                          {building?.address ?? u.building}
                        </span>
                      </div>
                      <span style={{
                        fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase",
                        padding: "2px 8px", borderRadius: "4px",
                        background: u.status === "vacant" ? "rgba(201,168,76,0.15)" : u.status === "notice" ? "rgba(40,140,80,0.12)" : "rgba(42,74,53,0.3)",
                        color: u.status === "vacant" ? "var(--color-accent)" : u.status === "notice" ? "rgb(30,150,80)" : "var(--color-text-muted)",
                        border: `1px solid ${u.status === "vacant" ? "rgba(201,168,76,0.4)" : u.status === "notice" ? "rgba(40,140,80,0.4)" : "var(--color-border)"}`,
                      }}>
                        {u.status}
                      </span>
                    </div>
                    {(u.tenant_name || u.unit_type) && (
                      <div style={{ marginTop: "6px", fontSize: "0.88rem", color: "var(--color-text-muted)" }}>
                        {u.tenant_name && <span><strong style={{ color: "var(--color-text)" }}>{u.tenant_name}</strong></span>}
                        {u.unit_type && <span style={{ marginLeft: u.tenant_name ? "8px" : 0 }}>· {u.unit_type}{u.unit_condition ? ` · ${u.unit_condition}` : ""}</span>}
                        {u.rent && <span> · {u.rent}</span>}
                      </div>
                    )}
                    {u.future_tenant && (
                      <div style={{ marginTop: "4px", fontSize: "0.85rem", color: "rgb(60,120,210)" }}>
                        <strong>Future:</strong> {u.future_tenant}
                        {u.future_move_in_date && <span style={{ color: "var(--color-text-muted)" }}> · moves in {new Date(u.future_move_in_date).toLocaleDateString()}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* Main content — table view */}
      {viewMode === "table" && (
        <div style={{ height: "calc(100dvh - 110px)", display: "flex", flexDirection: "column" }}>
          {/* Units / Carports toggle */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)", flexShrink: 0 }}>
            {(["units", "carports"] as TableSection[]).map((sec) => (
              <button
                key={sec}
                onClick={() => setTableSection(sec)}
                style={{
                  padding: "9px 18px",
                  background: tableSection === sec ? "var(--color-surface)" : "transparent",
                  border: "none",
                  borderBottom: tableSection === sec
                    ? `2px solid ${sec === "carports" ? "rgba(80,50,140,0.95)" : "var(--color-accent)"}`
                    : "2px solid transparent",
                  color: tableSection === sec
                    ? sec === "carports" ? "rgba(160,120,255,1)" : "var(--color-accent)"
                    : "var(--color-text-muted)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.88rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontWeight: tableSection === sec ? 600 : 400,
                }}
              >
                {sec === "units" ? "Units" : "Carports"}
                {sec === "carports" && !carportsLoading && (
                  <span style={{ marginLeft: "6px", background: "rgba(80,50,140,0.2)", color: "rgba(160,120,255,1)", borderRadius: "10px", padding: "1px 6px", fontSize: "0.8rem" }}>
                    {carportSpaces.filter((s) => !s.assigned_to).length} avail
                  </span>
                )}
              </button>
            ))}
          </div>
          {/* Table content */}
          <div style={{ flex: 1, minHeight: 0 }}>
            {tableSection === "units" ? (
              <UnitTable
                units={units}
                loading={unitsLoading}
                onClickUnit={(u) => setSearchEditUnit(u)}
                selectedBuilding={selected}
                onClearBuilding={() => setSelected(null)}
              />
            ) : (
              <CarportTable
                spaces={carportSpaces}
                units={units}
                loading={carportsLoading}
                accessCode={accessCode}
                onRefresh={loadCarports}
                initialAddressFilter={carportBuildingFilter}
              />
            )}
          </div>
        </div>
      )}

      {/* Main content — map + sidebar */}
      <div
        style={{
          display: viewMode === "map" ? "grid" : "none",
          gridTemplateColumns: "minmax(0,1.1fr) minmax(0,0.9fr)",
          gap: "0",
          height: "calc(100dvh - 110px)",
        }}
        className="dashboard-grid"
      >
        {/* Left — map */}
        <div
          className="dash-map-panel"
          style={{
            borderRight: "1px solid var(--color-border)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <PropertyMap
            buildings={BUILDINGS}
            selected={selected}
            onSelect={(code) => {
              setSelected(code);
              if (code) { setSelectedCarport(null); setCarportBuildingFilter(""); setTab("vacant"); }
            }}
            counts={counts}
            entriesByBuilding={entriesByBuilding}
            carports={CARPORTS}
            carportAvail={carportAvail}
            selectedCarport={selectedCarport}
            onSelectCarport={(code) => {
              setSelectedCarport(code);
              if (code) {
                const address = carportByCode(code)?.address ?? "";
                setCarportBuildingFilter(address);
                setTab("carports");
              } else {
                setCarportBuildingFilter("");
              }
            }}
          />
        </div>

        {/* Right — tabbed panel */}
        <div className="dash-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Filter indicator */}
          {selected && selectedBuilding && (
            <div
              style={{
                padding: "10px 20px",
                background: "rgba(201,168,76,0.08)",
                borderBottom: "1px solid rgba(201,168,76,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "0.94rem", color: "var(--color-accent)", letterSpacing: "0.06em" }}>
                Filtered: {selectedBuilding.address}
              </span>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.4)",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  color: "var(--color-accent)",
                  fontSize: "0.86rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                ✕ Clear
              </button>
            </div>
          )}

          {/* Apartment / Carport switch */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)", flexShrink: 0 }}>
            {([
              { key: "apartment", label: "Apartments" },
              { key: "carport",   label: "Carports"   },
            ] as { key: "apartment" | "carport"; label: string }[]).map(({ key, label }) => {
              const isCarport = key === "carport";
              const active = isCarport ? tab === "carports" : tab !== "carports";
              return (
                <button
                  key={key}
                  onClick={() => setTab(isCarport ? "carports" : "vacant")}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    background: "transparent",
                    border: "none",
                    borderBottom: active
                      ? `2px solid ${isCarport ? "rgba(80,50,140,0.95)" : "var(--color-accent)"}`
                      : "2px solid transparent",
                    color: active
                      ? isCarport ? "rgba(160,120,255,1)" : "var(--color-accent)"
                      : "var(--color-text-muted)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.86rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontWeight: active ? 600 : 400,
                    transition: "color 0.15s, border-color 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  {label}
                  {isCarport && !carportsLoading && (
                    <span style={{ background: "rgba(80,50,140,0.2)", color: "rgba(160,120,255,1)", borderRadius: "10px", padding: "1px 6px", fontSize: "0.8rem" }}>
                      {carportSpaces.filter((s) => !s.assigned_to).length} avail
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Apartment tabs — hidden when carport view active */}
          {tab !== "carports" && (
            <div className="dash-tabs" style={{ display: "flex", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)", overflowX: "auto", scrollbarWidth: "none", alignItems: "center" }}>
              <button style={tabStyle("vacant")} onClick={() => setTab("vacant")}>
                Vacant
                {!unitsLoading && (
                  <span style={{ marginLeft: "6px", background: "rgba(201,168,76,0.15)", color: "var(--color-accent)", borderRadius: "10px", padding: "1px 6px", fontSize: "0.86rem" }}>
                    {vacantUnits.length}
                  </span>
                )}
              </button>
              <button style={tabStyle("notice")} onClick={() => setTab("notice")}>
                Notices
                {!unitsLoading && (
                  <span style={{ marginLeft: "6px", background: "rgba(201,168,76,0.15)", color: "var(--color-accent)", borderRadius: "10px", padding: "1px 6px", fontSize: "0.86rem" }}>
                    {noticeUnits.length}
                  </span>
                )}
              </button>
              <button style={tabStyle("units")} onClick={() => setTab("units")}>
                All Units
                {!unitsLoading && (
                  <span style={{ marginLeft: "6px", background: "rgba(201,168,76,0.15)", color: "var(--color-accent)", borderRadius: "10px", padding: "1px 6px", fontSize: "0.86rem" }}>
                    {filteredUnits.length}
                  </span>
                )}
              </button>
              <button style={tabStyle("renewals")} onClick={() => setTab("renewals")}>
                Renewals
                {!unitsLoading && renewalUnits.length > 0 && (
                  <span style={{ marginLeft: "6px", background: "rgba(224,154,60,0.18)", color: "#e09a3c", borderRadius: "10px", padding: "1px 6px", fontSize: "0.86rem" }}>
                    {renewalUnits.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Roster filter chips — apartments only */}
          {tab !== "carports" && (
            <div style={{
              display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap",
              padding: "7px 14px", borderBottom: "1px solid var(--color-border)",
              background: "var(--color-surface)", flexShrink: 0,
            }}>
              {([
                { key: "maintenance", label: "Needs Maint." },
                { key: "promo",       label: "13-Mo Promo"  },
                { key: "tour",        label: "Ready for Tour" },
                { key: "locks",       label: "Locks Changed" },
                { key: "done",        label: "Maint. Done"  },
              ] as { key: string; label: string }[]).map(({ key, label }) => {
                const active = rosterFilters.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleRosterFilter(key)}
                    style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      padding: "3px 9px", borderRadius: "20px", cursor: "pointer",
                      fontFamily: "var(--font-body)", fontSize: "0.75rem",
                      letterSpacing: "0.07em", textTransform: "uppercase",
                      transition: "all 0.15s",
                      background: active ? "rgba(201,168,76,0.18)" : "transparent",
                      border: `1px solid ${active ? "rgba(201,168,76,0.55)" : "var(--color-border)"}`,
                      color: active ? "var(--color-accent)" : "var(--color-text-muted)",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {active && <span style={{ fontSize: "0.65rem" }}>✓</span>}
                    {label}
                  </button>
                );
              })}
              {rosterFilters.size > 0 && (
                <button
                  onClick={() => setRosterFilters(new Set())}
                  style={{
                    marginLeft: "2px", padding: "3px 8px", borderRadius: "20px",
                    background: "transparent", border: "1px solid var(--color-border)",
                    color: "var(--color-text-muted)", fontSize: "0.72rem",
                    letterSpacing: "0.07em", textTransform: "uppercase",
                    cursor: "pointer", fontFamily: "var(--font-body)",
                  }}
                >
                  ✕ Clear
                </button>
              )}
            </div>
          )}

          {/* Panel content */}
          <div style={{ flex: 1, padding: tab === "carports" ? "0" : "20px", overflowY: tab === "carports" ? "hidden" : "auto", display: "flex", flexDirection: "column" }}>
            {tab === "carports" ? (
              <CarportTable
                spaces={carportSpaces}
                units={units}
                loading={carportsLoading}
                accessCode={accessCode}
                onRefresh={loadCarports}
                initialAddressFilter={carportBuildingFilter}
              />
            ) : tab === "units" ? (
              <UnitRoster
                units={applyRosterFilters(filteredUnits)}
                selectedBuilding={selected ?? "all"}
                accessCode={accessCode}
                onRefresh={() => loadUnits(selected)}
                loading={unitsLoading}
              />
            ) : tab === "vacant" ? (
              <UnitRoster
                units={applyRosterFilters(vacantUnits)}
                selectedBuilding={selected ?? "all"}
                accessCode={accessCode}
                onRefresh={() => loadUnits(selected)}
                loading={unitsLoading}
                emptyMessage="No vacant units."
              />
            ) : tab === "renewals" ? (
              <UnitRoster
                units={applyRosterFilters(renewalUnits)}
                selectedBuilding={selected ?? "all"}
                accessCode={accessCode}
                onRefresh={() => loadUnits(selected)}
                loading={unitsLoading}
                emptyMessage={`No leases expiring within ${LEASE_WARN_DAYS} days.`}
              />
            ) : (
              <UnitRoster
                units={applyRosterFilters(noticeUnits)}
                selectedBuilding={selected ?? "all"}
                accessCode={accessCode}
                onRefresh={() => loadUnits(selected)}
                loading={unitsLoading}
                emptyMessage="No move-out notices."
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile responsive override */}
      <style>{`
        .dash-search-input {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 8px 28px 8px 32px;
          color: var(--color-text);
          font-family: var(--font-body);
          font-size: 0.9rem;
          outline: none;
          width: 100%;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .dash-search-input:focus {
          border-color: rgba(201,168,76,0.5);
        }
        .dash-tabs::-webkit-scrollbar { display: none; }

        /* ── Desktop (>900px) ── */
        @media (min-width: 901px) {
          .dashboard-grid {
            grid-template-columns: minmax(0,1.1fr) minmax(0,0.9fr) !important;
            height: calc(100dvh - 110px) !important;
          }
          .dash-map-panel {
            display: flex !important;
            position: static !important;
            height: 100% !important;
          }
          .dash-panel {
            display: flex !important;
            position: static !important;
            height: 100% !important;
          }
        }

        /* ── Mobile (≤900px) ── */
        @media (max-width: 900px) {
          .dash-subtitle { display: none !important; }
          .dash-date { display: none !important; }

          /* Grid: single column, full remaining height */
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            height: calc(100dvh - 110px) !important;
            position: relative !important;
            display: block !important;
          }

          /* Map fills the top ~45% */
          .dash-map-panel {
            display: flex !important;
            position: absolute !important;
            top: 0;
            left: 0;
            right: 0;
            height: 45% !important;
            border-right: none !important;
            border-bottom: 1px solid var(--color-border);
          }

          /* Panel sits in the bottom 55% */
          .dash-panel {
            display: flex !important;
            position: absolute !important;
            bottom: 0;
            left: 0;
            right: 0;
            height: 55% !important;
            border-top: 1px solid var(--color-border);
            background: var(--color-bg);
            border-radius: 12px 12px 0 0;
            box-shadow: 0 -4px 24px rgba(0,0,0,0.18);
          }
        }
      `}</style>
    </div>
  );
}
