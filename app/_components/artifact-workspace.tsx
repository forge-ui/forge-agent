"use client";

/**
 * ArtifactWorkspace — 通用左 chat + 右 artifact panel 容器。
 *
 * 职责：
 *   1. 提供 split / fullscreen / closed 三种 panel 模式
 *   2. 管理当前激活的 artifact 和 version
 *   3. 把 ArtifactPanel 渲染好，左边的 chat 内容由调用方通过 children slot 注入
 *
 * 调用方负责：在 children 里塞自己的 chat 流（ChatThread 或自定义），
 *   并通过 useArtifactWorkspaceController 拿到 openArtifact / closeArtifact 控制方法。
 *
 * 设计参考: docs/specs/2026-04-29-artifact-system-design.md §4.2
 */

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ArtifactPanel } from "./artifact-panel";
import type { AnyArtifact } from "@/app/_artifacts/types";

// ----------------------------------------------------------------
// Constants — 与现有 coding-workspace 保持视觉一致
// ----------------------------------------------------------------

const SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";
const CHAT_MAX = 460;
const PANEL_W = `calc(100% - ${CHAT_MAX + 24}px)`;

// ----------------------------------------------------------------
// Public types
// ----------------------------------------------------------------

export type PanelMode = "closed" | "split" | "fullscreen";

export type ArtifactWorkspaceController = {
  /** 打开指定 artifact，可选指定要切到的 version */
  openArtifact: (artifactId: string, versionId?: string) => void;
  /** 关闭 panel（artifact 仍存在，只是 panel 隐藏） */
  closeArtifact: () => void;
  /** 切换全屏 */
  toggleFullscreen: () => void;
  /** 当前激活的 artifact id（无激活时为 null） */
  activeArtifactId: string | null;
  /** 当前 panel 状态 */
  panelMode: PanelMode;
};

export type ArtifactWorkspaceLayout = {
  chatMaxWidth: number;
  isPanelOpen: boolean;
};

export type ArtifactWorkspaceProps = {
  /** 当前 App 下所有 artifact（mock 数据） */
  artifacts: AnyArtifact[];
  /** 默认打开的 artifact id（不传则 panel 默认 closed） */
  defaultArtifactId?: string;
  /** 默认 panel 模式 */
  defaultPanelMode?: PanelMode;
  /**
   * 左侧 chat 区内容。可接受 controller 作为参数，让 chat 内的 artifact-card
   * 点击时调 controller.openArtifact()。
   */
  children: (controller: ArtifactWorkspaceController, layout: ArtifactWorkspaceLayout) => ReactNode;
};

// ----------------------------------------------------------------
// Workspace
// ----------------------------------------------------------------

export function ArtifactWorkspace({
  artifacts,
  defaultArtifactId,
  defaultPanelMode = "closed",
  children,
}: ArtifactWorkspaceProps) {
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(
    defaultArtifactId ?? null,
  );
  const [activeVersionByArtifact, setActiveVersionByArtifact] = useState<Record<string, string>>(
    {},
  );
  const [panelMode, setPanelMode] = useState<PanelMode>(
    defaultArtifactId ? defaultPanelMode : "closed",
  );

  const activeArtifact = useMemo(
    () => artifacts.find((a) => a.id === activeArtifactId) ?? null,
    [artifacts, activeArtifactId],
  );

  const activeVersionId = useMemo(() => {
    if (!activeArtifact) return "";
    return (
      activeVersionByArtifact[activeArtifact.id] ??
      activeArtifact.activeVersionId ??
      activeArtifact.versions[0]?.id ??
      ""
    );
  }, [activeArtifact, activeVersionByArtifact]);

  const openArtifact = useCallback(
    (artifactId: string, versionId?: string) => {
      setActiveArtifactId(artifactId);
      if (versionId) {
        setActiveVersionByArtifact((m) => ({ ...m, [artifactId]: versionId }));
      }
      setPanelMode((m) => (m === "closed" ? "split" : m));
    },
    [],
  );

  const closeArtifact = useCallback(() => {
    setPanelMode("closed");
  }, []);

  const toggleFullscreen = useCallback(() => {
    setPanelMode((m) => (m === "fullscreen" ? "split" : "fullscreen"));
  }, []);

  const onVersionChange = useCallback(
    (versionId: string) => {
      if (!activeArtifact) return;
      setActiveVersionByArtifact((m) => ({ ...m, [activeArtifact.id]: versionId }));
    },
    [activeArtifact],
  );

  const controller: ArtifactWorkspaceController = {
    openArtifact,
    closeArtifact,
    toggleFullscreen,
    activeArtifactId,
    panelMode,
  };

  const isOpen = panelMode !== "closed" && Boolean(activeArtifact);
  const isFull = panelMode === "fullscreen";
  const chatPaddingRight = isOpen ? `calc(${PANEL_W} + 12px)` : "0px";
  const panelWidth = isFull ? "calc(100% - 24px)" : PANEL_W;
  const layout: ArtifactWorkspaceLayout = {
    chatMaxWidth: isOpen ? CHAT_MAX : 820,
    isPanelOpen: isOpen,
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden p-1.5 -mr-6">
      {/* Chat card */}
      <div
        className="h-full"
        style={{
          paddingRight: chatPaddingRight,
          transition: `padding-right 350ms ${SPRING}`,
        }}
      >
        {children(controller, layout)}
      </div>

      {/* Artifact panel */}
      {isOpen && activeArtifact && (
        <div
          className="absolute top-1.5 right-1.5 bottom-1.5 z-20"
          style={{
            width: panelWidth,
            transition: `width 380ms ${SPRING}`,
          }}
        >
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-fg-grey-200 bg-white">
            <ArtifactPanel
              artifact={activeArtifact}
              activeVersionId={activeVersionId}
              onVersionChange={onVersionChange}
              isFullscreen={isFull}
              onToggleFullscreen={toggleFullscreen}
              onClose={closeArtifact}
            />
          </div>
        </div>
      )}
    </div>
  );
}
