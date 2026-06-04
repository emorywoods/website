"use client";

import { useEffect, useState } from "react";
import AccessGate from "@/components/dashboard/AccessGate";
import Dashboard from "@/components/dashboard/Dashboard";

const STORAGE_KEY = "ew-dash-auth";
const AUTH_VERSION = "v2"; // bump this to force re-login on all devices
const VERSION_KEY = "ew-dash-auth-version";

export default function JrDashboardPage() {
  const [code, setCode] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const version = localStorage.getItem(VERSION_KEY);
    if (version !== AUTH_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, AUTH_VERSION);
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setCode(stored);
    setHydrated(true);
  }, []);

  // Avoid flash before localStorage is read
  if (!hydrated) return null;

  if (!code) {
    return (
      <AccessGate
        onUnlock={(c) => setCode(c)}
      />
    );
  }

  return <Dashboard accessCode={code} />;
}
