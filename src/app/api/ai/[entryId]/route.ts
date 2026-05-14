import { NextResponse } from "next/server";
import { generateMockAiContent, getGenerationByEntry } from "@/mock/mock-data";
import { AiGenerationRequest } from "@/lib/types";

interface Context {
  params: Promise<{ entryId: string }>;
}

export async function GET(_: Request, context: Context) {
  const { entryId } = await context.params;
  return NextResponse.json({ generation: getGenerationByEntry(entryId) });
}

export async function POST(request: Request, context: Context) {
  const { entryId } = await context.params;
  const body = (await request.json()) as AiGenerationRequest;
  const generation = generateMockAiContent(
    entryId,
    body.style || "治愈日常",
    body.tone || "简短",
    body.platform || "小红书",
    body.note
  );

  return NextResponse.json({ generation });
}
