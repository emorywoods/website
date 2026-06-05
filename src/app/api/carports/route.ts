import { NextRequest, NextResponse } from "next/server";
import { getCarportSpaces, seedAllCarports, updateCarportSpace, type CarportPatch } from "@/lib/carportSpaces";

const DASHBOARD_CODE = process.env.DASHBOARD_CODE ?? "Decatur1";

function authorized(req: NextRequest): boolean {
  return req.headers.get("x-access-code") === DASHBOARD_CODE;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await seedAllCarports();
    const building = req.nextUrl.searchParams.get("building");
    const spaces = await getCarportSpaces(building ?? undefined);
    return NextResponse.json({ spaces });
  } catch (err) {
    console.error("GET /api/carports error:", err);
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
    const body = (await req.json()) as CarportPatch;
    const space = await updateCarportSpace(id, body);
    return NextResponse.json({ space });
  } catch (err) {
    console.error("PATCH /api/carports error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
