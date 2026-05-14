interface StickerToolbarProps {
  sticker?: string;
  textOverlay?: string;
  onStickerChange: (sticker: string | undefined) => void;
  onTextChange: (text: string | undefined) => void;
}

export function StickerToolbar({ sticker, textOverlay, onStickerChange, onTextChange }: StickerToolbarProps) {
  const stickers = ["Yummy", "Hot", "Sweet", "Chef Pick"];
  const quickTexts = ["今天也好好吃饭", "本周最好吃", "幸福加餐"];

  return (
    <section className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-[var(--ink-subtle)]">贴纸</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {stickers.map((item) => (
            <button
              key={item}
              onClick={() => onStickerChange(sticker === item ? undefined : item)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${sticker === item ? "bg-[var(--primary)] text-white" : "bg-[var(--primary-soft)] text-[var(--primary)]"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-[var(--ink-subtle)]">文字</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {quickTexts.map((item) => (
            <button
              key={item}
              onClick={() => onTextChange(textOverlay === item ? undefined : item)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${textOverlay === item ? "bg-[var(--primary)] text-white" : "bg-white text-[var(--ink-subtle)] border border-[var(--line)]"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
