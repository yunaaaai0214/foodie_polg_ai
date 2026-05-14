import { CalendarDay, MealType, PlogPhoto, PlogState } from "@/lib/types";

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function selectPhotosByDateAndMeal(state: PlogState, date: string, mealType: MealType): PlogPhoto[] {
  return state.photos.filter((photo) => photo.date === date && photo.mealType === mealType);
}

export function selectPhotosByDate(state: PlogState, date: string): PlogPhoto[] {
  return state.photos.filter((photo) => photo.date === date);
}

export function selectPhotosGroupedByMeal(state: PlogState, date: string): Record<MealType, PlogPhoto[]> {
  return {
    breakfast: selectPhotosByDateAndMeal(state, date, "breakfast"),
    lunch: selectPhotosByDateAndMeal(state, date, "lunch"),
    tea: selectPhotosByDateAndMeal(state, date, "tea"),
    dinner: selectPhotosByDateAndMeal(state, date, "dinner"),
    snack: selectPhotosByDateAndMeal(state, date, "snack")
  };
}

export function selectCalendarDays(state: PlogState, year: number, month: number): CalendarDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = formatDate(year, month, day);
    const photos = selectPhotosByDate(state, date);

    const mealSet = new Set<MealType>();
    for (const photo of photos) {
      mealSet.add(photo.mealType);
    }

    days.push({
      date,
      hasCheckin: photos.length > 0,
      mealCount: mealSet.size,
      coverThumb: photos[0]?.thumbUrl
    });
  }

  return days;
}

export function selectMonthKeywordStats(state: PlogState, year: number, month: number): Array<{ name: string; count: number }> {
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  const mealLabelMap: Record<MealType, string> = {
    breakfast: "早餐",
    lunch: "午餐",
    tea: "下午茶",
    dinner: "晚餐",
    snack: "夜宵"
  };

  const counter = new Map<string, number>();
  for (const photo of state.photos) {
    if (!photo.date.startsWith(prefix)) {
      continue;
    }

    const name = mealLabelMap[photo.mealType];
    counter.set(name, (counter.get(name) ?? 0) + 1);
  }

  return Array.from(counter.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
