/**
 * Markdown artifact exporter — 导出 .md（纯文本 Blob）。
 */

import type { ArtifactPayloadMap } from "@/app/_artifacts/types";

export async function exportMarkdownAsMd(
  payload: ArtifactPayloadMap["markdown"],
): Promise<Blob> {
  return new Blob([payload.content], { type: "text/markdown;charset=utf-8" });
}
