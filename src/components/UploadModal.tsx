"use client";

import { useEffect, useState } from "react";
import { appendPhotos } from "@/lib/plog-store";
import { MealType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadDone?: (count: number) => void;
  defaultDate?: string;
  defaultMealType?: MealType;
  userId?: string;
}

const mealOptions: Array<{ value: MealType; label: string }> = [
  { value: "breakfast", label: "早餐" },
  { value: "lunch", label: "午餐" },
  { value: "tea", label: "下午茶" },
  { value: "dinner", label: "晚餐" },
  { value: "snack", label: "夜宵" }
];

const samplePhotoPool = [
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&q=80",
  "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=1200&q=80",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=80"
];

function nowDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nowTimeString(offsetMinute: number): string {
  const date = new Date(Date.now() + offsetMinute * 60 * 1000);
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

export function UploadModal({
  open,
  onClose,
  onUploadDone,
  defaultDate,
  defaultMealType = "lunch",
  userId = "u1"
}: UploadModalProps) {
  const [selectedCount, setSelectedCount] = useState(3);
  const [selectedDate, setSelectedDate] = useState(defaultDate ?? nowDateString());
  const [selectedMealType, setSelectedMealType] = useState<MealType>(defaultMealType);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedDate(defaultDate ?? nowDateString());
    setSelectedMealType(defaultMealType);
  }, [defaultDate, defaultMealType, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
      <Card className="w-full max-w-lg p-5">
        <h3 className="text-lg font-bold text-[var(--olive)]">上传照片</h3>
        <p className="mt-1 text-sm text-[var(--ink-subtle)]">原型阶段会模拟上传流程，并保存到本地数据中。</p>

        <label className="mt-4 block text-sm">
          <span className="font-semibold text-[var(--ink-subtle)]">日期</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>

        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--ink-subtle)]">用餐时间</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {mealOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setSelectedMealType(item.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  selectedMealType === item.value
                    ? "bg-[var(--primary)] text-white"
                    : "border border-[var(--line)] bg-white text-[var(--ink-subtle)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border-2 border-dashed border-[var(--line)] bg-white p-6 text-center">
          <p className="text-sm text-[var(--ink-subtle)]">拖拽图片到这里，或点击选择文件</p>
          <p className="mt-2 text-xs text-[var(--ink-subtle)]">模拟文件数：{selectedCount}</p>
          <input
            type="range"
            min={1}
            max={9}
            value={selectedCount}
            onChange={(event) => setSelectedCount(Number(event.target.value))}
            className="mt-3 w-full accent-[var(--primary)]"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button
            onClick={() => {
              const payload = Array.from({ length: selectedCount }, (_, index) => {
                const url = samplePhotoPool[(Date.now() + index) % samplePhotoPool.length];
                return {
                  userId,
                  date: selectedDate,
                  mealType: selectedMealType,
                  url,
                  thumbUrl: `${url}&w=600`,
                  takenAt: nowTimeString(index * 2),
                  sizeLabel: `${(1.6 + ((index * 17) % 16) / 10).toFixed(1)} MB`,
                  source: "upload" as const
                };
              });

              appendPhotos(payload);
              onUploadDone?.(selectedCount);
              onClose();
            }}
          >
            模拟上传
          </Button>
        </div>
      </Card>
    </div>
  );
}
