import { AppShell } from "@/app/_components/app-shell";
import { ChatEmptyState } from "@/app/_components/chat-empty-state";
import { ChatThread } from "@/app/_components/chat-thread";
import { CodingWorkspace } from "@/app/_components/coding-workspace";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ appId: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { appId } = await params;
  const { c } = await searchParams;

  let content: React.ReactNode;
  if (!c) {
    content = <ChatEmptyState />;
  } else if (appId === "coding") {
    content = <CodingWorkspace />;
  } else {
    content = <ChatThread />;
  }

  return <AppShell hideHeader>{content}</AppShell>;
}
