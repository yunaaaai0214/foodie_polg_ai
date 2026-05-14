"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDay } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CalendarPanelProps {
  days: CalendarDay[];
  year: number;
  month: number;
  selectedDate?: string;
  onPickDate?: (date: string) => void;
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDateParts(date: string): { year: number; month: number; day: number } {
  const [yearString, monthString, dayString] = date.split("-");
  return {
    year: Number(yearString),
    month: Number(monthString),
    day: Number(dayString)
  };
}

function getPrevMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
}

function getNextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) {
    return { year: year + 1, month: 1 };
  }
  return { year, month: month + 1 };
}

export function CalendarPanel({ days, year, month, selectedDate, onPickDate }: CalendarPanelProps) {
  const [viewYear, setViewYear] = useState(year);
  const [viewMonth, setViewMonth] = useState(month);
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>(formatDate(year, month, 1));

  const activeSelectedDate = selectedDate ?? internalSelectedDate;

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const next = parseDateParts(selectedDate);
    if (!Number.isNaN(next.year) && !Number.isNaN(next.month)) {
      setViewYear(next.year);
      setViewMonth(next.month);
    }
  }, [selectedDate]);

  const grid = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const firstDayWeek = new Date(viewYear, viewMonth - 1, 1).getDay();
    const mondayStartOffset = (firstDayWeek + 6) % 7;

    const cells: Array<{
      kind: "empty" | "date";
      key: string;
      day?: number;
      date?: string;
      hasCheckin?: boolean;
      mealCount?: number;
    }> = [];

    for (let i = 0; i < mondayStartOffset; i += 1) {
      cells.push({ kind: "empty", key: `empty-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = formatDate(viewYear, viewMonth, day);
      const hit = days.find((item) => item.date === date);
      cells.push({
        kind: "date",
        key: date,
        day,
        date,
        hasCheckin: hit?.hasCheckin ?? false,
        mealCount: hit?.mealCount ?? 0
      });
    }

    return cells;
  }, [days, viewMonth, viewYear]);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[var(--olive)]">{viewYear} 年 {viewMonth} 月</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              const prev = getPrevMonth(viewYear, viewMonth);
              setViewYear(prev.year);
              setViewMonth(prev.month);
            }}
          >
            上月
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              const next = getNextMonth(viewYear, viewMonth);
              setViewYear(next.year);
              setViewMonth(next.month);
            }}
          >
            下月
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs text-[var(--ink-subtle)]">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
          <p key={w} className="pb-2 font-semibold">{w}</p>
        ))}

        {grid.map((item) => (
          item.kind === "empty" ? (
            <div key={item.key} className="rounded-xl border border-transparent p-2" aria-hidden="true" />
          ) : (
            <button
              key={item.key}
              onClick={() => {
                if (!item.date) {
                  return;
                }
                setInternalSelectedDate(item.date);
                onPickDate?.(item.date);
              }}
              className={`rounded-xl border p-2 text-left transition ${
                activeSelectedDate === item.date
                  ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                  : item.hasCheckin
                    ? "border-[var(--primary)]/50 bg-[var(--primary-soft)]"
                    : "border-[var(--line)] bg-white"
              }`}
            >
              <p className="text-sm font-bold text-[var(--ink)]">{item.day}</p>
              <p className="text-[10px] text-[var(--ink-subtle)]">{item.hasCheckin ? `${item.mealCount} 餐` : "-"}</p>
            </button>
          )
        ))}
      </div>
    </Card>
  );
}
