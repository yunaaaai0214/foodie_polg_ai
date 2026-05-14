import { NextResponse } from "next/server";
import { mockCalendar } from "@/mock/mock-data";

export async function GET() {
  return NextResponse.json({ days: mockCalendar });
}
