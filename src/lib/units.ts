import { pool } from "./db";
import { seededUnitNumbers } from "./buildings";

export type UnitStatus = "occupied" | "vacant" | "notice";

export interface Unit {
  id: number;
  building: string;
  apt_number: string;
  status: UnitStatus;
  tenant_name: string;
  tenant_contact: string;
  unit_type: string;
  unit_condition: string;
  rent: string;
  lease_type: string;
  move_in_date: string | null;
  move_out_date: string | null;
  notice_date: string | null;
  maintenance_needed: string;
  notes: string;
  future_tenant: string;
  future_move_in_date: string | null;
  updated_at: string;
}

export type UnitPatch = Partial<Omit<Unit, "id" | "building" | "apt_number" | "updated_at">>;

// Run once per server process — subsequent calls reuse the same promise
let tableReady: Promise<void> | null = null;

export function ensureUnitsTable(): Promise<void> {
  if (tableReady) return tableReady;
  tableReady = (async () => {
    await pool().query(`
      CREATE TABLE IF NOT EXISTS units (
        id               SERIAL PRIMARY KEY,
        building         TEXT NOT NULL,
        apt_number       TEXT NOT NULL,
        status           TEXT NOT NULL DEFAULT 'occupied',
        tenant_name      TEXT NOT NULL DEFAULT '',
        tenant_contact   TEXT NOT NULL DEFAULT '',
        unit_type        TEXT NOT NULL DEFAULT '',
        unit_condition   TEXT NOT NULL DEFAULT '',
        rent             TEXT NOT NULL DEFAULT '',
        move_in_date     DATE,
        move_out_date    DATE,
        notice_date      DATE,
        lease_type       TEXT NOT NULL DEFAULT '',
        maintenance_needed TEXT NOT NULL DEFAULT '',
        notes            TEXT NOT NULL DEFAULT '',
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (building, apt_number)
      )
    `);
    await Promise.all([
      pool().query(`ALTER TABLE units DROP COLUMN IF EXISTS lease_start`),
      pool().query(`ALTER TABLE units DROP COLUMN IF EXISTS lease_end`),
      pool().query(`ALTER TABLE units ADD COLUMN IF NOT EXISTS lease_type TEXT NOT NULL DEFAULT ''`),
      pool().query(`ALTER TABLE units ADD COLUMN IF NOT EXISTS future_tenant TEXT NOT NULL DEFAULT ''`),
      pool().query(`ALTER TABLE units ADD COLUMN IF NOT EXISTS future_move_in_date DATE`),
    ]);
  })();
  return tableReady;
}

export async function seedBuilding(code: string, count: number): Promise<void> {
  await ensureUnitsTable();
  const nums = seededUnitNumbers(count);
  if (nums.length === 0) return;
  // Single multi-row insert instead of N individual queries
  const values = nums.map((_, i) => `($1, $${i + 2})`).join(", ");
  await pool().query(
    `INSERT INTO units (building, apt_number) VALUES ${values} ON CONFLICT (building, apt_number) DO NOTHING`,
    [code, ...nums]
  );
}

export async function getUnits(building?: string): Promise<Unit[]> {
  await ensureUnitsTable();
  if (building) {
    const { rows } = await pool().query<Unit>(
      "SELECT * FROM units WHERE building = $1 ORDER BY apt_number ASC",
      [building]
    );
    return rows;
  }
  const { rows } = await pool().query<Unit>(
    "SELECT * FROM units ORDER BY building ASC, apt_number ASC"
  );
  return rows;
}

const DATE_FIELDS = new Set(["move_in_date", "move_out_date", "notice_date", "future_move_in_date"]);

export async function updateUnit(id: number, patch: UnitPatch): Promise<Unit> {
  await ensureUnitsTable();
  const allowed: (keyof UnitPatch)[] = [
    "status", "tenant_name", "tenant_contact", "unit_type", "unit_condition",
    "rent", "lease_type", "move_in_date", "move_out_date", "notice_date", "maintenance_needed", "notes",
    "future_tenant", "future_move_in_date",
  ];
  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;
  for (const key of allowed) {
    if (key in patch) {
      sets.push(`${key} = $${idx}`);
      const raw = (patch as Record<string, unknown>)[key];
      vals.push(DATE_FIELDS.has(key) && (raw === "" || raw === null || raw === undefined) ? null : (raw ?? null));
      idx++;
    }
  }
  if (sets.length === 0) {
    const { rows } = await pool().query<Unit>("SELECT * FROM units WHERE id = $1", [id]);
    return rows[0];
  }
  sets.push(`updated_at = NOW()`);
  vals.push(id);
  const { rows } = await pool().query<Unit>(
    `UPDATE units SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
    vals
  );
  return rows[0];
}
