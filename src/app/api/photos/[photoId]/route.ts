import { NextResponse } from "next/server";
import { getPhotoById } from "@/mock/mock-data";

interface Context {
  params: Promise<{ photoId: string }>;
}

export async function GET(_: Request, context: Context) {
  const { photoId } = await context.params;
  return NextResponse.json({ photo: getPhotoById(photoId) });
}
