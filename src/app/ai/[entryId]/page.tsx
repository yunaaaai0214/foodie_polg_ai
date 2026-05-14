import { AIContentPanel } from "@/components/AIContentPanel";
import { PageHeader } from "@/components/ui/page-header";

interface AiPageProps {
  params: Promise<{ entryId: string }>;
}

export default async function AiPage({ params }: AiPageProps) {
  const { entryId } = await params;

  return (
    <div className="space-y-6">
      <PageHeader title="AI 生成工作台" subtitle="一屏完成总结图、标题、文案和标签" />
      <AIContentPanel entryId={entryId} />
    </div>
  );
}
