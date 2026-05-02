/**
 * Document artifact 注册定义。
 * 顶层不 import Umo / Vue / 重型库 — Render 用 dynamic({ ssr:false }) iframe 加载。
 */

import dynamic from "next/dynamic";
import { DocumentTextLinear } from "solar-icon-set";
import type { ArtifactDefinition, ArtifactPayloadMap } from "@/app/_artifacts/types";

const Render = dynamic(() => import("./render"), { ssr: false });

/** 当前导出 Markdown / HTML 原文为 .md。真 .docx 导出由 Umo Editor iframe 内部菜单提供。 */
async function exportAsMd(payload: ArtifactPayloadMap["document"]): Promise<Blob> {
  return new Blob([payload.content ?? ""], {
    type: "text/markdown;charset=utf-8",
  });
}

export const documentArtifact: ArtifactDefinition<"document"> = {
  type: "document",
  label: "Word 文档",
  icon: DocumentTextLinear,
  Render,
  exporters: {
    md: exportAsMd,
  },
};
