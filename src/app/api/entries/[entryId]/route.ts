import { NextResponse } from "next/server";
import { getEntryDetail } from "@/mock/mock-data";

interface Context {
  params: Promise<{ entryId: string }>;
}

export async function GET(_: Request, context: Context) {
  const { entryId } = await context.params;
  return NextResponse.json(getEntryDetail(entryId));
}
