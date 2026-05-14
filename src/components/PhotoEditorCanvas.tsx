import { EditorState, PhotoAsset } from "@/lib/types";

interface PhotoEditorCanvasProps {
  photo: PhotoAsset;
  state: EditorState;
}

const filterStyleMap: Record<EditorState["filter"], string> = {
  original: "none",
  warm: "sepia(18%) saturate(120%)",
  fresh: "contrast(104%) saturate(110%) brightness(104%)",
  retro: "sepia(38%) contrast(95%)"
};

export function PhotoEditorCanvas({ photo, state }: PhotoEditorCanvasProps) {
  const ratioClass = state.ratio === "4:5" ? "aspect-[4/5]" : state.ratio === "9:16" ? "aspect-[9/16]" : state.ratio === "3:4" ? "aspect-[3/4]" : "aspect-square";
  const filterChain =
    state.filter === "original"
      ? `opacity(${(85 + state.filterStrength * 0.15) / 100})`
      : `${filterStyleMap[state.filter]} opacity(${(85 + state.filterStrength * 0.15) / 100})`;

  return (
    <div className="rounded-2xl bg-[#f8ede3] p-3">
      <div className={`${ratioClass} relative overflow-hidden rounded-2xl`}>
        <img
          src={photo.url}
          alt="editing"
          className="h-full w-full object-cover"
          style={{ filter: filterChain }}
        />

        {state.sticker ? (
          <div className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[var(--ink)]">
            {state.sticker}
          </div>
        ) : null}

        {state.textOverlay ? (
          <div className="absolute bottom-3 left-3 rounded-lg bg-black/45 px-3 py-1.5 text-sm font-semibold text-white">
            {state.textOverlay}
          </div>
        ) : null}
      </div>
    </div>
  );
}
