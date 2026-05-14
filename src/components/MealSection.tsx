import { ReactNode } from "react";
import { MealType } from "@/lib/types";
import { mealLabelMap } from "@/mock/mock-data";
import { Card } from "@/components/ui/card";

interface MealSectionProps {
  mealType: MealType;
  date: string;
  note?: string;
  photoCount: number;
  action?: ReactNode;
  children: ReactNode;
}

export function MealSection({ mealType, date, note, photoCount, action, children }: MealSectionProps) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--ink-subtle)]">{date}</p>
          <h3 className="text-lg font-bold text-[var(--olive)]">{mealLabelMap[mealType]}</h3>
          <p className="text-xs text-[var(--ink-subtle)]">共 {photoCount} 张</p>
        </div>
        {action}
      </div>
      {note ? <p className="mb-4 rounded-xl bg-white p-3 text-sm text-[var(--ink)]">{note}</p> : null}
      {children}
    </Card>
  );
}
