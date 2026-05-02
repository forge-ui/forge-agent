/**
 * Code artifact exporter — 导出对应语言后缀文件。
 */

import type { ArtifactPayloadMap } from "@/app/_artifacts/types";

export async function exportCodeAsFile(
  payload: ArtifactPayloadMap["code"],
): Promise<Blob> {
  return new Blob([payload.content], { type: "text/plain;charset=utf-8" });
}
