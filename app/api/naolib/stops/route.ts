import { NextRequest, NextResponse } from "next/server";
import { searchStops } from "@/lib/naolib/stops";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const stops = await searchStops(query);
  return NextResponse.json({ stops });
}
