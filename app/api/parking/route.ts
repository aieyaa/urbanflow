import { NextResponse } from "next/server";
import { getParkingAvailability } from "@/lib/parking/nantes";

export async function GET() {
  const parkings = await getParkingAvailability();
  return NextResponse.json({ parkings });
}
