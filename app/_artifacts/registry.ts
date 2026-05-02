/**
 * Artifact Registry — 所有 artifact type 的统一注册表。
 *
 * 强制边界规则（违反会导致主 bundle 失控）：
 * 每个 _artifacts/{type}/index.ts 顶层禁止 import 任何重型库
 * （Plate / Excalidraw / Mermaid / CodeMirror / EmbedPDF / Markmap / Univer / PptxGenJS 等）。
 * 各 index.ts 只能：
 *   ✅ Export 一个 ArtifactDefinition，其 Render 是 dynamic(() => import("./render"), { ssr: false })
 *   ✅ Export 轻量 metadata（label / icon / type）
 *   ❌ 顶层 import 重型库 — 必须放进 ./render.tsx 才能被 dynamic 切独立 chunk
 *
 * 设计参考: docs/specs/2026-04-29-artifact-system-design.md §3.2
 */

import { codeArtifact } from "./code";
import { diagramArtifact } from "./diagram";
import { documentArtifact } from "./document";
import { markdownArtifact } from "./markdown";
import { mindmapArtifact } from "./mindmap";
import { pdfArtifact } from "./pdf";
import { reportArtifact } from "./report";
import { slideArtifact } from "./slide";
import { spreadsheetArtifact } from "./spreadsheet";
import { webArtifact } from "./web";
import { whiteboardArtifact } from "./whiteboard";
import type { ArtifactDefinition, ArtifactType } from "./types";

// 10 类 artifact 全部落地。P4 留高级模式（diagram-interactive / mindmap-editable / code-runnable）
export const artifactRegistry: Partial<Record<ArtifactType, ArtifactDefinition<any>>> = {
  code: codeArtifact,
  diagram: diagramArtifact,
  document: documentArtifact,
  markdown: markdownArtifact,
  mindmap: mindmapArtifact,
  pdf: pdfArtifact,
  report: reportArtifact,
  slide: slideArtifact,
  spreadsheet: spreadsheetArtifact,
  web: webArtifact,
  whiteboard: whiteboardArtifact,
};

/**
 * 按类型获取 definition。未注册类型返回 null，调用方应渲染 fallback UI。
 */
export function getArtifactDef<T extends ArtifactType>(
  type: T,
): ArtifactDefinition<T> | null {
  const def = artifactRegistry[type];
  return (def as ArtifactDefinition<T> | undefined) ?? null;
}

export function isArtifactTypeRegistered(type: ArtifactType): boolean {
  return Boolean(artifactRegistry[type]);
}
