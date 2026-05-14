import { mockEntries, mockPhotos, mockUser } from "@/mock/mock-data";
import { MealType, PlogPhoto, PlogState } from "@/lib/types";

function normalizeMealType(mealType: MealType): MealType {
  return mealType;
}

function inferDateFromEntry(entryId: string): string {
  const hit = mockEntries.find((entry) => entry.id === entryId);
  return hit?.date ?? "2026-05-12";
}

function inferMealFromEntry(entryId: string): MealType {
  const hit = mockEntries.find((entry) => entry.id === entryId);
  return normalizeMealType(hit?.mealType ?? "lunch");
}

export function createSeedPlogPhotos(): PlogPhoto[] {
  const now = new Date().toISOString();
  return mockPhotos.map((photo): PlogPhoto => ({
    id: photo.id,
    userId: mockUser.id,
    date: inferDateFromEntry(photo.entryId),
    mealType: inferMealFromEntry(photo.entryId),
    url: photo.url,
    thumbUrl: photo.thumbUrl,
    takenAt: photo.takenAt,
    sizeLabel: photo.sizeLabel,
    edited: photo.edited,
    createdAt: now,
    updatedAt: now,
    source: "seed"
  }));
}

export function createSeedPlogState(): PlogState {
  return {
    version: 1,
    lastUpdatedAt: new Date().toISOString(),
    user: mockUser,
    photos: createSeedPlogPhotos()
  };
}
