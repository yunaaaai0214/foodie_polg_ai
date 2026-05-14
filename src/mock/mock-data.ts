import {
  AiGeneration,
  CalendarDay,
  EntryDetail,
  FoodEntry,
  PhotoAsset,
  User
} from "@/lib/types";

export const mockUser: User = {
  id: "u1",
  nickname: "Miya",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  streakDays: 6
};

export const mealLabelMap = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  tea: "下午茶",
  snack: "加餐"
} as const;

export const mockPhotos: PhotoAsset[] = [
  {
    id: "p1",
    entryId: "e1",
    url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80",
    takenAt: "12:23",
    edited: true,
    sizeLabel: "2.8 MB"
  },
  {
    id: "p2",
    entryId: "e1",
    url: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=600&q=80",
    takenAt: "12:25",
    edited: false,
    sizeLabel: "2.1 MB"
  },
  {
    id: "p3",
    entryId: "e1",
    url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80",
    takenAt: "12:27",
    edited: true,
    sizeLabel: "3.0 MB"
  },
  {
    id: "p4",
    entryId: "e2",
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
    takenAt: "19:03",
    edited: false,
    sizeLabel: "1.9 MB"
  },
  {
    id: "p5",
    entryId: "e3",
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
    takenAt: "08:20",
    edited: true,
    sizeLabel: "2.5 MB"
  }
];

export const mockEntries: FoodEntry[] = [
  {
    id: "e1",
    userId: "u1",
    date: "2026-05-12",
    mealType: "lunch",
    note: "今天的咖喱饭超香，炸鸡外皮很脆。",
    coverPhotoId: "p1",
    photoIds: ["p1", "p2", "p3"]
  },
  {
    id: "e2",
    userId: "u1",
    date: "2026-05-11",
    mealType: "dinner",
    note: "和朋友一起吃烧烤。",
    coverPhotoId: "p4",
    photoIds: ["p4"]
  },
  {
    id: "e3",
    userId: "u1",
    date: "2026-05-10",
    mealType: "breakfast",
    note: "牛油果沙拉配冰美式。",
    coverPhotoId: "p5",
    photoIds: ["p5"]
  }
];

export const mockAiGenerations: AiGeneration[] = [
  {
    id: "g1",
    entryId: "e1",
    style: "治愈日常",
    title: "中午这一口，幸福值拉满",
    caption:
      "今天给自己安排了超满足的一顿午餐：咖喱饭香气很浓，炸鸡酥脆到会掉渣，配上一杯清爽气泡饮，工作日也能有小确幸。",
    shortCaption: "咖喱饭 + 炸鸡，平凡工作日也能吃出幸福感。",
    detailedCaption:
      "今天的午餐真的很争气：咖喱饭香气浓郁，炸鸡酥脆不油腻，再配清爽气泡饮，整个人都被治愈了。忙碌里也要认真吃饭，才有继续发光的力气。",
    hashtags: ["#美食plog", "#今日份午餐", "#打工人午餐", "#FoodieDiary", "#生活碎片"],
    summaryLine: "认真吃饭，就是给生活加糖。",
    summaryImageUrl: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=80",
    createdAt: "2026-05-12T13:10:00Z"
  }
];

export const mockCalendar: CalendarDay[] = [
  { date: "2026-05-01", hasCheckin: false, mealCount: 0 },
  { date: "2026-05-02", hasCheckin: true, mealCount: 1, coverThumb: mockPhotos[4].thumbUrl },
  { date: "2026-05-03", hasCheckin: true, mealCount: 2, coverThumb: mockPhotos[3].thumbUrl },
  { date: "2026-05-04", hasCheckin: false, mealCount: 0 },
  { date: "2026-05-05", hasCheckin: true, mealCount: 1, coverThumb: mockPhotos[2].thumbUrl },
  { date: "2026-05-06", hasCheckin: false, mealCount: 0 },
  { date: "2026-05-07", hasCheckin: true, mealCount: 1, coverThumb: mockPhotos[1].thumbUrl },
  { date: "2026-05-08", hasCheckin: false, mealCount: 0 },
  { date: "2026-05-09", hasCheckin: true, mealCount: 1, coverThumb: mockPhotos[0].thumbUrl },
  { date: "2026-05-10", hasCheckin: true, mealCount: 1, coverThumb: mockPhotos[4].thumbUrl },
  { date: "2026-05-11", hasCheckin: true, mealCount: 1, coverThumb: mockPhotos[3].thumbUrl },
  { date: "2026-05-12", hasCheckin: true, mealCount: 1, coverThumb: mockPhotos[0].thumbUrl }
];

export function getEntryById(entryId: string): FoodEntry {
  return mockEntries.find((entry) => entry.id === entryId) ?? mockEntries[0];
}

export function getPhotosByEntry(entryId: string): PhotoAsset[] {
  return mockPhotos.filter((photo) => photo.entryId === entryId);
}

export function getPhotoById(photoId: string): PhotoAsset {
  return mockPhotos.find((photo) => photo.id === photoId) ?? mockPhotos[0];
}

export function getGenerationByEntry(entryId: string): AiGeneration {
  return mockAiGenerations.find((item) => item.entryId === entryId) ?? mockAiGenerations[0];
}

export function getEntryDetail(entryId: string): EntryDetail {
  const entry = getEntryById(entryId);
  return { entry, photos: getPhotosByEntry(entry.id) };
}

export function generateMockAiContent(entryId: string, style: string, tone: string, platform: string, note?: string): AiGeneration {
  const seedTitle = [
    "一口入魂的今日份满足",
    "普通工作日的高光午餐",
    "这顿真的值得单独发一条"
  ];

  const randomTitle = seedTitle[Math.floor(Math.random() * seedTitle.length)];
  const detail = note ? `补充：${note}` : "今天记录的是一份让人心情很好的日常美食。";

  return {
    id: `g-${Date.now()}`,
    entryId,
    style,
    title: `${randomTitle} · ${style}`,
    caption: `平台：${platform}，语气：${tone}。${detail}`,
    shortCaption: `平台：${platform}，${style}风格的一口满足。`,
    detailedCaption: `平台：${platform}，语气：${tone}。${detail}`.slice(0, 150),
    hashtags: ["#美食plog", "#今日份好吃", "#lifestyle", "#FoodieDiary", "#小确幸"],
    summaryLine: "把日常吃成值得纪念的瞬间。",
    summaryImageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80",
    createdAt: new Date().toISOString()
  };
}
