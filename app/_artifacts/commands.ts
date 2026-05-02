/**
 * Artifact 内部命令模型
 *
 * 设计目的：mock 阶段不接真 AI/SSE，但保留最小命令模型，避免接真 AI 时数据层重写。
 * mock 阶段所有 artifact 创建/更新走这个命令通道；接真后端时只需让 SSE/tool-call 解析后
 * 派发同一组命令，前端零改动。
 *
 * 设计参考: docs/specs/2026-04-29-artifact-system-design.md §3.3
 */

import type { ArtifactType } from "./types";

export type ArtifactCommand =
  | {
      kind: "create";
      artifactId: string;
      type: ArtifactType;
      title: string;
      initialPayload: unknown;
    }
  | {
      kind: "update";
      artifactId: string;
      baseVersionId: string;
      patch: unknown;
    }
  | {
      kind: "finalize";
      artifactId: string;
    }
  | {
      kind: "error";
      artifactId: string;
      message: string;
    };

/**
 * 命令分发器（mock 阶段为占位，未来接 store 后改为真实派发）。
 *
 * P1 阶段空实现，P2 各 artifact 落地时再接 store。
 */
export function dispatchArtifactCommand(_cmd: ArtifactCommand): void {
  // P1 placeholder — 待接入 artifact store 后实现
}
