import { NextResponse } from "next/server";
import { getTrafficSegments } from "@/lib/trafic/nantes";

export async function GET() {
  const segments = await getTrafficSegments();
  return NextResponse.json({ segments });
}
