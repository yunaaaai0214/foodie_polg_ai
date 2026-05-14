import { NextResponse } from "next/server";
import { buildStateObjectKey, createOssClient, isOssConfigured } from "@/lib/server/oss-client";

export const runtime = "nodejs";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function decodeContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (content instanceof Buffer) {
    return content.toString("utf8");
  }

  if (content && typeof content === "object" && "toString" in content) {
    return String(content);
  }

  return "";
}

export async function GET(request: Request) {
  if (!isOssConfigured()) {
    return NextResponse.json({ error: "OSS is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key." }, { status: 400 });
  }

  const client = createOssClient();
  const objectKey = buildStateObjectKey(key);

  try {
    const object = await client.get(objectKey);
    const text = decodeContent(object.content);
    const data = text ? (JSON.parse(text) as JsonValue) : null;
    return NextResponse.json({ data });
  } catch (error) {
    const status = (error as { status?: number; code?: string }).status;
    const code = (error as { status?: number; code?: string }).code;
    if (status === 404 || code === "NoSuchKey") {
      return NextResponse.json({ data: null });
    }

    const message = error instanceof Error ? error.message : "Failed to read state from OSS.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!isOssConfigured()) {
    return NextResponse.json({ error: "OSS is not configured." }, { status: 503 });
  }

  const body = (await request.json()) as { key?: string; data?: JsonValue };
  const key = body.key?.trim();

  if (!key) {
    return NextResponse.json({ error: "Missing key." }, { status: 400 });
  }

  const client = createOssClient();
  const objectKey = buildStateObjectKey(key);

  try {
    await client.put(objectKey, Buffer.from(JSON.stringify(body.data ?? null), "utf8"), {
      mime: "application/json; charset=utf-8"
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to write state to OSS.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
