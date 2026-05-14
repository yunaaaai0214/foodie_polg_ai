"use client";

import { useState } from "react";
import { AiGeneration } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SharePreviewCardProps {
  generation: AiGeneration;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split("");
  const lines: string[] = [];
  let line = "";

  for (const char of words) {
    const next = `${line}${char}`;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = next;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

async function downloadShareImage(generation: AiGeneration): Promise<boolean> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return false;
  }

  const image = new Image();
  image.crossOrigin = "anonymous";

  const loadOk = await new Promise<boolean>((resolve) => {
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = generation.summaryImageUrl;
  });

  if (!loadOk) {
    return false;
  }

  try {
    ctx.drawImage(image, 0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, height * 0.55, 0, height);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px 'Noto Sans SC', sans-serif";
    const titleLines = wrapText(ctx, generation.title, width - 120).slice(0, 2);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, 60, height - 240 + index * 64);
    });

    if (generation.summaryLine) {
      ctx.font = "36px 'Noto Sans SC', sans-serif";
      const summaryLines = wrapText(ctx, generation.summaryLine, width - 120).slice(0, 2);
      summaryLines.forEach((line, index) => {
        ctx.fillText(line, 60, height - 100 + index * 48);
      });
    }

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `foodie-share-${Date.now()}.png`;
    link.click();
    return true;
  } catch {
    return false;
  }
}

export function SharePreviewCard({ generation }: SharePreviewCardProps) {
  const [notice, setNotice] = useState<string>("");

  async function handleCopy(text: string, successMessage: string) {
    const ok = await copyText(text);
    setNotice(ok ? successMessage : "复制失败，请手动复制");
  }

  async function handleDownload() {
    const ok = await downloadShareImage(generation);
    if (ok) {
      setNotice("已下载分享图");
      return;
    }

    const link = document.createElement("a");
    link.href = generation.summaryImageUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.click();
    setNotice("已打开原图，可另存为");
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="text-base font-bold text-[var(--olive)]">标题</h3>
        <p className="mt-2 rounded-xl bg-white p-3 text-sm">{generation.title}</p>
        <Button variant="secondary" className="mt-3 w-full" onClick={() => void handleCopy(generation.title, "标题已复制")}>复制标题</Button>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-bold text-[var(--olive)]">文案</h3>
        <p className="mt-2 rounded-xl bg-white p-3 text-sm leading-6">{generation.caption}</p>
        <Button variant="secondary" className="mt-3 w-full" onClick={() => void handleCopy(generation.caption, "文案已复制")}>复制文案</Button>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-bold text-[var(--olive)]">Hashtags</h3>
        <p className="mt-2 rounded-xl bg-white p-3 text-sm">{generation.hashtags.join(" ")}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => void handleCopy(generation.hashtags.join(" "), "标签已复制")}>复制标签</Button>
          <Button onClick={() => void handleDownload()}>下载 PNG</Button>
        </div>
        {notice ? <p className="mt-2 text-xs text-[var(--ink-subtle)]">{notice}</p> : null}
      </Card>
    </div>
  );
}
