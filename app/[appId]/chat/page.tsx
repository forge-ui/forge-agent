import { AppShell } from "@/app/_components/app-shell";
import { ChatThread } from "@/app/_components/chat-thread";

export default function ChatPage() {
  return (
    <AppShell hideHeader>
      <ChatThread />
    </AppShell>
  );
}
