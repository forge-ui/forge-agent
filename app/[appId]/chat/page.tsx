import { Suspense } from "react";
import { AppShell } from "@/app/_components/app-shell";
import { ChatRouter } from "@/app/_components/chat-router";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  return (
    <AppShell hideHeader>
      <Suspense fallback={null}>
        <ChatRouter appId={appId} />
      </Suspense>
    </AppShell>
  );
}
