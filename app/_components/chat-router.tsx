"use client";

import { useSearchParams } from "next/navigation";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatThread } from "./chat-thread";
import { CodingWorkspace } from "./coding-workspace";

export function ChatRouter({ appId }: { appId: string }) {
  const c = useSearchParams().get("c");
  if (!c) return <ChatEmptyState />;
  if (appId === "coding") return <CodingWorkspace conversationId={c} />;
  return <ChatThread key={c} conversationId={c} />;
}
