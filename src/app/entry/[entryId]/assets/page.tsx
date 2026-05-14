"use client";

import { useEffect, useMemo, useState } from "react";
import { PhotoCard } from "@/components/PhotoCard";
import { UploadModal } from "@/components/UploadModal";
import { getLocalStorageJSON, setLocalStorageJSON } from "@/lib/local-storage";
import { ensurePlogState } from "@/lib/plog-store";
import { MealType, PhotoAsset, PlogPhoto, PlogState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const mealOptions: Array<{ value: "all" | MealType; label: string }> = [
  { value: "all", label: "全部" },
  { value: "breakfast", label: "早餐" },
  { value: "lunch", label: "午餐" },
  { value: "tea", label: "下午茶" },
  { value: "dinner", label: "晚餐" },
  { value: "snack", label: "夜宵" }
];

function todayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

export default function AssetsPage() {
  const [plogState, setPlogState] = useState<PlogState | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [latestUploadCount, setLatestUploadCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState("2026-05-12");
  const [selectedMeal, setSelectedMeal] = useState<"all" | MealType>("all");

  useEffect(() => {
    const next = ensurePlogState();
    setPlogState(next);

    const storageKey = "foodie.upload.count.e1";
    setLatestUploadCount(getLocalStorageJSON<number>(storageKey, 0));

    if (!next.photos.some((photo) => photo.date === selectedDate)) {
      setSelectedDate(todayDateString());
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPhotos = useMemo(() => {
    if (!plogState) {
      return [];
    }

    return plogState.photos.filter((photo) => {
      if (photo.date !== selectedDate) {
        return false;
      }
      if (selectedMeal !== "all" && photo.mealType !== selectedMeal) {
        return false;
      }
      return true;
    });
  }, [plogState, selectedDate, selectedMeal]);

  const subtitle = `${selectedDate} · ${selectedMeal === "all" ? "全部餐次" : mealOptions.find((item) => item.value === selectedMeal)?.label} · ${filteredPhotos.length} 张`;

  return (
    <div className="space-y-6">
      <PageHeader title="上传与管理" subtitle={subtitle} />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="space-y-4 p-5">
          <h3 className="text-base font-bold text-[var(--olive)]">筛选条件</h3>
          <label className="block text-sm">
            <span className="text-[var(--ink-subtle)]">日期</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>

          <div>
            <p className="text-sm font-semibold text-[var(--ink-subtle)]">用餐时间</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {mealOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedMeal(option.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selectedMeal === option.value
                      ? "bg-[var(--primary)] text-white"
                      : "border border-[var(--line)] bg-white text-[var(--ink-subtle)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={() => setUploadOpen(true)}>+ 上传新照片</Button>
          {latestUploadCount > 0 ? <p className="text-xs text-[var(--ink-subtle)]">最近一次模拟上传 {latestUploadCount} 张</p> : null}
        </Card>

        <div className="space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex gap-2">
              <Button variant="secondary">全选</Button>
              <Button variant="secondary">移动餐次</Button>
              <Button variant="secondary">删除</Button>
            </div>
            <p className="text-xs text-[var(--ink-subtle)]">上传队列：{latestUploadCount} 成功 · 0 失败</p>
          </Card>

          {filteredPhotos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPhotos.map((photo) => (
                <PhotoCard key={photo.id} photo={toPhotoAsset(photo)} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-sm text-[var(--ink-subtle)]">当前筛选条件下还没有照片。</Card>
          )}
        </div>
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        defaultDate={selectedDate}
        defaultMealType={selectedMeal === "all" ? "lunch" : selectedMeal}
        userId={plogState?.user.id}
        onUploadDone={(count) => {
          setLatestUploadCount(count);
          setLocalStorageJSON("foodie.upload.count.e1", count);
          setPlogState(ensurePlogState());
        }}
      />
    </div>
  );
}
