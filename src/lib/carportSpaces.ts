import { pool } from "./db";
import { CARPORTS, seededSpaceNumbers } from "./carports";
import { buildingByCode } from "./buildings";

export type CarportAssignedTo = "tenant" | "office" | "shop" | "external" | null;

export interface CarportSpace {
  id: number;
  building: string;
  space_number: string;
  assigned_to: CarportAssignedTo;
  unit_id: number | null;
  rental_date: string | null;
  rate: string;
  notes: string;
  external_name: string;
  external_phone: string;
  updated_at: string;
  // derived from join — not stored columns
  tenant_name: string;
  tenant_unit: string;
  tenant_address: string;
}

export type CarportPatch = {
  assigned_to?: CarportAssignedTo;
  unit_id?: number | null;
  rental_date?: string | null;
  rate?: string;
  notes?: string;
  external_name?: string;
  external_phone?: string;
};

let tableReady: Promise<void> | null = null;
// Bump this string to force re-run of table setup (e.g. after schema/seed changes)
const TABLE_VERSION = "v4-external";

export function ensureCarportsTable(): Promise<void> {
  if (tableReady) return tableReady;
  void TABLE_VERSION; // tie cache to version string
  tableReady = (async () => {
    await pool().query(`
      CREATE TABLE IF NOT EXISTS carport_spaces (
        id            SERIAL PRIMARY KEY,
        building      TEXT NOT NULL,
        space_number  TEXT NOT NULL,
        unit_id       INTEGER,
        rental_date   DATE,
        rate          TEXT NOT NULL DEFAULT '',
        notes         TEXT NOT NULL DEFAULT '',
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (building, space_number)
      )
    `);
    // Remove legacy C1-style space numbers seeded by the old implementation
    await pool().query(`DELETE FROM carport_spaces WHERE space_number ~ '^C[0-9]+$'`);
    // Add assigned_to column if missing
    await pool().query(`ALTER TABLE carport_spaces ADD COLUMN IF NOT EXISTS assigned_to TEXT`);
    await pool().query(`ALTER TABLE carport_spaces ADD COLUMN IF NOT EXISTS external_name TEXT NOT NULL DEFAULT ''`);
    await pool().query(`ALTER TABLE carport_spaces ADD COLUMN IF NOT EXISTS external_phone TEXT NOT NULL DEFAULT ''`);

    // Add FK if missing (idempotent via DO NOTHING on constraint name collision)
    await pool().query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'carport_spaces_unit_id_fkey'
            AND table_name = 'carport_spaces'
        ) THEN
          ALTER TABLE carport_spaces
            ADD CONSTRAINT carport_spaces_unit_id_fkey
            FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);
  })();
  return tableReady;
}

export async function seedCarportBuilding(code: string, spaces: number[]): Promise<void> {
  await ensureCarportsTable();
  const nums = seededSpaceNumbers(spaces);
  if (nums.length === 0) return;
  const values = nums.map((_, i) => `($1, $${i + 2})`).join(", ");
  await pool().query(
    `INSERT INTO carport_spaces (building, space_number) VALUES ${values} ON CONFLICT (building, space_number) DO NOTHING`,
    [code, ...nums]
  );
}

export async function getCarportSpaces(building?: string): Promise<CarportSpace[]> {
  await ensureCarportsTable();

  const whereClause = building ? "WHERE cs.building = $1" : "";
  const params = building ? [building] : [];

  const { rows } = await pool().query<{
    id: number;
    building: string;
    space_number: string;
    assigned_to: string | null;
    unit_id: number | null;
    rental_date: string | null;
    rate: string;
    notes: string;
    external_name: string;
    external_phone: string;
    updated_at: string;
    tenant_name: string | null;
    tenant_building: string | null;
    tenant_apt: string | null;
  }>(
    `SELECT
       cs.id, cs.building, cs.space_number, cs.assigned_to, cs.unit_id,
       cs.rental_date, cs.rate, cs.notes, cs.external_name, cs.external_phone, cs.updated_at,
       u.tenant_name,
       u.building AS tenant_building,
       u.apt_number AS tenant_apt
     FROM carport_spaces cs
     LEFT JOIN units u ON u.id = cs.unit_id
     ${whereClause}
     ORDER BY cs.building ASC, cs.space_number ASC`,
    params
  );

  return rows.map((r) => {
    const bld = r.tenant_building ? buildingByCode(r.tenant_building) : undefined;
    return {
      id: r.id,
      building: r.building,
      space_number: r.space_number,
      assigned_to: (r.assigned_to ?? null) as CarportAssignedTo,
      unit_id: r.unit_id,
      rental_date: r.rental_date,
      rate: r.rate,
      notes: r.notes,
      external_name: r.external_name ?? "",
      external_phone: r.external_phone ?? "",
      updated_at: r.updated_at,
      tenant_name: r.tenant_name ?? "",
      tenant_unit: r.tenant_building && r.tenant_apt ? `${r.tenant_building} ${r.tenant_apt}` : "",
      tenant_address: bld?.address ?? "",
    };
  });
}

export async function updateCarportSpace(id: number, patch: CarportPatch): Promise<CarportSpace> {
  await ensureCarportsTable();
  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  if ("assigned_to" in patch) {
    sets.push(`assigned_to = $${idx++}`);
    vals.push(patch.assigned_to ?? null);
  }
  if ("unit_id" in patch) {
    sets.push(`unit_id = $${idx++}`);
    vals.push(patch.unit_id ?? null);
  }
  if ("rental_date" in patch) {
    sets.push(`rental_date = $${idx++}`);
    vals.push(patch.rental_date || null);
  }
  if ("rate" in patch) {
    sets.push(`rate = $${idx++}`);
    vals.push(patch.rate ?? "");
  }
  if ("notes" in patch) {
    sets.push(`notes = $${idx++}`);
    vals.push(patch.notes ?? "");
  }
  if ("external_name" in patch) {
    sets.push(`external_name = $${idx++}`);
    vals.push(patch.external_name ?? "");
  }
  if ("external_phone" in patch) {
    sets.push(`external_phone = $${idx++}`);
    vals.push(patch.external_phone ?? "");
  }

  if (sets.length === 0) {
    const spaces = await getCarportSpaces();
    return spaces.find((s) => s.id === id)!;
  }

  sets.push(`updated_at = NOW()`);
  vals.push(id);

  await pool().query(
    `UPDATE carport_spaces SET ${sets.join(", ")} WHERE id = $${idx}`,
    vals
  );

  // Re-fetch with join to get derived fields
  const all = await getCarportSpaces();
  return all.find((s) => s.id === id)!;
}

export async function seedAllCarports(): Promise<void> {
  for (const c of CARPORTS) {
    await seedCarportBuilding(c.code, c.spaces);
  }
}
