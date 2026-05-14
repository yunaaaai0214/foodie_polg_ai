"use client";

import { useEffect, useState } from "react";
import { generateAICopy } from "@/lib/api-client";
import {
  getLocalStorageJSON,
  getRemoteStateJSON,
  JsonValue,
  setLocalStorageJSON,
  setRemoteStateJSON
} from "@/lib/local-storage";
import { AiCopyResult, AiStyle, MealType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AIContentPanelProps {
  entryId: string;
}

interface AIPanelDraft {
  date: string;
  mealTime: MealType;
  style: AiStyle;
  imageDescription: string;
  result: AiCopyResult | null;
}

const styleOptions: AiStyle[] = ["小红书", "Instagram", "治愈风", "幽默风", "精致探店风"];
const mealOptions: Array<{ value: MealType; label: string }> = [
  { value: "breakfast", label: "早餐" },
  { value: "lunch", label: "午餐" },
  { value: "tea", label: "下午茶" },
  { value: "dinner", label: "晚餐" },
  { value: "snack", label: "加餐" }
];

function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDefaultDraft(): AIPanelDraft {
  return {
    date: getTodayDateString(),
    mealTime: "lunch",
    style: "小红书",
    imageDescription: "",
    result: null
  };
}

export function AIContentPanel({ entryId }: AIContentPanelProps) {
  const [date, setDate] = useState(getTodayDateString());
  const [mealTime, setMealTime] = useState<MealType>("lunch");
  const [style, setStyle] = useState<AiStyle>("小红书");
  const [imageDescription, setImageDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiCopyResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storageKey = `foodie.ai.panel.${entryId}`;
    const draft = getLocalStorageJSON<AIPanelDraft>(storageKey, getDefaultDraft());

    setDate(draft.date);
    setMealTime(draft.mealTime);
    setStyle(draft.style);
    setImageDescription(draft.imageDescription);
    setResult(draft.result);
    setReady(true);

    let mounted = true;
    getRemoteStateJSON<AIPanelDraft>(storageKey).then((remoteDraft) => {
      if (!mounted || !remoteDraft) {
        return;
      }

      setDate(remoteDraft.date);
      setMealTime(remoteDraft.mealTime);
      setStyle(remoteDraft.style);
      setImageDescription(remoteDraft.imageDescription);
      setResult(remoteDraft.result);
    });

    return () => {
      mounted = false;
    };
  }, [entryId]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const storageKey = `foodie.ai.panel.${entryId}`;
    const draft: AIPanelDraft = {
      date,
      mealTime,
      style,
      imageDescription,
      result
    };

    setLocalStorageJSON<AIPanelDraft>(storageKey, draft);

    const timer = window.setTimeout(() => {
      void setRemoteStateJSON(storageKey, draft as unknown as JsonValue);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [date, entryId, imageDescription, mealTime, ready, result, style]);

  async function handleGenerate() {
    if (!imageDescription.trim()) {
      setError("请先填写图片描述。比如：主菜、口味、摆盘、环境、心情。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const next = await generateAICopy({ date, mealTime, style, imageDescription: imageDescription.trim() });
      setResult(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card className="space-y-5 p-5">
        <div className="rounded-xl bg-[var(--primary-soft)] px-3 py-2 text-xs text-[var(--ink-subtle)]">
          当前条目 ID：{entryId}
        </div>

        <label className="block text-sm">
          <span className="font-semibold text-[var(--ink-subtle)]">日期</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>

        <div>
          <p className="text-sm font-semibold text-[var(--ink-subtle)]">用餐时间</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {mealOptions.map((item) => (
              <button
                key={item.value}
                onClick={() => setMealTime(item.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${mealTime === item.value ? "bg-[var(--primary)] text-white" : "border border-[var(--line)] bg-white text-[var(--ink-subtle)]"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--ink-subtle)]">风格</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {styleOptions.map((item) => (
              <button
                key={item}
                onClick={() => setStyle(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${style === item ? "bg-[var(--primary)] text-white" : "border border-[var(--line)] bg-white text-[var(--ink-subtle)]"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <p className="text-sm font-semibold text-[var(--ink-subtle)]">图片描述</p>
          <textarea
            value={imageDescription}
            onChange={(event) => setImageDescription(event.target.value)}
            placeholder="例：厚切牛排配黑椒酱，外焦里嫩；旁边是蒜香蘑菇和土豆泥，暖黄灯光，和朋友聚餐很开心。"
            className="mt-2 h-36 w-full rounded-2xl border border-[var(--line)] bg-white p-3 text-sm"
          />
        </label>

        {error ? <p className="rounded-xl bg-[#ffe8e8] px-3 py-2 text-sm text-[#b42318]">{error}</p> : null}

        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "生成中..." : "生成 AI 文案"}
        </Button>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="text-base font-bold text-[var(--olive)]">今日美食标题</h3>
          <p className="mt-2 rounded-xl bg-white p-3 text-sm">{result?.title ?? "等待生成"}</p>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-bold text-[var(--olive)]">80 字以内短文案</h3>
          <p className="mt-2 rounded-xl bg-white p-3 text-sm leading-6">{result?.shortCaption ?? "等待生成"}</p>
          <p className="mt-1 text-right text-xs text-[var(--ink-subtle)]">{result?.shortCaption?.length ?? 0}/80</p>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-bold text-[var(--olive)]">150 字详细文案</h3>
          <p className="mt-2 rounded-xl bg-white p-3 text-sm leading-6">{result?.detailedCaption ?? "等待生成"}</p>
          <p className="mt-1 text-right text-xs text-[var(--ink-subtle)]">{result?.detailedCaption?.length ?? 0}/150</p>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-bold text-[var(--olive)]">Hashtags (5-8)</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {(result?.hashtags ?? []).map((tag) => (
              <span key={tag} className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                {tag}
              </span>
            ))}
            {!result ? <p className="text-sm text-[var(--ink-subtle)]">等待生成</p> : null}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-bold text-[var(--olive)]">总结图一句话</h3>
          <p className="mt-2 rounded-xl bg-white p-3 text-sm">{result?.summaryLine ?? "等待生成"}</p>
        </Card>
      </div>
    </div>
  );
}
