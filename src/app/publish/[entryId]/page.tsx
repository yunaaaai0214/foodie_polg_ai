"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SharePreviewCard } from "@/components/SharePreviewCard";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getLocalStorageJSON } from "@/lib/local-storage";
import { ensurePlogState } from "@/lib/plog-store";
import { AiCopyResult, AiGeneration, MealType } from "@/lib/types";
import { getGenerationByEntry } from "@/mock/mock-data";

interface AIPanelDraft {
  date: string;
  mealTime: MealType;
  style: string;
  imageDescription: string;
  result: AiCopyResult | null;
}

function buildGenerationFromDraft(entryId: string, draft: AIPanelDraft | null): AiGeneration {
  const fallback = getGenerationByEntry(entryId);
  if (!draft || !draft.result) {
    return fallback;
  }

  const plogState = ensurePlogState();
  const matchedPhoto = plogState.photos.find((photo) => photo.date === draft.date && photo.mealType === draft.mealTime);

  return {
    id: `local-${entryId}`,
    entryId,
    style: draft.style,
    title: draft.result.title,
    caption: `${draft.result.detailedCaption}\n\n${draft.result.hashtags.join(" ")}`,
    shortCaption: draft.result.shortCaption,
    detailedCaption: draft.result.detailedCaption,
    hashtags: draft.result.hashtags,
    summaryLine: draft.result.summaryLine,
    summaryImageUrl: matchedPhoto?.url ?? fallback.summaryImageUrl,
    createdAt: new Date().toISOString()
  };
}

export default function PublishPage() {
  const params = useParams<{ entryId: string }>();
  const entryId = params.entryId ?? "e1";
  const [generation, setGeneration] = useState<AiGeneration>(() => getGenerationByEntry(entryId));

  useEffect(() => {
    const draftKey = `foodie.ai.panel.${entryId}`;
    const draft = getLocalStorageJSON<AIPanelDraft | null>(draftKey, null);
    setGeneration(buildGenerationFromDraft(entryId, draft));
  }, [entryId]);

  return (
    <div className="space-y-6">
      <PageHeader title="发布预览" subtitle="下载图片并一键复制文案到社交平台" />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--olive)]">最终图片预览</h3>
            <div className="flex gap-2 text-xs">
              <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-white">4:5</span>
              <span className="rounded-full border border-[var(--line)] px-3 py-1">1:1</span>
              <span className="rounded-full border border-[var(--line)] px-3 py-1">9:16</span>
            </div>
          </div>
          <img src={generation.summaryImageUrl} alt="final" className="h-[560px] w-full rounded-2xl object-cover" />
        </Card>

        <SharePreviewCard generation={generation} />
      </div>
    </div>
  );
}
