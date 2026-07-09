import { NextRequest, NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/ors/geocode";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lon = Number(request.nextUrl.searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ label: null }, { status: 400 });
  }

  const label = await reverseGeocode(lat, lon);
  return NextResponse.json({ label });
}
