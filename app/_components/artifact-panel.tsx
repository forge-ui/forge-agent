"use client";

/**
 * ArtifactPanel — 右侧 artifact 渲染容器（通用，所有 artifact type 共享）。
 *
 * Header: title / status / version dropdown / exporter 菜单 / fullscreen / close
 * Body:   按 artifact.type 查 registry 拿到 def.Render，渲染对应组件
 *
 * 用 instance key 强制 remount —— 切 artifact / 切 version 时整个 Render 树重建，
 * 各组件内部 useEffect cleanup 自动跑，避免残留 worker / canvas / listener。
 *
 * 设计参考: docs/specs/2026-04-29-artifact-system-design.md §3.5
 */

import { useMemo, useState } from "react";
import {
  CloseIcon,
} from "@forge-ui-official/core";
import {
  AltArrowDownLinear,
  DownloadLinear,
  FullScreenLinear,
  QuitFullScreenLinear,
  RefreshLinear,
} from "solar-icon-set";
import { getArtifactDef } from "@/app/_artifacts/registry";
import type { AnyArtifact, ArtifactStatus } from "@/app/_artifacts/types";

// ----------------------------------------------------------------
// Public API
// ----------------------------------------------------------------

export type ArtifactPanelProps = {
  artifact: AnyArtifact;
  activeVersionId: string;
  onVersionChange: (versionId: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose: () => void;
  /** 用户在 panel 内编辑产生的 dirty payload；P1 占位，P2 接 store */
  onPayloadChange?: (next: unknown) => void;
};

export function ArtifactPanel({
  artifact,
  activeVersionId,
  onVersionChange,
  isFullscreen,
  onToggleFullscreen,
  onClose,
  onPayloadChange,
}: ArtifactPanelProps) {
  const def = getArtifactDef(artifact.type);
  const version = useMemo(
    () => artifact.versions.find((v) => v.id === activeVersionId) ?? artifact.versions[0],
    [artifact.versions, activeVersionId],
  );

  const isStreaming = artifact.status === "streaming";
  const exporterEntries = version && def?.exporters ? Object.entries(def.exporters) : [];

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title={artifact.title}
        typeLabel={def?.label ?? artifact.type}
        status={artifact.status}
        versions={artifact.versions.map((v) => ({ id: v.id, label: v.label ?? v.id }))}
        activeVersionId={activeVersionId}
        onVersionChange={onVersionChange}
        exporters={exporterEntries.map(([fmt]) => fmt)}
        onExport={async (fmt) => {
          if (!version || !def?.exporters?.[fmt]) return;
          const blob = await def.exporters[fmt](version.payload as never);
          downloadBlob(blob, `${artifact.title}.${fmt}`);
        }}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        onClose={onClose}
      />

      <div className="flex-1 overflow-hidden">
        {!version ? (
          <FallbackEmptyArtifact status={artifact.status} />
        ) : def ? (
          <def.Render
            // instance key — 切 version / 切 artifact 时整个组件 remount，
            // 各组件 useEffect cleanup 自然触发，避免泄漏 worker/canvas/listener
            key={`${artifact.id}-${version.id}`}
            payload={version.payload as never}
            readOnly={isStreaming}
            onChange={onPayloadChange as never}
          />
        ) : (
          <FallbackUnsupported type={artifact.type} />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Header
// ----------------------------------------------------------------

function PanelHeader({
  title,
  typeLabel,
  status,
  versions,
  activeVersionId,
  onVersionChange,
  exporters,
  onExport,
  isFullscreen,
  onToggleFullscreen,
  onClose,
}: {
  title: string;
  typeLabel: string;
  status: ArtifactStatus;
  versions: { id: string; label: string }[];
  activeVersionId: string;
  onVersionChange: (id: string) => void;
  exporters: string[];
  onExport: (fmt: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose: () => void;
}) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-fg-grey-200 px-5 py-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-grey-700">
            {typeLabel}
          </span>
          <StatusBadge status={status} />
        </div>
        <span className="truncate font-display text-base font-bold text-fg-black">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {versions.length > 1 && (
          <select
            value={activeVersionId}
            onChange={(e) => onVersionChange(e.target.value)}
            className="cursor-pointer rounded-full border border-fg-grey-200 bg-white px-3 py-1.5 text-xs font-medium text-fg-grey-900 hover:border-fg-grey-400 focus:border-fg-blue-500 focus:outline-none"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        )}
        {exporters.length > 0 && <ExportMenu formats={exporters} onPick={onExport} />}
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? "退出全屏" : "全屏"}
          className="flex size-8 items-center justify-center rounded text-fg-grey-700 transition hover:bg-fg-grey-100 hover:text-fg-blue-500"
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
          className="flex size-8 items-center justify-center rounded text-fg-grey-700 transition hover:bg-fg-grey-100 hover:text-fg-blue-500"
        >
          <CloseIcon size={20} />
        </button>
      </div>
    </header>
  );
}

// ----------------------------------------------------------------
// Status badge
// ----------------------------------------------------------------

function StatusBadge({ status }: { status: ArtifactStatus }) {
  if (status === "streaming") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-fg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-fg-blue-500">
        <RefreshLinear size={10} color="currentColor" />
        生成中
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="rounded-full bg-fg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-fg-red">
        出错
      </span>
    );
  }
  return null; // ready 不显示
}

// ----------------------------------------------------------------
// Export menu
// ----------------------------------------------------------------

function ExportMenu({
  formats,
  onPick,
}: {
  formats: string[];
  onPick: (fmt: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full border border-fg-grey-200 bg-white px-2.5 py-1.5 text-xs font-medium text-fg-grey-900 transition hover:border-fg-grey-400"
      >
        <DownloadLinear size={12} color="currentColor" />
        导出
        <AltArrowDownLinear size={10} color="currentColor" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul className="absolute right-0 top-full z-20 mt-1 flex min-w-[120px] flex-col rounded-xl border border-fg-grey-200 bg-white py-1 shadow-lg">
            {formats.map((fmt) => (
              <li key={fmt}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(fmt);
                    setOpen(false);
                  }}
                  className="flex w-full items-center px-3 py-1.5 text-left text-xs font-medium text-fg-grey-900 transition hover:bg-fg-grey-100"
                >
                  .{fmt}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Fallback for unregistered types
// ----------------------------------------------------------------

function FallbackUnsupported({ type }: { type: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
      <span className="text-sm font-semibold text-fg-grey-900">暂不支持的 artifact 类型</span>
      <code className="rounded bg-fg-grey-100 px-2 py-0.5 font-mono text-xs text-fg-grey-700">
        type = {type}
      </code>
      <p className="max-w-[280px] text-xs leading-relaxed text-fg-grey-700">
        对应的 artifact 模块尚未注册到 registry，可能在后续 phase 中实现。
      </p>
    </div>
  );
}

function FallbackEmptyArtifact({ status }: { status: ArtifactStatus }) {
  const isStreaming = status === "streaming";
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
      <span className="text-sm font-semibold text-fg-grey-900">
        {isStreaming ? "Artifact 正在准备中" : "Artifact 暂无可用版本"}
      </span>
      <p className="max-w-[300px] text-xs leading-relaxed text-fg-grey-700">
        {isStreaming
          ? "后端还没有返回首个可渲染版本，面板会在版本到达后自动展示。"
          : "当前 artifact 没有 versions 数据，已阻止空 payload 渲染。"}
      </p>
    </div>
  );
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
