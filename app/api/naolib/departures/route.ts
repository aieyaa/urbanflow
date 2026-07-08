import { NextRequest, NextResponse } from "next/server";
import { getStopDepartures } from "@/lib/naolib/siri";

export async function GET(request: NextRequest) {
  const stopId = request.nextUrl.searchParams.get("stopId");

  if (!stopId) {
    return NextResponse.json({ departures: [] });
  }

  const departures = await getStopDepartures(stopId);
  return NextResponse.json({ departures });
}
