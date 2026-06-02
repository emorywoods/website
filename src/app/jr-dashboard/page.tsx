"use client";

import { useEffect, useState } from "react";
import AccessGate from "@/components/dashboard/AccessGate";
import Dashboard from "@/components/dashboard/Dashboard";

const STORAGE_KEY = "ew-dash-auth";

export default function JrDashboardPage() {
  const [code, setCode] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
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
