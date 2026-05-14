"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchPhoto } from "@/lib/api-client";
import { getLocalStorageJSON, setLocalStorageJSON } from "@/lib/local-storage";
import { ensurePlogState, upsertPhotoEditorState } from "@/lib/plog-store";
import { EditorState, FilterPreset, PhotoAsset, PlogPhoto } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PhotoEditorCanvas } from "@/components/PhotoEditorCanvas";
import { FilterToolbar } from "@/components/FilterToolbar";
import { StickerToolbar } from "@/components/StickerToolbar";

interface EditorWorkspaceProps {
  photoId: string;
}

const initialEditorState: EditorState = {
  ratio: "4:5",
  filter: "original",
  filterStrength: 58,
  sticker: undefined,
  textOverlay: undefined
};

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

export function EditorWorkspace({ photoId }: EditorWorkspaceProps) {
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [state, setState] = useState<EditorState>(initialEditorState);
  const [activeTab, setActiveTab] = useState<"crop" | "filter" | "sticker" | "text">("crop");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadPhotoAndState() {
      const plogState = ensurePlogState();
      const localHit = plogState.photos.find((item) => item.id === photoId);
      const storageKey = `foodie.editor.${photoId}`;
      const cached = getLocalStorageJSON<EditorState>(storageKey, initialEditorState);

      if (localHit) {
        if (!mounted) {
          return;
        }
        setPhoto(toPhotoAsset(localHit));
        setState(localHit.editorState ?? cached);
        return;
      }

      try {
        const apiPhoto = await fetchPhoto(photoId);
        if (!mounted) {
          return;
        }
        setPhoto(apiPhoto);
        setState(cached);
      } catch {
        if (!mounted) {
          return;
        }
        setPhoto(null);
      }
    }

    void loadPhotoAndState();

    return () => {
      mounted = false;
    };
  }, [photoId]);

  const statusText = useMemo(() => {
    if (saving) {
      return "保存中...";
    }
    return dirty ? "未保存改动" : "已保存";
  }, [dirty, saving]);

  function applyChange(next: EditorState) {
    setState(next);
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    const storageKey = `foodie.editor.${photoId}`;
    setLocalStorageJSON(storageKey, state);
    upsertPhotoEditorState(photoId, { edited: true, editorState: state });
    setDirty(false);
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--olive)]">图片编辑器</h1>
          <p className="mt-1 text-sm text-[var(--ink-subtle)]">裁剪、滤镜、贴纸、文字一站完成</p>
        </div>
        <Badge>{statusText}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-4">
          <div className="mb-3 flex gap-2">
            <Button variant="ghost">撤销</Button>
            <Button variant="ghost">重做</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setState(initialEditorState);
                setDirty(true);
              }}
            >
              重置
            </Button>
          </div>

          {photo ? <PhotoEditorCanvas photo={photo} state={state} /> : <div className="h-[560px] rounded-2xl bg-[var(--primary-soft)] p-4 text-sm text-[var(--ink-subtle)]">未找到该照片</div>}
        </Card>

        <Card className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveTab("crop")} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${activeTab === "crop" ? "bg-[var(--primary)] text-white" : "border border-[var(--line)] bg-white"}`}>裁剪</button>
            <button onClick={() => setActiveTab("filter")} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${activeTab === "filter" ? "bg-[var(--primary)] text-white" : "border border-[var(--line)] bg-white"}`}>滤镜</button>
            <button onClick={() => setActiveTab("sticker")} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${activeTab === "sticker" ? "bg-[var(--primary)] text-white" : "border border-[var(--line)] bg-white"}`}>贴纸</button>
            <button onClick={() => setActiveTab("text")} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${activeTab === "text" ? "bg-[var(--primary)] text-white" : "border border-[var(--line)] bg-white"}`}>文字</button>
          </div>

          {activeTab === "crop" ? (
            <div>
              <p className="text-sm font-semibold text-[var(--ink-subtle)]">裁剪比例</p>
              <div className="mt-2 flex gap-2">
                {(["1:1", "4:5", "3:4", "9:16"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => applyChange({ ...state, ratio })}
                    className={`rounded-lg px-3 py-1.5 text-sm ${state.ratio === ratio ? "bg-[var(--primary)] text-white" : "border border-[var(--line)] bg-white"}`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "filter" ? (
            <FilterToolbar
              filter={state.filter}
              strength={state.filterStrength}
              onFilterChange={(filter: FilterPreset) => applyChange({ ...state, filter })}
              onStrengthChange={(filterStrength) => applyChange({ ...state, filterStrength })}
            />
          ) : null}

          {activeTab === "sticker" || activeTab === "text" ? (
            <StickerToolbar
              sticker={state.sticker}
              textOverlay={state.textOverlay}
              onStickerChange={(sticker) => applyChange({ ...state, sticker })}
              onTextChange={(textOverlay) => applyChange({ ...state, textOverlay })}
            />
          ) : null}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="secondary">应用到同餐次</Button>
            <Button onClick={() => void handleSave()} disabled={saving}>{saving ? "保存中..." : "保存编辑"}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
