"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarPanel } from "@/components/CalendarPanel";
import { MealSection } from "@/components/MealSection";
import { PhotoCard } from "@/components/PhotoCard";
import { UploadModal } from "@/components/UploadModal";
import { getLocalStorageJSON, setLocalStorageJSON } from "@/lib/local-storage";
import { selectCalendarDays, selectPhotosByDateAndMeal } from "@/lib/plog-selectors";
import { ensurePlogState } from "@/lib/plog-store";
import { MealType, PhotoAsset, PlogPhoto, PlogState } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mealLabelMap, mockUser } from "@/mock/mock-data";

interface MonthlyCheckinItem {
  id: string;
  foodName: string;
  thumbUrl: string;
}

const monthlyCheckinItems: MonthlyCheckinItem[] = [
  { id: "m1", foodName: "咖喱饭", thumbUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80" },
  { id: "m2", foodName: "炸鸡", thumbUrl: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=600&q=80" },
  { id: "m3", foodName: "牛排", thumbUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80" },
  { id: "m4", foodName: "牛油果沙拉", thumbUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80" },
  { id: "m5", foodName: "拉面", thumbUrl: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80" },
  { id: "m6", foodName: "咖喱饭", thumbUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80" },
  { id: "m7", foodName: "烧烤", thumbUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80" },
  { id: "m8", foodName: "炸鸡", thumbUrl: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=600&q=80" }
];

const keywordCloudSlots = [
  { top: "50%", left: "50%", size: 36 },
  { top: "23%", left: "50%", size: 24 },
  { top: "75%", left: "50%", size: 22 },
  { top: "35%", left: "23%", size: 20 },
  { top: "35%", left: "77%", size: 20 },
  { top: "64%", left: "24%", size: 19 },
  { top: "64%", left: "76%", size: 19 },
  { top: "14%", left: "24%", size: 17 },
  { top: "14%", left: "76%", size: 17 }
];

const sideFoodIcons = [
  "🍣", "🍜", "🥐", "🍰", "🍤", "🍕", "🍓", "🍩",
  "🍔", "🥟", "🍛", "🧇", "🍪", "🍒", "🥨", "🧁"
];

const sideColumnCount = 8;

const sideColumns = Array.from({ length: sideColumnCount }, (_, i) => ({
  offsetRem: 2.5 + i * 2.6,
  drift: i * 0.45
}));

const sideColumnsRight = Array.from({ length: sideColumnCount }, (_, i) => ({
  offsetRem: 2.5 + i * 2.6,
  drift: i * 0.45
}));

type MealTabKey = "breakfast" | "lunch" | "tea" | "dinner" | "snack";

const mealTabs: Array<{ key: MealTabKey; label: string }> = [
  { key: "breakfast", label: "早餐" },
  { key: "lunch", label: "午餐" },
  { key: "tea", label: "下午茶" },
  { key: "dinner", label: "晚餐" },
  { key: "snack", label: "夜宵" }
];

function getMealByHour(hour: number): { key: MealType; label: string } {
  if (hour >= 5 && hour < 10) {
    return { key: "breakfast", label: "早餐" };
  }
  if (hour >= 10 && hour < 14) {
    return { key: "lunch", label: "午餐" };
  }
  if (hour >= 14 && hour < 17) {
    return { key: "tea", label: "下午茶" };
  }
  if (hour >= 17 && hour < 22) {
    return { key: "dinner", label: "晚餐" };
  }
  return { key: "snack", label: "加餐" };
}

function toMealTabKey(meal: MealType): MealTabKey {
  if (meal === "breakfast" || meal === "lunch" || meal === "tea" || meal === "dinner" || meal === "snack") {
    return meal;
  }
  return "lunch";
}

function toMealTypeFromTab(tab: MealTabKey): MealType {
  if (tab === "breakfast" || tab === "lunch" || tab === "tea" || tab === "dinner" || tab === "snack") {
    return tab;
  }
  return "lunch";
}

function getWeekdayLabel(date: string): string {
  const localDate = new Date(`${date}T12:00:00`);
  if (Number.isNaN(localDate.getTime())) {
    return "";
  }
  return localDate.toLocaleDateString("en-US", { weekday: "long" });
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDateParts(date: string): { year: number; month: number; day: number } {
  const [yearString, monthString, dayString] = date.split("-");
  return {
    year: Number(yearString),
    month: Number(monthString),
    day: Number(dayString)
  };
}

function getPrevMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
}

function getNextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) {
    return { year: year + 1, month: 1 };
  }
  return { year, month: month + 1 };
}

function toPhotoAsset(photo: PlogPhoto): PhotoAsset {
  return {
    id: photo.id,
    entryId: `${photo.date}:${photo.mealType}`,
    url: photo.url,
    thumbUrl: photo.thumbUrl,
    takenAt: photo.takenAt,
    edited: photo.edited,
    sizeLabel: photo.sizeLabel
  };
}

function seededShuffle<T>(input: T[], seed: number): T[] {
  const list = [...input];
  let s = seed;
  for (let i = list.length - 1; i > 0; i -= 1) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function createSeededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function WaveText({ text, className }: { text: string; className: string }) {
  return (
    <p className={className}>
      {Array.from(text).map((char, index) => {
        if (char === " ") {
          return <span key={`space-${index}`} className="inline-block w-[0.45em]" aria-hidden="true" />;
        }

        return (
          <span
            key={`${char}-${index}`}
            className="float-char inline-block"
            style={{ ["--char-delay" as string]: `${index * 0.08}s` }}
          >
            {char}
          </span>
        );
      })}
    </p>
  );
}

export default function TodayPage() {
  const entryId = "e1";
  const heroDatePickerRef = useRef<HTMLDivElement>(null);
  const [plogState, setPlogState] = useState<PlogState | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [pickedDate, setPickedDate] = useState("2026-05-12");
  const [heroDatePickerOpen, setHeroDatePickerOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealTabKey>(() => toMealTabKey(getMealByHour(new Date().getHours()).key));
  const initialDateParts = parseDateParts("2026-05-12");
  const [heroViewYear, setHeroViewYear] = useState(initialDateParts.year);
  const [heroViewMonth, setHeroViewMonth] = useState(initialDateParts.month);

  useEffect(() => {
    const nextState = ensurePlogState();
    setPlogState(nextState);
  }, []);

  useEffect(() => {
    const storageKey = `foodie.upload.count.${entryId}`;
    const saved = getLocalStorageJSON<number>(storageKey, 0);
    setUploadedCount(saved);
  }, [entryId]);

  useEffect(() => {
    const storageKey = `foodie.upload.count.${entryId}`;
    setLocalStorageJSON<number>(storageKey, uploadedCount);
  }, [entryId, uploadedCount]);

  useEffect(() => {
    const next = parseDateParts(pickedDate);
    if (!Number.isNaN(next.year) && !Number.isNaN(next.month)) {
      setHeroViewYear(next.year);
      setHeroViewMonth(next.month);
    }
  }, [pickedDate]);

  useEffect(() => {
    if (!heroDatePickerOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!heroDatePickerRef.current) {
        return;
      }
      if (!heroDatePickerRef.current.contains(event.target as Node)) {
        setHeroDatePickerOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHeroDatePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [heroDatePickerOpen]);

  const days = useMemo(() => {
    if (!plogState) {
      return [];
    }
    return selectCalendarDays(plogState, 2026, 5);
  }, [plogState]);
  const selected = useMemo(() => days.find((item) => item.date === pickedDate), [days, pickedDate]);
  const currentMeal = useMemo(() => getMealByHour(new Date().getHours()), []);
  const currentMealLabel = mealLabelMap[currentMeal.key];
  const heroWeekday = useMemo(() => getWeekdayLabel(pickedDate), [pickedDate]);
  const mealContentByTab = useMemo(() => {
    const breakfastPhotos = (plogState ? selectPhotosByDateAndMeal(plogState, pickedDate, "breakfast") : []).map(toPhotoAsset);
    const lunchPhotos = (plogState ? selectPhotosByDateAndMeal(plogState, pickedDate, "lunch") : []).map(toPhotoAsset);
    const teaPhotos = (plogState ? selectPhotosByDateAndMeal(plogState, pickedDate, "tea") : []).map(toPhotoAsset);
    const dinnerPhotos = (plogState ? selectPhotosByDateAndMeal(plogState, pickedDate, "dinner") : []).map(toPhotoAsset);
    const snackPhotos = (plogState ? selectPhotosByDateAndMeal(plogState, pickedDate, "snack") : []).map(toPhotoAsset);

    return {
      breakfast: {
        mealType: "breakfast" as MealType,
        date: pickedDate,
        note: "早晨来一点清爽组合，轻盈开启今天。",
        photos: breakfastPhotos
      },
      lunch: {
        mealType: "lunch" as MealType,
        date: pickedDate,
        note: "今天的咖喱饭超香，炸鸡外皮很脆。",
        photos: lunchPhotos
      },
      tea: {
        mealType: "tea" as MealType,
        date: pickedDate,
        note: "下午茶时间，给忙碌加一点甜。",
        photos: teaPhotos
      },
      dinner: {
        mealType: "dinner" as MealType,
        date: pickedDate,
        note: "傍晚的烧烤局，热闹又满足。",
        photos: dinnerPhotos
      },
      snack: {
        mealType: "snack" as MealType,
        date: pickedDate,
        note: "加餐时间，补一点能量继续发光。",
        photos: snackPhotos
      }
    };
  }, [pickedDate, plogState]);
  const activeMealContent = mealContentByTab[activeMeal];
  const dayMap = useMemo(() => new Map(days.map((day) => [day.date, day] as const)), [days]);
  const heroDateCells = useMemo(() => {
    const daysInMonth = new Date(heroViewYear, heroViewMonth, 0).getDate();
    const firstDayWeek = new Date(heroViewYear, heroViewMonth - 1, 1).getDay();
    const mondayStartOffset = (firstDayWeek + 6) % 7;

    const cells: Array<
      { kind: "empty"; key: string } | { kind: "date"; key: string; day: number; date: string; hasCheckin: boolean }
    > = [];

    for (let i = 0; i < mondayStartOffset; i += 1) {
      cells.push({ kind: "empty", key: `hero-empty-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = formatDate(heroViewYear, heroViewMonth, day);
      cells.push({
        kind: "date",
        key: date,
        day,
        date,
        hasCheckin: dayMap.get(date)?.hasCheckin ?? false
      });
    }

    return cells;
  }, [dayMap, heroViewMonth, heroViewYear]);

  const leftIconColumns = useMemo(() => {
    return sideColumns.map((_, colIndex) => {
      const icons = seededShuffle(sideFoodIcons, 100 + colIndex * 37);
      const rand = createSeededRandom(5000 + colIndex * 211);
      const columnBaseDelay = 3 + rand() * 8.5; // longer + random per column
      return icons.map((icon, index) => ({
        icon,
        top: -8 - index * (8.4 + rand() * 5.2),
        delay: columnBaseDelay + index * (0.9 + rand() * 1.8) + rand() * 1.4,
        duration: 14.5 + rand() * 8.5,
        x: -2 + rand() * 8
      }));
    });
  }, []);
  const rightIconColumns = useMemo(() => {
    return sideColumnsRight.map((_, colIndex) => {
      const icons = seededShuffle(sideFoodIcons, 800 + colIndex * 41);
      const rand = createSeededRandom(9000 + colIndex * 223);
      const columnBaseDelay = 3.4 + rand() * 8.8; // longer + random per column
      return icons.map((icon, index) => ({
        icon,
        top: -10 - index * (8 + rand() * 5.5),
        delay: columnBaseDelay + index * (0.95 + rand() * 1.9) + rand() * 1.5,
        duration: 14 + rand() * 9.2,
        x: -3 + rand() * 8
      }));
    });
  }, []);
  const monthlyKeywordStats = useMemo(() => {
    const counter = new Map<string, number>();
    for (const item of monthlyCheckinItems) {
      counter.set(item.foodName, (counter.get(item.foodName) ?? 0) + 1);
    }

    return Array.from(counter.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  return (
    <div className="relative isolate overflow-x-clip pb-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="relative mx-auto h-full max-w-[1200px]">
          {sideColumns.map((col, colIndex) => (
            <div
              key={`l-col-${colIndex}`}
              className="absolute inset-y-0 w-14"
              style={{ left: `-${col.offsetRem}rem` }}
            >
              {leftIconColumns[colIndex].map((drop, index) => (
                <span
                  key={`left-${colIndex}-${drop.icon}-${index}`}
                  className="food-fall absolute left-2 text-2xl opacity-55"
                  style={{
                    top: `${drop.top}%`,
                    left: `${drop.x}px`,
                    animationDelay: `${drop.delay + col.drift}s`,
                    animationDuration: `${drop.duration + col.drift}s`
                  }}
                >
                  {drop.icon}
                </span>
              ))}
            </div>
          ))}

          {sideColumnsRight.map((col, colIndex) => (
            <div
              key={`r-col-${colIndex}`}
              className="absolute inset-y-0 w-14"
              style={{ right: `-${col.offsetRem}rem` }}
            >
              {rightIconColumns[colIndex].map((drop, index) => (
                <span
                  key={`right-${colIndex}-${drop.icon}-${index}`}
                  className="food-fall absolute right-2 text-2xl opacity-55"
                  style={{
                    top: `${drop.top}%`,
                    right: `${drop.x}px`,
                    animationDelay: `${drop.delay + col.drift}s`,
                    animationDuration: `${drop.duration + col.drift}s`
                  }}
                >
                  {drop.icon}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="relative z-30 min-h-[460px] overflow-visible">
        <img
          src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=2200&q=80"
          alt=""
          aria-hidden="true"
          width={2200}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#4d281bcf] via-[#a14f2fc4] to-[#301b13cf]" />

        <div className="relative z-10 px-4 pb-12 pt-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="flex justify-end">
              <div className="flex flex-col items-end gap-3">
                <nav className="flex flex-wrap justify-end gap-2">
                  <Link href="/today" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#a44a2b] transition hover:bg-[#fff2e7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd0b8] focus-visible:ring-offset-2">今日打卡</Link>
                  <Link href="/history/2026-05-12" className="rounded-full bg-[#fff2e7d9] px-4 py-2 text-sm font-semibold text-[#a44a2b] ring-1 ring-[#ffffff61] transition hover:bg-[#fff4ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd0b8] focus-visible:ring-offset-2">打卡记录</Link>
                  <Link href="/settings" className="rounded-full bg-[#fff2e7d9] px-4 py-2 text-sm font-semibold text-[#a44a2b] ring-1 ring-[#ffffff61] transition hover:bg-[#fff4ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd0b8] focus-visible:ring-offset-2">设置</Link>
                </nav>

                <div className="flex items-center gap-3 rounded-full border border-[#ffffff6b] bg-[#fff7ef36] p-1.5 pr-3 backdrop-blur-sm">
                  <img src={mockUser.avatar} alt={mockUser.nickname} className="h-8 w-8 rounded-full object-cover" />
                  <div className="leading-tight">
                    <p className="text-xs text-[#ffe6d1]">Hi, {mockUser.nickname}</p>
                    <p className="text-xs font-semibold text-white">连续 {mockUser.streakDays} 天</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex min-h-[290px] items-center justify-center">
              <div className="text-center">
                <WaveText
                  text="FOODIE PLOG"
                  className="font-[var(--font-dm)] text-[clamp(2.2rem,8vw,5rem)] font-black tracking-[0.12em] text-[#fff6ec]"
                />
                <WaveText
                  text="你的美食plog打卡ai"
                  className="mt-2 text-sm font-semibold tracking-[0.08em] text-[#ffe4cf] md:text-base"
                />

                <div className="mt-7">
                  <div ref={heroDatePickerRef} className="relative inline-flex">
                    <button
                      type="button"
                      onClick={() => setHeroDatePickerOpen((open) => !open)}
                      className="inline-flex items-center gap-3 rounded-full border border-[#ffffff73] bg-[#fff7ef2e] px-6 py-2 text-[#fff8f2] shadow-sm backdrop-blur-sm transition hover:bg-[#fff7ef45]"
                      aria-label="打开日期日历"
                    >
                      <span className="text-[clamp(1.7rem,3vw,2.4rem)] font-extrabold leading-none tracking-[0.03em]">
                        {pickedDate}
                      </span>
                      <span className={`text-xl font-bold text-[#ffe4cf] transition ${heroDatePickerOpen ? "rotate-180" : ""}`}>▾</span>
                    </button>

                    {heroDatePickerOpen ? (
                      <div className="absolute left-1/2 top-[calc(100%+12px)] z-30 w-[320px] -translate-x-1/2 rounded-2xl border border-[#ffffff5f] bg-[#fffaf5f2] p-4 text-left shadow-[0_20px_50px_rgba(40,16,9,0.35)] backdrop-blur-md">
                        <div className="mb-3 flex items-center justify-between">
                          <button
                            type="button"
                            className="rounded-lg px-2 py-1 text-sm font-semibold text-[#8f3f21] hover:bg-[#ffe9dc]"
                            onClick={() => {
                              const prev = getPrevMonth(heroViewYear, heroViewMonth);
                              setHeroViewYear(prev.year);
                              setHeroViewMonth(prev.month);
                            }}
                          >
                            上月
                          </button>
                          <p className="text-sm font-bold text-[#8f3f21]">{heroViewYear} 年 {heroViewMonth} 月</p>
                          <button
                            type="button"
                            className="rounded-lg px-2 py-1 text-sm font-semibold text-[#8f3f21] hover:bg-[#ffe9dc]"
                            onClick={() => {
                              const next = getNextMonth(heroViewYear, heroViewMonth);
                              setHeroViewYear(next.year);
                              setHeroViewMonth(next.month);
                            }}
                          >
                            下月
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#8f3f21b8]">
                          {["M", "T", "W", "T", "F", "S", "S"].map((w, index) => (
                            <span key={`${w}-${index}`} className="pb-1">{w}</span>
                          ))}
                          {heroDateCells.map((cell) => (
                            cell.kind === "empty" ? (
                              <span key={cell.key} className="h-8 rounded-md" aria-hidden="true" />
                            ) : (
                              <button
                                type="button"
                                key={cell.key}
                                onClick={() => {
                                  setPickedDate(cell.date);
                                  setHeroDatePickerOpen(false);
                                }}
                                className={`h-8 rounded-md text-xs font-bold transition ${
                                  pickedDate === cell.date
                                    ? "bg-[#f7774f] text-white"
                                    : cell.hasCheckin
                                      ? "bg-[#ffe4d1] text-[#8f3f21] hover:bg-[#ffd8c0]"
                                      : "text-[#8f3f21] hover:bg-[#ffece0]"
                                }`}
                              >
                                {cell.day}
                              </button>
                            )
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#ffe6d1]">{heroWeekday}</p>
                  <h1 className="mt-1 text-3xl font-extrabold text-white">{currentMealLabel}打卡进行中</h1>
                  {uploadedCount > 0 ? <p className="mt-1 text-xs text-[#ffe6d1]">刚刚模拟上传了 {uploadedCount} 张</p> : null}

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {mealTabs.map((meal) => (
                      <Button
                        key={meal.key}
                        variant="ghost"
                        className={
                          activeMeal === meal.key
                            ? "border border-[#ffd7bf] bg-gradient-to-b from-[#fff5ea] to-[#ffe7d6] text-[#8f3f21] shadow-[0_8px_24px_rgba(80,26,7,0.2)] hover:bg-[#fff1e4]"
                            : "border border-[#fff2e0a3] bg-[#fff7ef38] text-[#fff8f2] hover:bg-[#fff7ef57]"
                        }
                        onClick={() => setActiveMeal(meal.key)}
                      >
                        {meal.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container space-y-6 py-6">
        <MealSection
          mealType={activeMealContent.mealType}
          date={activeMealContent.date}
          note={activeMealContent.note}
          photoCount={activeMealContent.photos.length}
          action={<Button onClick={() => setUploadOpen(true)}>上传照片</Button>}
        >
          {activeMealContent.photos.length > 0 ? (
            <div className="soft-scroll flex gap-4 overflow-x-auto pb-2">
              {activeMealContent.photos.map((photo) => (
                <div key={photo.id} className="min-w-[220px] max-w-[220px] flex-1">
                  <PhotoCard photo={photo} mode="compact" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--primary-soft)] px-4 py-8 text-center text-sm text-[var(--ink-subtle)]">
              这个时段还没有照片，先上传一张吧。
            </div>
          )}
        </MealSection>

        <div className="grid gap-3 md:grid-cols-3">
          <Link
            href={`/entry/${entryId}/assets`}
            className="block rounded-xl bg-[var(--primary)] px-4 py-2 text-center text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8f76] focus-visible:ring-offset-2"
          >
            管理照片
          </Link>
          <Link
            href={`/ai/${entryId}`}
            className="block rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-center text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8f76] focus-visible:ring-offset-2"
          >
            AI 生成今日内容
          </Link>
          <Link
            href={`/publish/${entryId}`}
            className="block rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-center text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8f76] focus-visible:ring-offset-2"
          >
            查看发布包
          </Link>
        </div>

        <section className="space-y-4 pt-1">
          <h2 className="text-base font-bold text-[var(--olive)]">打卡日历</h2>
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <CalendarPanel days={days} year={2026} month={5} selectedDate={pickedDate} onPickDate={(date) => setPickedDate(date)} />

            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="text-base font-bold text-[var(--olive)]">本月统计</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <p>打卡天数：<span className="font-bold">12 天</span></p>
                  <p>最长连续：<span className="font-bold">{mockUser.streakDays} 天</span></p>
                  <p>AI 生成：<span className="font-bold">9 次</span></p>
                </div>
                <Badge className="mt-4">保持节奏，很棒</Badge>
              </Card>

              <Card className="p-5">
                <h3 className="text-base font-bold text-[var(--olive)]">{pickedDate}</h3>
                <p className="mt-1 text-sm text-[var(--ink-subtle)]">{selected?.hasCheckin ? `已打卡 · ${selected.mealCount} 餐` : "暂无打卡"}</p>
                {selected?.coverThumb ? <img src={selected.coverThumb} alt="cover" className="mt-3 h-32 w-full rounded-xl object-cover" /> : null}
                <Link
                  href={`/history/${pickedDate}`}
                  className="mt-3 inline-block rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink-subtle)] transition hover:bg-[var(--primary-soft)]"
                >
                  查看当天记录
                </Link>
              </Card>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-bold text-[var(--olive)]">本月打卡</h2>
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-[var(--ink-subtle)]">当月缩略图</h3>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {monthlyCheckinItems.map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                    <img src={item.thumbUrl} alt={item.foodName} className="h-20 w-full object-cover" />
                    <p className="truncate px-2 py-1 text-[11px] font-semibold text-[var(--ink-subtle)]">{item.foodName}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-[var(--ink-subtle)]">关键词图</h3>
              <p className="mt-1 text-xs text-[var(--ink-subtle)]">根据当月打卡食物名称自动生成</p>
              <div className="mt-4 rounded-2xl bg-[#fff7ee] p-3">
                <div className="relative h-[250px] rounded-xl bg-[#fff0e2]">
                  {monthlyKeywordStats.slice(0, keywordCloudSlots.length).map((item, index) => {
                    const slot = keywordCloudSlots[index];
                    return (
                      <span
                        key={item.name}
                        className="absolute inline-flex -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-3 py-1 font-extrabold text-[#9b4a2b] shadow-sm"
                        style={{
                          top: slot.top,
                          left: slot.left,
                          fontSize: `${slot.size}px`,
                          zIndex: index === 0 ? 10 : 5
                        }}
                      >
                        {item.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        defaultDate={pickedDate}
        defaultMealType={toMealTypeFromTab(activeMeal)}
        userId={plogState?.user.id ?? mockUser.id}
        onUploadDone={(count) => {
          setUploadedCount(count);
          setPlogState(ensurePlogState());
        }}
      />
    </div>
  );
}

