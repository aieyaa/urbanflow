import { NextRequest, NextResponse } from "next/server";
import { autocompleteAddress } from "@/lib/ors/geocode";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const suggestions = await autocompleteAddress(query);
  return NextResponse.json({ suggestions });
}
