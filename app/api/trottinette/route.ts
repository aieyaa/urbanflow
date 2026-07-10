import { NextResponse } from "next/server";
import { getScooterStations } from "@/lib/trottinette/nantes";

export async function GET() {
  const stations = await getScooterStations();
  return NextResponse.json({ stations });
}
