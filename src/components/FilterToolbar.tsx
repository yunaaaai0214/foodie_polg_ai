import { EditorState, FilterPreset } from "@/lib/types";

interface FilterToolbarProps {
  filter: FilterPreset;
  strength: number;
  onFilterChange: (filter: FilterPreset) => void;
  onStrengthChange: (value: number) => void;
}

export function FilterToolbar({ filter, strength, onFilterChange, onStrengthChange }: FilterToolbarProps) {
  const presets: Array<{ key: FilterPreset; label: string }> = [
    { key: "original", label: "原图" },
    { key: "warm", label: "暖光" },
    { key: "fresh", label: "清透" },
    { key: "retro", label: "复古" }
  ];

  return (
    <section>
      <p className="text-sm font-semibold text-[var(--ink-subtle)]">滤镜</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.key}
            onClick={() => onFilterChange(preset.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${filter === preset.key ? "bg-[var(--primary)] text-white" : "border border-[var(--line)] bg-white text-[var(--ink-subtle)]"}`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <label className="mt-3 block text-sm text-[var(--ink-subtle)]">
        强度 {strength}
        <input
          type="range"
          min={0}
          max={100}
          value={strength}
          onChange={(event) => onStrengthChange(Number(event.target.value))}
          className="mt-2 w-full accent-[var(--primary)]"
        />
      </label>
    </section>
  );
}
