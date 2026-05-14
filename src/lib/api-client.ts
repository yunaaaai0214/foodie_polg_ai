import {
  AiCopyRequest,
  AiCopyResult,
  AiGeneration,
  CalendarDay,
  EntryDetail,
  PhotoAsset,
  AiGenerationRequest
} from "@/lib/types";

export async function fetchEntryDetail(entryId: string): Promise<EntryDetail> {
  const response = await fetch(`/api/entries/${entryId}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch entry detail");
  }

  return response.json();
}

export async function fetchPhoto(photoId: string): Promise<PhotoAsset> {
  const response = await fetch(`/api/photos/${photoId}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch photo");
  }

  const data = await response.json();
  return data.photo;
}

export async function fetchCalendar(): Promise<CalendarDay[]> {
  const response = await fetch("/api/calendar", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch calendar");
  }

  const data = await response.json();
  return data.days;
}

export async function fetchAiGeneration(entryId: string): Promise<AiGeneration> {
  const response = await fetch(`/api/ai/${entryId}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch generation");
  }

  const data = await response.json();
  return data.generation;
}

export async function regenerateAiGeneration(entryId: string, payload: AiGenerationRequest): Promise<AiGeneration> {
  const response = await fetch(`/api/ai/${entryId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to generate content");
  }

  const data = await response.json();
  return data.generation;
}

export async function generateAICopy(payload: AiCopyRequest): Promise<AiCopyResult> {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to generate AI copy" }));
    throw new Error(errorData.error || "Failed to generate AI copy");
  }

  const data = await response.json();
  return data.result as AiCopyResult;
}
