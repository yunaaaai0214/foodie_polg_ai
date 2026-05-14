"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MealSection } from "@/components/MealSection";
import { PhotoCard } from "@/components/PhotoCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ensurePlogState } from "@/lib/plog-store";
import { selectPhotosGroupedByMeal } from "@/lib/plog-selectors";
import { MealType, PhotoAsset, PlogPhoto, PlogState } from "@/lib/types";
import { getGenerationByEntry, mealLabelMap } from "@/mock/mock-data";

const orderedMeals: MealType[] = ["breakfast", "lunch", "tea", "dinner", "snack"];

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

function decodeDateParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function HistoryPage() {
  const params = useParams<{ date: string }>();
  const date = decodeDateParam(params.date ?? "2026-05-12");
  const [plogState, setPlogState] = useState<PlogState | null>(null);
  const generation = getGenerationByEntry("e1");

  useEffect(() => {
    setPlogState(ensurePlogState());
  }, []);

  const grouped = useMemo(() => {
    if (!plogState) {
      return null;
    }
    return selectPhotosGroupedByMeal(plogState, date);
  }, [date, plogState]);

  const totalCount = useMemo(() => {
    if (!grouped) {
      return 0;
    }

    return orderedMeals.reduce((sum, mealType) => sum + grouped[mealType].length, 0);
  }, [grouped]);

  return (
    <div className="space-y-6">
      <PageHeader title="历史详情" subtitle={`${date} · 共 ${totalCount} 张照片`} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          {grouped ? (
            orderedMeals.map((mealType) => {
              const photos = grouped[mealType];
              if (photos.length === 0) {
                return null;
              }

              return (
                <MealSection
                  key={mealType}
                  mealType={mealType}
                  date={date}
                  note={`${mealLabelMap[mealType]}时段共 ${photos.length} 张`}
                  photoCount={photos.length}
                >
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {photos.map((photo) => (
                      <PhotoCard key={photo.id} photo={toPhotoAsset(photo)} mode="compact" showMeta={false} />
                    ))}
                  </div>
                </MealSection>
              );
            })
          ) : (
            <Card className="p-5 text-sm text-[var(--ink-subtle)]">加载中...</Card>
          )}

          {grouped && totalCount === 0 ? (
            <Card className="p-6 text-center text-sm text-[var(--ink-subtle)]">这一天还没有照片记录。</Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-base font-bold text-[var(--olive)]">历史生成记录</h3>
            <p className="mt-2 text-sm text-[var(--ink-subtle)]">风格：{generation.style}</p>
            <p className="mt-2 rounded-xl bg-white p-3 text-sm">{generation.title}</p>
            <Button variant="secondary" className="mt-3 w-full">恢复为当前版本</Button>
          </Card>

          <Card className="p-5">
            <h3 className="text-base font-bold text-[var(--olive)]">操作</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="secondary">再次生成</Button>
              <Button>导出合集</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
