import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="设置" subtitle="把常用偏好一次配置好" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-base font-bold text-[var(--olive)]">个人资料</h3>
          <div className="mt-3 space-y-3 text-sm">
            <label className="block">
              <span className="text-[var(--ink-subtle)]">昵称</span>
              <input className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2" defaultValue="Miya" />
            </label>
            <label className="block">
              <span className="text-[var(--ink-subtle)]">默认平台</span>
              <select className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2">
                <option>小红书</option>
                <option>Instagram</option>
                <option>朋友圈</option>
              </select>
            </label>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-bold text-[var(--olive)]">默认生成风格</h3>
          <div className="mt-3 space-y-3 text-sm">
            <label className="block">
              <span className="text-[var(--ink-subtle)]">语气</span>
              <select className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2">
                <option>治愈日常</option>
                <option>精致仪式感</option>
                <option>探店测评</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[var(--ink-subtle)]">默认 hashtag 数量</span>
              <input type="number" className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2" defaultValue={5} />
            </label>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-bold text-[var(--olive)]">导出偏好</h3>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <button className="rounded-full bg-[var(--primary)] px-3 py-1.5 text-white">4:5</button>
            <button className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5">1:1</button>
            <button className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5">9:16</button>
          </div>
          <p className="mt-3 text-sm text-[var(--ink-subtle)]">默认清晰度：1080p · 自动添加角标关闭</p>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-bold text-[var(--olive)]">数据与隐私</h3>
          <p className="mt-3 text-sm text-[var(--ink-subtle)]">你的图片与文案仅用于打卡与生成，不用于公开训练。</p>
          <Button variant="secondary" className="mt-4">清理本地缓存</Button>
        </Card>
      </div>
    </div>
  );
}

