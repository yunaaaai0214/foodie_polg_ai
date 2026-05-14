"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarPanel } from "@/components/CalendarPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ensurePlogState } from "@/lib/plog-store";
import { selectCalendarDays } from "@/lib/plog-selectors";
import { CalendarDay, PlogState } from "@/lib/types";
import { mockUser } from "@/mock/mock-data";

const VIEW_YEAR = 2026;
const VIEW_MONTH = 5;

export default function CalendarPage() {
  const [plogState, setPlogState] = useState<PlogState | null>(null);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [pickedDate, setPickedDate] = useState("2026-05-12");

  useEffect(() => {
    const nextState = ensurePlogState();
    setPlogState(nextState);
    setDays(selectCalendarDays(nextState, VIEW_YEAR, VIEW_MONTH));
  }, []);

  const selected = useMemo(() => days.find((item) => item.date === pickedDate), [days, pickedDate]);
  const checkinDays = useMemo(() => days.filter((day) => day.hasCheckin).length, [days]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="打卡日历"
        subtitle="用连续记录保持创作手感"
        action={
          <Button
            variant="secondary"
            onClick={() => {
              if (!plogState) {
                return;
              }
              setDays(selectCalendarDays(plogState, VIEW_YEAR, VIEW_MONTH));
            }}
          >
            刷新数据
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <CalendarPanel days={days} year={VIEW_YEAR} month={VIEW_MONTH} selectedDate={pickedDate} onPickDate={(date) => setPickedDate(date)} />

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-base font-bold text-[var(--olive)]">本月统计</h3>
            <div className="mt-3 space-y-2 text-sm">
              <p>打卡天数：<span className="font-bold">{checkinDays} 天</span></p>
              <p>最长连续：<span className="font-bold">{mockUser.streakDays} 天</span></p>
              <p>AI 生成：<span className="font-bold">9 次</span></p>
            </div>
            <Badge className="mt-4">保持节奏，很棒</Badge>
          </Card>

          <Card className="p-5">
            <h3 className="text-base font-bold text-[var(--olive)]">{pickedDate}</h3>
            <p className="mt-1 text-sm text-[var(--ink-subtle)]">{selected?.hasCheckin ? `已打卡 · ${selected.mealCount} 餐` : "暂无打卡"}</p>
            {selected?.coverThumb ? <img src={selected.coverThumb} alt="cover" className="mt-3 h-32 w-full rounded-xl object-cover" /> : null}
            <Link
              href={`/history/${pickedDate}`}
              className="mt-3 inline-block rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink-subtle)] transition hover:bg-[var(--primary-soft)]"
            >
              查看当天记录
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
