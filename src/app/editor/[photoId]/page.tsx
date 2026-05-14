import { EditorWorkspace } from "@/components/EditorWorkspace";

interface EditorPageProps {
  params: Promise<{ photoId: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { photoId } = await params;
  return <EditorWorkspace photoId={photoId} />;
}
