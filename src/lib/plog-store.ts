"use client";

import { getLocalStorageJSON, setLocalStorageJSON } from "@/lib/local-storage";
import { MealType, PlogPhoto, PlogState } from "@/lib/types";
import { createSeedPlogState } from "@/lib/plog-seed";

const PLOG_STORAGE_KEY = "foodie.plog.state.v1";

export function loadPlogState(): PlogState {
  return getLocalStorageJSON<PlogState>(PLOG_STORAGE_KEY, createSeedPlogState());
}

export function savePlogState(state: PlogState): void {
  setLocalStorageJSON<PlogState>(PLOG_STORAGE_KEY, {
    ...state,
    lastUpdatedAt: new Date().toISOString()
  });
}

export function ensurePlogState(): PlogState {
  const state = loadPlogState();
  if (!state.photos?.length) {
    const seeded = createSeedPlogState();
    savePlogState(seeded);
    return seeded;
  }

  if (!state.version) {
    const migrated: PlogState = { ...state, version: 1, lastUpdatedAt: new Date().toISOString() };
    savePlogState(migrated);
    return migrated;
  }

  return state;
}

export function updatePlogState(updater: (prev: PlogState) => PlogState): PlogState {
  const prev = ensurePlogState();
  const next = updater(prev);
  savePlogState(next);
  return next;
}

export function appendPhotos(
  payload: Array<{
    userId: string;
    date: string;
    mealType: MealType;
    url: string;
    thumbUrl: string;
    takenAt: string;
    sizeLabel: string;
    source?: "seed" | "upload";
  }>
): PlogState {
  return updatePlogState((prev) => {
    const now = new Date().toISOString();
    const nextPhotos: PlogPhoto[] = payload.map((item, index) => ({
      id: `up-${Date.now()}-${index}`,
      userId: item.userId,
      date: item.date,
      mealType: item.mealType,
      url: item.url,
      thumbUrl: item.thumbUrl,
      takenAt: item.takenAt,
      sizeLabel: item.sizeLabel,
      edited: false,
      createdAt: now,
      updatedAt: now,
      source: item.source ?? "upload"
    }));

    return {
      ...prev,
      photos: [...prev.photos, ...nextPhotos],
      lastUpdatedAt: now
    };
  });
}

export function upsertPhotoEditorState(photoId: string, patch: Partial<PlogPhoto>): PlogState {
  return updatePlogState((prev) => ({
    ...prev,
    photos: prev.photos.map((photo) => {
      if (photo.id !== photoId) {
        return photo;
      }

      return {
        ...photo,
        ...patch,
        updatedAt: new Date().toISOString()
      };
    })
  }));
}

export function resetPlogState(): PlogState {
  const seeded = createSeedPlogState();
  savePlogState(seeded);
  return seeded;
}

export { PLOG_STORAGE_KEY };
