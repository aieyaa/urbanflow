import { NextResponse } from "next/server";
import { getCarpoolSpots } from "@/lib/covoiturage/nantes";

export async function GET() {
  const spots = await getCarpoolSpots();
  return NextResponse.json({ spots });
}
