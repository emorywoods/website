import { NextRequest, NextResponse } from "next/server";
import { getEntries, addEntry, deleteEntry, EntryKind } from "@/lib/db";

const DASHBOARD_CODE = process.env.DASHBOARD_CODE ?? "Decatur01";

function authorized(req: NextRequest): boolean {
  return req.headers.get("x-access-code") === DASHBOARD_CODE;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const kind = req.nextUrl.searchParams.get("kind") as EntryKind | null;
    const entries = await getEntries(kind ?? undefined);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { kind, building, apt_number, unit_type, unit_condition, rent, notes, move_in_date, notice_date, move_out_date, maintenance_needed } = body;

  if (!kind || !apt_number) {
    return NextResponse.json({ error: "kind and apt_number required" }, { status: 400 });
  }
  if (kind !== "vacant" && kind !== "notice") {
    return NextResponse.json({ error: "kind must be vacant or notice" }, { status: 400 });
  }

  try {
    const entry = await addEntry({
      kind,
      building: building ?? "",
      apt_number: apt_number ?? "",
      unit_type: unit_type ?? "",
      unit_condition: unit_condition ?? "",
      rent: rent ?? "",
      notes: notes ?? "",
      move_in_date: move_in_date ?? null,
      notice_date: notice_date ?? null,
      move_out_date: move_out_date ?? null,
      maintenance_needed: maintenance_needed ?? null,
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    console.error("POST /api/dashboard error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  try {
    await deleteEntry(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/dashboard error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
