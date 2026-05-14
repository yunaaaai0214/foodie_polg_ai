import { NextResponse } from "next/server";
import { AiCopyRequest, AiCopyResult, AiStyle, MealType } from "@/lib/types";

const allowedMealTimes: MealType[] = ["breakfast", "lunch", "tea", "dinner", "snack"];
const allowedStyles: AiStyle[] = ["小红书", "Instagram", "治愈风", "幽默风", "精致探店风"];

const mealLabelMap: Record<MealType, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  tea: "下午茶",
  dinner: "晚餐",
  snack: "加餐"
};

const styleToneMap: Record<AiStyle, string> = {
  小红书: "生活感、轻松真实",
  Instagram: "画面感、简洁国际化",
  治愈风: "温柔、松弛、带情绪价值",
  幽默风: "俏皮、有梗、口语化",
  精致探店风: "细节导向、品鉴感"
};

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function clampText(value: string, limit: number): string {
  return value.trim().slice(0, limit);
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick<T>(list: T[], seed: number, offset = 0): T {
  return list[(seed + offset) % list.length];
}

function generateMockResult(input: AiCopyRequest): AiCopyResult {
  const seed = hashSeed(`${input.date}-${input.mealTime}-${input.style}-${input.imageDescription}`);
  const mealLabel = mealLabelMap[input.mealTime];
  const styleTone = styleToneMap[input.style];

  const titleTemplates = [
    `${mealLabel}幸福感被这一口拉满`,
    `今天的${mealLabel}，好吃到想立刻分享`,
    `${mealLabel}小确幸，认真吃饭的回报`
  ];

  const shortTemplates = [
    `${mealLabel}吃到心情变好：${input.imageDescription.slice(0, 30)}，这口太值了。`,
    `今日${mealLabel}关键词：香、嫩、满足。${input.style}风拿捏住了。`,
    `把普通一天变好吃的秘诀：一顿认真吃的${mealLabel}。`
  ];

  const detailTemplates = [
    `今天的${mealLabel}主打一个${styleTone}。${input.imageDescription} 整体口感层次很完整，从第一口到收尾都很舒服，属于会想二刷的一餐。`,
    `这次${mealLabel}给我的感觉是：食材状态在线、风味平衡、情绪加分。${input.imageDescription} ${input.style}风格下特别适合发社交平台。`,
    `${mealLabel}记录一下今天的好味道：${input.imageDescription} 味道和氛围都很加分，吃完有种“生活被妥帖照顾”的满足感。`
  ];

  const summaryTemplates = [
    "认真吃饭，就是给今天最好的奖励。",
    "好吃的每一口，都值得被记录。",
    "把日常过成值得收藏的小瞬间。"
  ];

  const hashtagPool = [
    "#美食plog",
    "#今日份好吃",
    "#好好吃饭",
    "#生活碎片",
    "#FoodieDiary",
    "#吃货日常",
    "#美食分享",
    "#探店记录",
    "#lifestyle"
  ];

  const hashtagCount = 5 + (seed % 4); // 5-8
  const hashtags: string[] = [];
  for (let i = 0; i < hashtagCount; i += 1) {
    const candidate = pick(hashtagPool, seed, i);
    if (!hashtags.includes(candidate)) {
      hashtags.push(candidate);
    }
  }

  return {
    title: clampText(pick(titleTemplates, seed), 40),
    shortCaption: clampText(pick(shortTemplates, seed, 1), 80),
    detailedCaption: clampText(pick(detailTemplates, seed, 2), 150),
    hashtags,
    summaryLine: clampText(pick(summaryTemplates, seed, 3), 24)
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AiCopyRequest>;

  if (!body.date || !isValidDate(body.date)) {
    return NextResponse.json({ error: "Invalid date format. Expected YYYY-MM-DD." }, { status: 400 });
  }

  if (!body.mealTime || !allowedMealTimes.includes(body.mealTime)) {
    return NextResponse.json({ error: "Invalid meal time." }, { status: 400 });
  }

  if (!body.style || !allowedStyles.includes(body.style)) {
    return NextResponse.json({ error: "Invalid style." }, { status: 400 });
  }

  if (!body.imageDescription || body.imageDescription.trim().length < 4) {
    return NextResponse.json({ error: "Image description is too short." }, { status: 400 });
  }

  const payload: AiCopyRequest = {
    date: body.date,
    mealTime: body.mealTime,
    style: body.style,
    imageDescription: body.imageDescription.trim()
  };

  const result = generateMockResult(payload);
  return NextResponse.json({ result });
}
