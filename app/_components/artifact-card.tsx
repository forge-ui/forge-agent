"use client";

/**
 * Chat 消息内的 artifact 引用卡片。
 *
 * AI 消息可在 parts 里挂 { kind: "artifact-ref", ... }，渲染成可点击卡片，
 * 用户点击后通知 ArtifactWorkspace 切换右侧 panel 到对应 artifact。
 *
 * preview 字段冗余存 type/title，避免历史消息渲染依赖 artifact store 全量加载。
 *
 * Icon 容器走 forge-ui/react 的 CircleIcon（light variant）保持视觉与 Kit 一致。
 */

import { CircleIcon } from "@forge-ui-official/core";
import {
  ChartBoldDuotone,
  ChatRoundDotsBoldDuotone,
  CodeSquareBoldDuotone,
  DatabaseBoldDuotone,
  DocumentTextBoldDuotone,
  GalleryBoldDuotone,
  GlobalBoldDuotone,
  LayersMinimalisticBoldDuotone,
  PieChartBoldDuotone,
  PaletteBoldDuotone,
} from "solar-icon-set";
import type { ArtifactType } from "@/app/_artifacts/types";

const TYPE_ICON: Record<ArtifactType, React.ComponentType<{ size?: number; color?: string }>> = {
  markdown: DocumentTextBoldDuotone,
  document: DocumentTextBoldDuotone,
  spreadsheet: LayersMinimalisticBoldDuotone,
  slide: GalleryBoldDuotone,
  code: CodeSquareBoldDuotone,
  whiteboard: PaletteBoldDuotone,
  diagram: ChartBoldDuotone,
  mindmap: PieChartBoldDuotone,
  pdf: DocumentTextBoldDuotone,
  web: GlobalBoldDuotone,
  report: DatabaseBoldDuotone,
};

const TYPE_LABEL: Record<ArtifactType, string> = {
  markdown: "Markdown",
  document: "Word 文档",
  spreadsheet: "电子表格",
  slide: "演示幻灯",
  code: "代码",
  whiteboard: "白板",
  diagram: "图表",
  mindmap: "思维导图",
  pdf: "PDF",
  web: "网页预览",
  report: "数据报表",
};

const ACTION_TEXT: Record<"create" | "update", string> = {
  create: "创建了",
  update: "更新了",
};

export type ArtifactCardProps = {
  artifactId: string;
  action: "create" | "update";
  preview: { type: ArtifactType; title: string; subtitle?: string };
  onOpen?: (artifactId: string) => void;
};

export function ArtifactCard({ artifactId, action, preview, onOpen }: ArtifactCardProps) {
  const Icon = TYPE_ICON[preview.type] ?? ChatRoundDotsBoldDuotone;
  const typeLabel = TYPE_LABEL[preview.type] ?? preview.type;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(artifactId)}
      className="group flex w-full max-w-[420px] items-center gap-3 rounded-2xl border border-fg-grey-200 bg-white px-3 py-2.5 text-left transition hover:border-fg-blue-500 hover:shadow-sm"
    >
      <CircleIcon color="blue" size="md" variant="light">
        <Icon size={18} color="var(--fg-blue-500)" />
      </CircleIcon>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-medium text-fg-grey-700">
          {ACTION_TEXT[action]} {typeLabel}
        </span>
        <span className="truncate text-sm font-semibold text-fg-black">{preview.title}</span>
        {preview.subtitle && (
          <span className="truncate text-xs text-fg-grey-700">{preview.subtitle}</span>
        )}
      </div>
      <span className="text-xs font-medium text-fg-blue-500 opacity-0 transition group-hover:opacity-100">
        打开 →
      </span>
    </button>
  );
}
