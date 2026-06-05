"use client";

import { useEffect, useRef } from "react";
import type { Building } from "@/lib/buildings";
import type { CarportBuilding } from "@/lib/carports";
import type { DashboardEntry } from "@/lib/db";

export interface BuildingCounts {
  vacant: number;
  notice: number;
}

export interface BuildingEntries {
  vacant: DashboardEntry[];
  notice: DashboardEntry[];
}

export interface CarportAvail {
  available: number;
  leased: number;
}

interface PropertyMapProps {
  buildings: Building[];
  selected: string | null;
  onSelect: (code: string | null) => void;
  counts: Record<string, BuildingCounts>;
  entriesByBuilding: Record<string, BuildingEntries>;
  carports: CarportBuilding[];
  carportAvail: Record<string, CarportAvail>;
  selectedCarport: string | null;
  onSelectCarport: (code: string | null) => void;
}

const CENTER: [number, number] = [-84.30340, 33.79200];

// Fallback square for buildings with no OSM footprint
function squareFootprint(lat: number, lng: number): GeoJSON.Polygon {
  const d = 0.00013;
  return {
    type: "Polygon",
    coordinates: [[
      [lng - d, lat - d],
      [lng + d, lat - d],
      [lng + d, lat + d],
      [lng - d, lat + d],
      [lng - d, lat - d],
    ]],
  };
}

function buildPopupHTML(b: Building): string {
  return `<div style="font-family:system-ui,sans-serif;padding:4px 2px">
    <div style="font-weight:700;font-size:13px;color:#111;line-height:1.4">${b.address}</div>
  </div>`;
}

const COMPLEX_SOURCE = "complex-buildings";
const COMPLEX_FILL = "complex-fill";
const COMPLEX_OUTLINE = "complex-outline";
const COMPLEX_LABEL = "complex-label";

const CARPORT_SOURCE = "carport-buildings";
const CARPORT_FILL = "carport-fill";
const CARPORT_OUTLINE = "carport-outline";

// Minimal light road map — roads only, no POIs, no building labels
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

export default function PropertyMap({ buildings, selected, onSelect, counts, entriesByBuilding, carports, carportAvail, selectedCarport, onSelectCarport }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const popupRef = useRef<any>(null);

  const selectedRef = useRef(selected);
  const onSelectRef = useRef(onSelect);
  const countsRef = useRef(counts);
  const buildingsRef = useRef(buildings);
  const entriesRef = useRef(entriesByBuilding);
  const carportsRef = useRef(carports);
  const carportAvailRef = useRef(carportAvail);
  const selectedCarportRef = useRef(selectedCarport);
  const onSelectCarportRef = useRef(onSelectCarport);

  selectedRef.current = selected;
  onSelectRef.current = onSelect;
  countsRef.current = counts;
  buildingsRef.current = buildings;
  entriesRef.current = entriesByBuilding;
  carportsRef.current = carports;
  carportAvailRef.current = carportAvail;
  selectedCarportRef.current = selectedCarport;
  onSelectCarportRef.current = onSelectCarport;

  // Rotate a [lng, lat] corner around a center by `deg` degrees clockwise
  function rotateCorner(cx: number, cy: number, px: number, py: number, deg: number): [number, number] {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = px - cx;
    const dy = py - cy;
    return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
  }

  // Carport footprints — narrow rectangle rotated per-building bearing
  function carportGeoJSON(sel: string | null): GeoJSON.FeatureCollection {
    const hw = 0.00012;   // half-width  (long axis)
    const hh = 0.000055;  // half-height (short axis)
    return {
      type: "FeatureCollection",
      features: carportsRef.current.map((c) => {
        const avail = carportAvailRef.current[c.code];
        const hasAvailable = avail ? avail.available > 0 : true;
        const isSelected = sel === c.code;
        const deg = c.bearing ?? 0;
        const corners: [number, number][] = [
          [c.lng - hw, c.lat - hh],
          [c.lng + hw, c.lat - hh],
          [c.lng + hw, c.lat + hh],
          [c.lng - hw, c.lat + hh],
        ].map(([px, py]) => rotateCorner(c.lng, c.lat, px, py, deg));
        return {
          type: "Feature" as const,
          geometry: {
            type: "Polygon",
            coordinates: [[...corners, corners[0]]],
          },
          properties: {
            code: c.code,
            selected: isSelected ? 1 : 0,
            hasAvailable: hasAvailable ? 1 : 0,
          },
        };
      }),
    };
  }

  // Merge static OSM footprints with runtime state (selected / counts)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function annotateGeoJSON(base: any, sel: string | null): GeoJSON.FeatureCollection {
    const byCode: Record<string, Building> = {};
    for (const b of buildingsRef.current) byCode[b.code] = b;

    // codes covered by static footprints
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coveredCodes = new Set((base.features as any[]).map((f: any) => f.properties.code));

    // fallback squares for any building not in static file
    const extras: GeoJSON.Feature[] = buildingsRef.current
      .filter((b) => !coveredCodes.has(b.code) && (b.lat !== 0 || b.lng !== 0))
      .map((b) => ({
        type: "Feature" as const,
        geometry: squareFootprint(b.lat, b.lng),
        properties: { code: b.code },
      }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allFeatures = [...(base.features as any[]), ...extras];

    return {
      type: "FeatureCollection",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      features: allFeatures.map((f: any) => {
        const code: string = f.properties.code;
        const c = countsRef.current[code];
        const hasEntries = c && (c.vacant > 0 || c.notice > 0);
        const isSelected = sel === code;
        return {
          ...f,
          properties: {
            ...f.properties,
            selected: isSelected ? 1 : 0,
            hasEntries: hasEntries ? 1 : 0,
            height: isSelected ? 30 : hasEntries ? 18 : 12,
          },
        };
      }),
    };
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const maplibregl = require("maplibre-gl") as typeof import("maplibre-gl");

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: CENTER,
      zoom: 16.2,
      pitch: 30,
      bearing: -15,
    });

    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: "270px",
    });
    popupRef.current = popup;

    map.on("load", async () => {
      // Remove any OSM fill-extrusion layers from positron (keep map flat)
      for (const layer of map.getStyle().layers) {
        if (layer.type === "fill-extrusion") {
          try { map.removeLayer(layer.id); } catch { /* skip */ }
        }
      }

      // Load pre-built OSM footprints
      const res = await fetch("/complex-footprints.json");
      const base = await res.json();

      map.addSource(COMPLEX_SOURCE, {
        type: "geojson",
        data: annotateGeoJSON(base, selectedRef.current),
      });

      // 3D extrusion on satellite
      map.addLayer({
        id: COMPLEX_FILL,
        type: "fill-extrusion",
        source: COMPLEX_SOURCE,
        paint: {
          "fill-extrusion-color": [
            "case",
            ["==", ["get", "selected"], 1],   "rgba(255,210,80,1)",
            ["==", ["get", "hasEntries"], 1],  "rgba(120,210,160,1)",
            "rgba(180,210,255,1)",
          ],
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.88,
          "fill-extrusion-vertical-gradient": true,
        },
      });

      // Crisp outline
      map.addLayer({
        id: COMPLEX_OUTLINE,
        type: "line",
        source: COMPLEX_SOURCE,
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "selected"], 1], "rgba(255,230,100,1)",
            "rgba(255,255,255,0.5)",
          ],
          "line-width": [
            "case",
            ["==", ["get", "selected"], 1], 2.5,
            1,
          ],
        },
      });

      // ── Carport layer ─────────────────────────────────────────────────────
      map.addSource(CARPORT_SOURCE, {
        type: "geojson",
        data: carportGeoJSON(selectedCarportRef.current),
      });

      map.addLayer({
        id: CARPORT_FILL,
        type: "fill-extrusion",
        source: CARPORT_SOURCE,
        paint: {
          "fill-extrusion-color": [
            "case",
            ["==", ["get", "selected"], 1],      "rgba(160,120,255,1)",
            ["==", ["get", "hasAvailable"], 1],   "rgba(80,50,140,0.95)",
            "rgba(50,30,90,0.85)",
          ],
          "fill-extrusion-height": [
            "case",
            ["==", ["get", "selected"], 1], 8,
            5,
          ],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.9,
          "fill-extrusion-vertical-gradient": true,
        },
      });

      map.addLayer({
        id: CARPORT_OUTLINE,
        type: "line",
        source: CARPORT_SOURCE,
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "selected"], 1], "rgba(220,190,255,1)",
            "rgba(100,70,180,0.7)",
          ],
          "line-width": [
            "case",
            ["==", ["get", "selected"], 1], 2.5,
            1,
          ],
        },
      });

      map.on("click", CARPORT_FILL, (e) => {
        if (!e.features?.length) return;
        e.originalEvent.stopPropagation();
        const code = e.features[0].properties.code as string;
        onSelectCarportRef.current(selectedCarportRef.current === code ? null : code);
      });

      map.on("mouseenter", CARPORT_FILL, () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", CARPORT_FILL, () => { map.getCanvas().style.cursor = ""; });
      // ─────────────────────────────────────────────────────────────────────

      map.on("click", COMPLEX_FILL, (e) => {
        if (!e.features?.length) return;
        e.originalEvent.stopPropagation();
        const code = e.features[0].properties.code as string;
        onSelectRef.current(selectedRef.current === code ? null : code);
      });

      // Click anywhere outside a building → deselect + close popup
      map.on("click", (e) => {
        const hits = map.queryRenderedFeatures(e.point, { layers: [COMPLEX_FILL, CARPORT_FILL] });
        if (!hits.length) {
          onSelectRef.current(null);
          onSelectCarportRef.current(null);
          popupRef.current?.remove();
        }
      });

      map.on("mouseenter", COMPLEX_FILL, () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", COMPLEX_FILL, () => { map.getCanvas().style.cursor = ""; });

      // Store base for later updates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any)._complexBase = base;
    });

    mapRef.current = map;

    return () => {
      popup.remove();
      map.remove();
      mapRef.current = null;
      popupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildings]);

  // Update carport layer when availability or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cpSrc = map.getSource(CARPORT_SOURCE) as any;
    if (cpSrc) cpSrc.setData(carportGeoJSON(selectedCarport));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCarport, carportAvail]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function applySelection() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const base = (map as any)._complexBase;
      if (!base) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const src = map.getSource(COMPLEX_SOURCE) as any;
      if (src) src.setData(annotateGeoJSON(base, selected));

      const popup = popupRef.current;

      if (selected) {
        const b = buildings.find((x) => x.code === selected);
        if (b) {
          map.flyTo({ center: [b.lng, b.lat], zoom: 18, pitch: 45, bearing: -15, duration: 800 });
          if (popup) {
            popup
              .setLngLat([b.lng, b.lat])
              .setHTML(buildPopupHTML(b))
              .addTo(map);
          }
        }
      } else {
        map.flyTo({ center: CENTER, zoom: 16.2, pitch: 30, bearing: -15, duration: 700 });
        if (popup) popup.remove();
      }
    }

    if (map.isStyleLoaded()) {
      applySelection();
    } else {
      map.once("idle", applySelection);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, counts, entriesByBuilding]);

  return (
    <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {/* Legend */}
      <div style={{
        position: "absolute", bottom: "12px", left: "12px",
        display: "flex", alignItems: "center", gap: "12px",
        background: "rgba(13,26,18,0.72)", backdropFilter: "blur(6px)",
        borderRadius: "6px", padding: "6px 12px",
        fontSize: "0.72rem", color: "rgba(255,255,255,0.75)",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(180,210,255,0.9)", display: "inline-block" }} />
          No entries
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(255,210,80,0.9)", display: "inline-block" }} />
          Selected
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(80,50,140,0.95)", display: "inline-block" }} />
          Carport
        </span>
        <span style={{ opacity: 0.5 }}>Drag · Scroll to zoom</span>
      </div>
    </div>
  );
}
