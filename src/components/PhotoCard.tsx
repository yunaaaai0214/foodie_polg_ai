import Link from "next/link";
import { PhotoAsset } from "@/lib/types";

interface PhotoCardProps {
  photo: PhotoAsset;
  mode?: "compact" | "default";
  showMeta?: boolean;
  showEditorLink?: boolean;
}

export function PhotoCard({ photo, mode = "default", showMeta = true, showEditorLink = true }: PhotoCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
      <img
        src={photo.thumbUrl}
        alt="meal"
        className={`${mode === "compact" ? "h-32" : "h-44"} w-full object-cover transition duration-300 group-hover:scale-105`}
      />

      {showMeta ? (
        <div className="flex items-center justify-between px-3 py-2">
          <div>
            <p className="text-xs font-semibold text-[var(--ink)]">{photo.takenAt}</p>
            <p className="text-xs text-[var(--ink-subtle)]">{photo.sizeLabel}</p>
          </div>
          {showEditorLink ? (
            <Link
              href={`/editor/${photo.id}`}
              className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs font-semibold text-[var(--ink-subtle)] hover:bg-[var(--primary-soft)]"
            >
              {photo.edited ? "已编辑" : "去编辑"}
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
