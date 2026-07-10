import { NextResponse } from "next/server";
import { getBikeAvailability } from "@/lib/velo/nantes";

export async function GET() {
  const stations = await getBikeAvailability();
  return NextResponse.json({ stations });
}
