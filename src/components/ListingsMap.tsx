"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

type Unit = {
  slug: string;
  address: string;
  unit: string;
  city: string;
  price: string;
  badge: string;
  lat: number;
  lng: number;
};

export default function ListingsMap({ units, activeSlug }: { units: Unit[]; activeSlug: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerMapRef = useRef<Record<string, Marker>>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");

    const map = L.map(containerRef.current, {
      center: [33.7919, -84.3022],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    const makeIcon = (size: number, glow: boolean) =>
      L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;background:rgb(201,168,76);border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:${glow ? "0 6px 24px rgba(201,168,76,0.7)" : "0 4px 14px rgba(0,0,0,0.45)"};"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -(size + 4)],
      });

    const normalIcon = makeIcon(30, false);

    units.forEach((unit) => {
      const marker = L.marker([unit.lat, unit.lng], { icon: normalIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:160px;padding:4px 0">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#111">${unit.address}</div>
            <div style="font-size:13px;color:#666;margin-bottom:8px">${unit.unit} · ${unit.city}</div>
            <div style="font-size:14px;color:rgb(150,120,40);font-weight:700">${unit.price} / mo</div>
            <div style="font-size:13px;color:#999;margin-top:2px;letter-spacing:0.05em">${unit.badge}</div>
          </div>
        `);
      markerMapRef.current[unit.slug] = marker;
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerMapRef.current = {};
    };
  }, [units]);

  // React to activeSlug changes
  useEffect(() => {
    if (!mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");

    const makeIcon = (size: number, glow: boolean) =>
      L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;background:rgb(201,168,76);border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:${glow ? "0 6px 24px rgba(201,168,76,0.7)" : "0 4px 14px rgba(0,0,0,0.45)"};"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -(size + 4)],
      });

    const normalIcon = makeIcon(30, false);
    const activeIcon = makeIcon(40, true);

    Object.entries(markerMapRef.current).forEach(([slug, marker]) => {
      marker.setIcon(slug === activeSlug ? activeIcon : normalIcon);
    });

    if (activeSlug && markerMapRef.current[activeSlug]) {
      const unit = units.find((u) => u.slug === activeSlug);
      if (unit) mapRef.current.flyTo([unit.lat, unit.lng], 17, { duration: 0.8 });
    } else {
      mapRef.current.flyTo([33.7919, -84.3022], 14, { duration: 0.8 });
    }
  }, [activeSlug, units]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}
