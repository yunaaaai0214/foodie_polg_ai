export type MealType = "breakfast" | "lunch" | "tea" | "dinner" | "snack";

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  streakDays: number;
}

export interface PhotoAsset {
  id: string;
  entryId: string;
  url: string;
  thumbUrl: string;
  takenAt: string;
  edited: boolean;
  sizeLabel: string;
}

export interface FoodEntry {
  id: string;
  userId: string;
  date: string;
  mealType: MealType;
  note?: string;
  coverPhotoId?: string;
  photoIds: string[];
}

export interface AiGeneration {
  id: string;
  entryId: string;
  style: string;
  title: string;
  caption: string;
  shortCaption?: string;
  detailedCaption?: string;
  hashtags: string[];
  summaryLine?: string;
  summaryImageUrl: string;
  createdAt: string;
}

export interface CalendarDay {
  date: string;
  hasCheckin: boolean;
  mealCount: number;
  coverThumb?: string;
}

export type FilterPreset = "original" | "warm" | "fresh" | "retro";

export interface EditorState {
  ratio: "1:1" | "4:5" | "3:4" | "9:16";
  filter: FilterPreset;
  filterStrength: number;
  sticker?: string;
  textOverlay?: string;
}

export interface EntryDetail {
  entry: FoodEntry;
  photos: PhotoAsset[];
}

export interface AiGenerationRequest {
  style: string;
  tone: string;
  platform: string;
  note?: string;
}

export type AiStyle = "小红书" | "Instagram" | "治愈风" | "幽默风" | "精致探店风";

export interface AiCopyRequest {
  date: string;
  mealTime: MealType;
  imageDescription: string;
  style: AiStyle;
}

export interface AiCopyResult {
  title: string;
  shortCaption: string;
  detailedCaption: string;
  hashtags: string[];
  summaryLine: string;
}

export interface PlogPhoto {
  id: string;
  userId: string;
  date: string;
  mealType: MealType;
  url: string;
  thumbUrl: string;
  takenAt: string;
  sizeLabel: string;
  edited: boolean;
  editorState?: EditorState;
  createdAt: string;
  updatedAt: string;
  source: "seed" | "upload";
}

export interface PlogState {
  version: number;
  lastUpdatedAt: string;
  user: User;
  photos: PlogPhoto[];
}
