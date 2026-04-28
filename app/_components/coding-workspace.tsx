"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon } from "@forge-ui/react";
import { ChatPillBar, type PillAction } from "./chat-pill-bar";
import {
  AltArrowDownLinear,
  AltArrowRightLinear,
  DatabaseLinear,
  DocumentTextLinear,
  FullScreenLinear,
  QuitFullScreenLinear,
  GlobalLinear,
  LightbulbBoldDuotone,
  MagniferLinear,
  PaperclipLinear,
  PlayCircleBold,
  LayersMinimalisticLinear,
  ChartLinear,
  CodeLinear,
} from "solar-icon-set";
import {
  type ArtifactTab,
  type AssistantStep,
  type ReportArtifact,
  type ReportVersion,
  reportArtifact,
  reportMessages,
} from "@/app/_mock/report-artifact";
import { FollowUps, MarkdownBody, MessageActions } from "./chat-shared";
import { SqlTab } from "./coding/sql-tab";
import { ResultTab } from "./coding/result-tab";
import { ReportTab } from "./coding/report-tab";
import { SchemaTab } from "./coding/schema-tab";

// ============================================================
// Tabs
// ============================================================

const TABS: { id: ArtifactTab; label: string; icon: React.ReactNode }[] = [
  { id: "sql", label: "SQL", icon: <CodeLinear size={14} color="currentColor" /> },
  { id: "result", label: "结果", icon: <LayersMinimalisticLinear size={14} color="currentColor" /> },
  { id: "report", label: "报表", icon: <DocumentTextLinear size={14} color="currentColor" /> },
  { id: "schema", label: "Schema", icon: <DatabaseLinear size={14} color="currentColor" /> },
];

// ============================================================
// Workspace
// ============================================================

type PanelMode = "closed" | "split" | "fullscreen";

const SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";
// Chat wrapper 占 workspace 全宽，chat 内容用 max-w 切换：panel 开 = CHAT_MAX 靠左、关 = 820 居中。
// PANEL_W 公式：workspace 内宽 M = 6(pl) + chat 区(≥CHAT_MAX) + 12(gap) + panel + 6(pr)，所以 panel = M - CHAT_MAX - 24。
const CHAT_MAX = 460;
const PANEL_W = `calc(100% - ${CHAT_MAX + 24}px)`;

export function CodingWorkspace() {
  const [panelMode, setPanelMode] = useState<PanelMode>("split");
  const [activeTab, setActiveTab] = useState<ArtifactTab>("report");
  const [activeVersionId, setActiveVersionId] = useState(reportArtifact.activeVersionId);
  const [draft, setDraft] = useState("");
  const [chatMode, setChatMode] = useState<"think" | "search" | null>(null);

  const artifact = reportArtifact;
  const version = useMemo(
    () => artifact.versions.find((v) => v.id === activeVersionId) ?? artifact.versions[0],
    [artifact, activeVersionId],
  );

  const isOpen = panelMode !== "closed";
  const isFull = panelMode === "fullscreen";

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

  const chatPaddingRight = isOpen ? `calc(${PANEL_W} + 12px)` : "0px";
  const panelTransform = isOpen ? "translateX(0)" : "translateX(calc(100% + 12px))";
  const panelWidth = isFull ? "calc(100% - 24px)" : PANEL_W;

  function openArtifact(tab?: ArtifactTab) {
    setPanelMode((m) => (m === "closed" ? "split" : m));
    if (tab) setActiveTab(tab);
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden p-1.5 -mr-6">
      {/* Chat card — 独立白卡 */}
      <div
        className="h-full"
        style={{
          paddingRight: chatPaddingRight,
          transition: `padding-right 350ms ${SPRING}`,
        }}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <main className="flex-1 px-4 pt-8 pb-4">
            <div
              className="flex flex-col gap-6"
              style={{
                maxWidth: isOpen ? `${CHAT_MAX}px` : "820px",
                marginLeft: isOpen ? "0" : "auto",
                marginRight: "auto",
                transition: `max-width 380ms ${SPRING}`,
              }}
            >
              {reportMessages.map((m) =>
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
                    artifact={m.artifactId === artifact.id ? artifact : null}
                    version={version}
                    onOpen={openArtifact}
                  />
                ),
              )}
            </div>
          </main>
          <div className="sticky bottom-0 bg-gradient-to-t from-fg-grey-50 via-fg-grey-50/95 to-transparent px-4 pb-1 pt-4">
            <div
              style={{
                maxWidth: isOpen ? `${CHAT_MAX}px` : "820px",
                marginLeft: isOpen ? "0" : "auto",
                marginRight: "auto",
                transition: `max-width 380ms ${SPRING}`,
              }}
            >
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
      </div>

      {/* Artifact card — 独立灰卡 */}
      <div
        aria-hidden={!isOpen}
        className="absolute top-1.5 right-1.5 bottom-1.5"
        style={{
          width: panelWidth,
          transform: panelTransform,
          opacity: isOpen ? 1 : 0,
          transition: `transform 380ms ${SPRING}, width 380ms ${SPRING}, opacity 220ms ease-out`,
          pointerEvents: isOpen ? "auto" : "none",
          willChange: "transform, width",
        }}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-fg-grey-200 bg-white">
          <SidePanel
            artifact={artifact}
            version={version}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeVersionId={activeVersionId}
            onVersionChange={setActiveVersionId}
            isFullscreen={isFull}
            onToggleFullscreen={() => setPanelMode(isFull ? "split" : "fullscreen")}
            onClose={() => setPanelMode("closed")}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Splitter
// ============================================================

function Splitter({ onChange }: { onChange: (ratio: number) => void }) {
  const dragging = useRef(false);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return;
      const w = window.innerWidth;
      const r = Math.max(0.25, Math.min(0.75, e.clientX / w));
      onChange(r);
    }
    function onUp() {
      dragging.current = false;
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    function start() {
      dragging.current = true;
      document.body.style.cursor = "col-resize";
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
    const node = document.getElementById("__splitter");
    node?.addEventListener("mousedown", start);
    return () => {
      node?.removeEventListener("mousedown", start);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onChange]);

  return (
    <div
      id="__splitter"
      className="w-1 shrink-0 cursor-col-resize bg-fg-grey-100 transition hover:bg-fg-violet/40"
    />
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
  artifact,
  version,
  onOpen,
}: {
  content: string;
  time: string;
  latency?: string;
  steps?: AssistantStep[];
  followUps?: string[];
  artifact: ReportArtifact | null;
  version: ReportVersion;
  onOpen: (tab?: ArtifactTab) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {steps && steps.length > 0 && <StepList steps={steps} />}
      <MarkdownBody text={content} />
      {artifact && (
        <ArtifactCard
          artifact={artifact}
          version={version}
          onOpen={onOpen}
        />
      )}
      <MessageActions time={time} latency={latency} />
      {followUps && followUps.length > 0 && <FollowUps items={followUps} />}
    </div>
  );
}

// ============================================================
// Step list — AI 思考/查询过程
// ============================================================

const STEP_META: Record<
  AssistantStep["kind"],
  { icon: React.ReactNode; tone: string }
> = {
  understanding: { icon: <LightbulbBoldDuotone size={13} color="#7C3AED" />, tone: "bg-purple-100" },
  schema_explore: { icon: <DatabaseLinear size={13} color="#0369A1" />, tone: "bg-sky-100" },
  sql_draft: { icon: <CodeLinear size={13} color="#0F766E" />, tone: "bg-teal-100" },
  executing: { icon: <PlayCircleBold size={13} color="#D97706" />, tone: "bg-amber-100" },
  analyzing: { icon: <MagniferLinear size={13} color="#6D28D9" />, tone: "bg-violet-100" },
  chart_suggest: { icon: <ChartLinear size={13} color="#0E7490" />, tone: "bg-cyan-100" },
  narrative: { icon: <DocumentTextLinear size={13} color="#374151" />, tone: "bg-fg-grey-100" },
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
          <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
            {okCount}
          </span>
          <span className="font-semibold text-fg-black">已执行 {steps.length} 步</span>
          <span className="text-xs text-fg-grey-700">
            {steps.map((s) => s.title).slice(0, 3).join(" · ")}
            {steps.length > 3 && " ..."}
          </span>
        </div>
        {open ? (
          <AltArrowDownLinear size={14} color="#71717A" />
        ) : (
          <AltArrowRightLinear size={14} color="#71717A" />
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

// ============================================================
// Artifact card (聊天里的小预览)
// ============================================================

function ArtifactCard({
  artifact,
  version,
  onOpen,
}: {
  artifact: ReportArtifact;
  version: ReportVersion;
  onOpen: (tab?: ArtifactTab) => void;
}) {
  const counts = artifactCounts(version);
  return (
    <button
      type="button"
      onClick={() => onOpen("report")}
      className="group flex flex-col gap-3 rounded-2xl border border-fg-grey-200 bg-white p-4 text-left transition-colors duration-200 ease-out hover:border-fg-grey-400"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-purple-100">
          <DocumentTextLinear size={16} color="#7C3AED" />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-sm font-semibold text-fg-black">{artifact.title}</span>
          <span className="text-xs text-fg-grey-700">
            {artifact.versions.length} 个版本 · 当前 {version.label} · {version.summary}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Chip
          icon={<CodeLinear size={11} color="currentColor" />}
          label="SQL"
          onClick={(e) => {
            e.stopPropagation();
            onOpen("sql");
          }}
        />
        <Chip
          icon={<LayersMinimalisticLinear size={11} color="currentColor" />}
          label={`${counts.result} 行结果`}
          onClick={(e) => {
            e.stopPropagation();
            onOpen("result");
          }}
        />
        <Chip
          icon={<DocumentTextLinear size={11} color="currentColor" />}
          label={`${counts.report} 个区块`}
          onClick={(e) => {
            e.stopPropagation();
            onOpen("report");
          }}
        />
      </div>
    </button>
  );
}

function Chip({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <span
      onClick={onClick}
      className="flex cursor-pointer items-center gap-1 rounded-full bg-fg-grey-100 px-2.5 py-0.5 text-xs font-medium text-fg-grey-900 transition hover:bg-fg-violet hover:text-white"
    >
      {icon}
      {label}
    </span>
  );
}

function artifactCounts(version: ReportVersion) {
  return {
    result: version.result.rowCount,
    report: version.report.length,
  };
}

// ============================================================
// Side panel
// ============================================================

function SidePanel({
  artifact,
  version,
  activeTab,
  onTabChange,
  activeVersionId,
  onVersionChange,
  isFullscreen,
  onToggleFullscreen,
  onClose,
}: {
  artifact: ReportArtifact;
  version: ReportVersion;
  activeTab: ArtifactTab;
  onTabChange: (tab: ArtifactTab) => void;
  activeVersionId: string;
  onVersionChange: (id: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-fg-grey-200 px-5 py-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-grey-700">
            REPORT · {artifact.database.database}.{artifact.database.schema}
          </span>
          <span className="truncate font-display text-base font-bold text-fg-black">
            {artifact.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activeVersionId}
            onChange={(e) => onVersionChange(e.target.value)}
            className="cursor-pointer rounded-full border border-fg-grey-200 bg-white px-3 py-1.5 text-xs font-medium text-fg-grey-900 hover:border-fg-grey-400 focus:border-fg-violet focus:outline-none"
          >
            {artifact.versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} · {v.summary}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? "退出全屏" : "全屏"}
            className="flex size-8 items-center justify-center rounded text-fg-grey-700 transition hover:bg-fg-grey-100 hover:text-fg-violet"
          >
            {isFullscreen ? (
              <QuitFullScreenLinear size={18} color="currentColor" />
            ) : (
              <FullScreenLinear size={18} color="currentColor" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex size-8 items-center justify-center rounded text-fg-grey-700 transition hover:bg-fg-grey-100 hover:text-fg-violet"
          >
            <CloseIcon size={20} />
          </button>
        </div>
      </header>

      <nav className="flex items-center gap-1 border-b border-fg-grey-200 px-3">
        {TABS.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={
                isActive
                  ? "-mb-px flex items-center gap-1.5 border-b-2 border-fg-violet px-3 py-2.5 text-sm font-semibold text-fg-violet"
                  : "-mb-px flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-fg-grey-700 transition hover:text-fg-black"
              }
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1 overflow-hidden">
        {activeTab === "sql" && <SqlTab version={version} />}
        {activeTab === "result" && <ResultTab result={version.result} />}
        {activeTab === "report" && <ReportTab blocks={version.report} />}
        {activeTab === "schema" && <SchemaTab database={artifact.database} />}
      </div>
    </div>
  );
}
