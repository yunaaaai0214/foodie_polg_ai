# Foodie Plog AI (Prototype)

A warm, lifestyle-style frontend prototype built with Next.js + TypeScript + Tailwind CSS.

## Pages
- `/today` 今日打卡
- `/entry/[entryId]/assets` 上传与管理
- `/editor/[photoId]` 图片编辑器
- `/ai/[entryId]` AI 生成工作台
- `/publish/[entryId]` 发布预览
- `/calendar` 日历总览
- `/history/[date]` 历史详情
- `/settings` 设置

## Component Split
- `src/components/CalendarPanel.tsx`
- `src/components/MealSection.tsx`
- `src/components/PhotoCard.tsx`
- `src/components/UploadModal.tsx`
- `src/components/PhotoEditorCanvas.tsx`
- `src/components/FilterToolbar.tsx`
- `src/components/StickerToolbar.tsx`
- `src/components/AIContentPanel.tsx`
- `src/components/SharePreviewCard.tsx`

## Mock Data
- `src/mock/mock-data.ts`

## Mock API Routes
- `GET /api/calendar`
- `GET /api/entries/[entryId]`
- `GET /api/photos/[photoId]`
- `GET /api/ai/[entryId]`
- `POST /api/ai/[entryId]`
- `POST /api/ai/generate` (Mock AI 文案生成)
- `GET /api/oss/state?key=...` (读取 OSS 中的 JSON 状态)
- `POST /api/oss/state` (写入 JSON 状态到 OSS)

## Aliyun OSS Setup
Create `.env.local` in project root:

```bash
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_OSS_BUCKET=your-bucket-name
ALIYUN_OSS_ACCESS_KEY_ID=your-access-key-id
ALIYUN_OSS_ACCESS_KEY_SECRET=your-access-key-secret
ALIYUN_OSS_ENDPOINT=
ALIYUN_OSS_SECURE=true
ALIYUN_OSS_STATE_PREFIX=foodie-plog/state
```

Important:
- Do not use Alibaba Cloud account login password in code.
- Use AccessKey ID / AccessKey Secret (preferably from a RAM user with least privilege to this bucket only).

## Run
1. Install Node.js 20+
2. Run:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Notes
- This version uses mock data/mock API and stores user-generated state in `localStorage`.
- When OSS env vars are configured, app state is also synced to your Aliyun bucket.
- No database is connected yet.
- The project is structured for easy migration to a real DB and AI APIs.
