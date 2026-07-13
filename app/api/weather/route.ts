import { NextResponse } from "next/server";
import { getCurrentWeather } from "@/lib/weather/open-meteo";

export async function GET() {
  const weather = await getCurrentWeather();
  return NextResponse.json({ weather });
}
