import { NextRequest, NextResponse } from "next/server";
import { getUnits, seedBuilding, updateUnit, type UnitPatch } from "@/lib/units";
import { BUILDINGS, buildingByCode } from "@/lib/buildings";

const DASHBOARD_CODE = process.env.DASHBOARD_CODE ?? "Decatur01";

function authorized(req: NextRequest): boolean {
  return req.headers.get("x-access-code") === DASHBOARD_CODE;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const building = req.nextUrl.searchParams.get("building");
    if (building) {
      const bld = buildingByCode(building);
      if (bld) await seedBuilding(bld.code, bld.unitCount);
    } else {
      // Seed all buildings so the full roster is always present
      for (const bld of BUILDINGS) {
        await seedBuilding(bld.code, bld.unitCount);
      }
    }
    const units = await getUnits(building ?? undefined);
    return NextResponse.json({ units });
  } catch (err) {
    console.error("GET /api/units error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  try {
    const body = (await req.json()) as UnitPatch;
    const unit = await updateUnit(id, body);
    return NextResponse.json({ unit });
  } catch (err) {
    console.error("PATCH /api/units error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
