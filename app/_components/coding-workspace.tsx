"use client";

/**
 * CodingWorkspace — 编程 App 的 chat 工作区。
 *
 * 已迁移到 ArtifactWorkspace 通用容器；右侧 panel 走 ArtifactRegistry 渲染
 * （当前 mock 数据走 report artifact），左侧消息流保留原视觉。
 */

import { useState } from "react";
import {
  AltArrowDownLinear,
  AltArrowRightLinear,
  ChartLinear,
  CodeLinear,
  DatabaseLinear,
  DocumentTextLinear,
  GlobalLinear,
  LightbulbBoldDuotone,
  MagniferLinear,
  PaperclipLinear,
  PlayCircleBold,
} from "solar-icon-set";
import { ArtifactCard } from "./artifact-card";
import {
  ArtifactWorkspace,
  type ArtifactWorkspaceController,
  type ArtifactWorkspaceLayout,
} from "./artifact-workspace";
import { ChatPillBar, type PillAction } from "./chat-pill-bar";
import { FollowUps, MarkdownBody, MessageActions } from "./chat-shared";
import {
  type AssistantStep,
  reportMessages,
} from "@/app/_mock/report-artifact";
import {
  getMockArtifacts,
  getMockExtraMessages,
  type ExtraArtifactRef,
} from "@/app/_mock/artifacts";

// ============================================================
// Workspace
// ============================================================

export function CodingWorkspace({ conversationId }: { conversationId: string }) {
  const artifacts = getMockArtifacts("coding");

  return (
    <ArtifactWorkspace key={conversationId} artifacts={artifacts}>
      {(controller, layout) => (
        <CodingChatStream
          controller={controller}
          conversationId={conversationId}
          layout={layout}
        />
      )}
    </ArtifactWorkspace>
  );
}

// ============================================================
// Chat stream — 渲染 reportMessages，AI 消息内的 artifact 卡片走新组件
// ============================================================

function CodingChatStream({
  controller,
  conversationId,
  layout,
}: {
  controller: ArtifactWorkspaceController;
  conversationId: string;
  layout: ArtifactWorkspaceLayout;
}) {
  const [draft, setDraft] = useState("");
  const [chatMode, setChatMode] = useState<"think" | "search" | null>(null);

  const pillActions: PillAction[] = [
    {
      id: "think",
      label: "深度思考",
      icon: <LightbulbBoldDuotone size={16} color="currentColor" />,
      active: chatMode === "think",
      onClick: () => setChatMode(chatMode === "think" ? null : "think"),
    },
    {
      id: "search",
      label: "联网搜索",
      icon: <GlobalLinear size={16} color="currentColor" />,
      active: chatMode === "search",
      onClick: () => setChatMode(chatMode === "search" ? null : "search"),
    },
    {
      id: "upload",
      label: "上传文件",
      icon: <PaperclipLinear size={16} color="currentColor" />,
      closeOnClick: true,
      onClick: () => {},
    },
  ];

  const baseMessages = conversationId === "c-1" ? reportMessages : [];
  const extraMessages = getMockExtraMessages("coding", conversationId);
  const chatColumnStyle = {
    maxWidth: `${layout.chatMaxWidth}px`,
    marginLeft: layout.isPanelOpen ? "0" : "auto",
    marginRight: "auto",
    transition: "max-width 380ms cubic-bezier(0.32, 0.72, 0, 1)",
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto px-4 pt-8 pb-44">
        <div className="flex w-full flex-col gap-6" style={chatColumnStyle}>
          {baseMessages.map((m) =>
            m.role === "user" ? (
              <UserMessage key={m.id} content={m.content} time={m.time} />
            ) : (
              <AssistantMessage
                key={m.id}
                content={m.content}
                time={m.time}
                latency={m.latency}
                steps={m.steps}
                followUps={m.followUps}
                artifactId={m.artifactId}
                onOpenArtifact={controller.openArtifact}
              />
            ),
          )}
          {extraMessages.map((m) =>
            m.role === "user" ? (
              <UserMessage key={m.id} content={m.content} time={m.time} />
            ) : (
              <AssistantMessage
                key={m.id}
                content={m.content}
                time={m.time}
                artifactRef={m.artifactRef}
                onOpenArtifact={controller.openArtifact}
              />
            ),
          )}
        </div>
      </main>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-fg-grey-50 via-fg-grey-50/95 to-transparent px-4 pb-6 pt-10">
        <div className="pointer-events-auto w-full" style={chatColumnStyle}>
          <ChatPillBar
            placeholder="问点别的数据，比如「再看下产品类目维度」"
            value={draft}
            onChange={setDraft}
            onSend={() => setDraft("")}
            actions={pillActions}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Messages
// ============================================================

function UserMessage({ content, time }: { content: string; time: string }) {
  return (
    <div className="flex justify-end">
      <div className="flex max-w-[80%] flex-col items-end gap-1.5">
        <div className="rounded-2xl bg-fg-grey-100 px-4 py-2.5 text-[15px] leading-7 text-fg-black">
          {content}
        </div>
        <span className="text-xs text-fg-grey-500">{time}</span>
      </div>
    </div>
  );
}

function AssistantMessage({
  content,
  time,
  latency,
  steps,
  followUps,
  artifactId,
  artifactRef,
  onOpenArtifact,
}: {
  content: string;
  time: string;
  latency?: string;
  steps?: AssistantStep[];
  followUps?: string[];
  artifactId?: string;
  artifactRef?: ExtraArtifactRef;
  onOpenArtifact: (id: string) => void;
}) {
  // artifactRef 优先（来自新 mock），其次回退到 reportMessages 的 artifactId（默认 report 类型）
  const cardProps = artifactRef
    ? {
        artifactId: artifactRef.artifactId,
        action: "update" as const,
        preview: {
          type: artifactRef.type,
          title: artifactRef.title,
          subtitle: artifactRef.subtitle,
        },
      }
    : artifactId
      ? {
          artifactId,
          action: "update" as const,
          preview: {
            type: "report" as const,
            title: "销售订单分析",
            subtitle: "SQL · 结果 · 报表 · Schema",
          },
        }
      : null;

  return (
    <div className="flex flex-col gap-3">
      {steps && steps.length > 0 && <StepList steps={steps} />}
      <MarkdownBody text={content} />
      {cardProps && (
        <ArtifactCard
          {...cardProps}
          onOpen={onOpenArtifact}
        />
      )}
      <MessageActions time={time} latency={latency} />
      {followUps && followUps.length > 0 && <FollowUps items={followUps} />}
    </div>
  );
}

// ============================================================
// Step list — AI 思考/查询过程（保留现有视觉）
// ============================================================

const STEP_META: Record<
  AssistantStep["kind"],
  { icon: React.ReactNode; tone: string }
> = {
  understanding: { icon: <LightbulbBoldDuotone size={13} color="var(--fg-blue)" />, tone: "bg-fg-blue-100" },
  schema_explore: { icon: <DatabaseLinear size={13} color="var(--fg-blue-700)" />, tone: "bg-fg-blue-100" },
  sql_draft: { icon: <CodeLinear size={13} color="var(--fg-green-700)" />, tone: "bg-fg-green-100" },
  executing: { icon: <PlayCircleBold size={13} color="var(--fg-yellow-700)" />, tone: "bg-fg-yellow-100" },
  analyzing: { icon: <MagniferLinear size={13} color="var(--fg-blue)" />, tone: "bg-fg-blue-100" },
  chart_suggest: { icon: <ChartLinear size={13} color="var(--fg-cyan-700)" />, tone: "bg-fg-cyan-100" },
  narrative: { icon: <DocumentTextLinear size={13} color="var(--fg-grey-800)" />, tone: "bg-fg-grey-100" },
};

function StepList({ steps }: { steps: AssistantStep[] }) {
  const [open, setOpen] = useState(false);
  const okCount = steps.filter((s) => s.status === "ok").length;
  return (
    <div className="overflow-hidden rounded-xl border border-fg-grey-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left transition hover:bg-fg-grey-50"
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="flex size-5 items-center justify-center rounded-full bg-fg-green-100 text-[10px] font-bold text-fg-green-700">
            {okCount}
          </span>
          <span className="font-semibold text-fg-black">已执行 {steps.length} 步</span>
          <span className="text-xs text-fg-grey-700">
            {steps.map((s) => s.title).slice(0, 3).join(" · ")}
            {steps.length > 3 && " ..."}
          </span>
        </div>
        {open ? (
          <AltArrowDownLinear size={14} color="var(--fg-grey-700)" />
        ) : (
          <AltArrowRightLinear size={14} color="var(--fg-grey-700)" />
        )}
      </button>
      {open && (
        <ol className="flex flex-col gap-0.5 border-t border-fg-grey-200 px-4 py-3">
          {steps.map((s, i) => {
            const meta = STEP_META[s.kind];
            return (
              <li key={s.id} className="flex gap-3 py-1.5">
                <div className="flex flex-col items-center pt-0.5">
                  <span className={`flex size-6 items-center justify-center rounded-full ${meta.tone}`}>
                    {meta.icon}
                  </span>
                  {i < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-fg-grey-200" />}
                </div>
                <div className="flex flex-1 flex-col gap-0.5 pb-1">
                  <span className="text-sm font-semibold text-fg-black">{s.title}</span>
                  <span className="text-xs leading-relaxed text-fg-grey-700">{s.summary}</span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
