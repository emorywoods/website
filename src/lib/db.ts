import { Pool } from "pg";

let _pool: Pool | null = null;
export function pool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
  }
  return _pool;
}

export type EntryKind = "vacant" | "notice";

export interface DashboardEntry {
  id: number;
  kind: EntryKind;
  building: string;
  apt_number: string;
  unit_type: string;
  unit_condition: string;
  rent: string;
  notes: string;
  move_in_date: string | null;
  notice_date: string | null;
  move_out_date: string | null;
  maintenance_needed: string | null;
  created_at: string;
}

export async function ensureTable() {
  await pool().query(`
    CREATE TABLE IF NOT EXISTS dashboard_entries (
      id              SERIAL PRIMARY KEY,
      kind            TEXT NOT NULL,
      building        TEXT NOT NULL DEFAULT '',
      apt_number      TEXT NOT NULL,
      unit_type       TEXT NOT NULL DEFAULT '',
      unit_condition  TEXT NOT NULL DEFAULT '',
      rent            TEXT NOT NULL DEFAULT '',
      notes           TEXT NOT NULL DEFAULT '',
      move_in_date    DATE,
      notice_date     DATE,
      move_out_date   DATE,
      maintenance_needed TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  // Idempotent migration: add building column to existing tables
  await pool().query(`
    ALTER TABLE dashboard_entries ADD COLUMN IF NOT EXISTS building TEXT NOT NULL DEFAULT ''
  `);
}

export async function getEntries(kind?: EntryKind): Promise<DashboardEntry[]> {
  await ensureTable();
  if (kind) {
    const { rows } = await pool().query<DashboardEntry>(
      "SELECT * FROM dashboard_entries WHERE kind = $1 ORDER BY created_at DESC",
      [kind]
    );
    return rows;
  }
  const { rows } = await pool().query<DashboardEntry>(
    "SELECT * FROM dashboard_entries ORDER BY created_at DESC"
  );
  return rows;
}

export async function addEntry(data: Omit<DashboardEntry, "id" | "created_at">): Promise<DashboardEntry> {
  await ensureTable();
  const { rows } = await pool().query<DashboardEntry>(
    `INSERT INTO dashboard_entries
      (kind, building, apt_number, unit_type, unit_condition, rent, notes, move_in_date, notice_date, move_out_date, maintenance_needed)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      data.kind, data.building ?? "", data.apt_number, data.unit_type, data.unit_condition,
      data.rent, data.notes,
      data.move_in_date ?? null, data.notice_date ?? null,
      data.move_out_date ?? null, data.maintenance_needed ?? null,
    ]
  );
  return rows[0];
}

export async function deleteEntry(id: number): Promise<void> {
  await ensureTable();
  await pool().query("DELETE FROM dashboard_entries WHERE id = $1", [id]);
}
