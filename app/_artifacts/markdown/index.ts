/**
 * Markdown artifact 注册定义。
 *
 * 顶层不 import 重型库 — Render 用 dynamic({ ssr:false }) 切独立 chunk。
 */

import dynamic from "next/dynamic";
import { DocumentTextLinear } from "solar-icon-set";
import type { ArtifactDefinition } from "@/app/_artifacts/types";
import { exportMarkdownAsMd } from "./exporter";

const Render = dynamic(() => import("./render"), { ssr: false });

export const markdownArtifact: ArtifactDefinition<"markdown"> = {
  type: "markdown",
  label: "Markdown",
  icon: DocumentTextLinear,
  Render,
  exporters: {
    md: exportMarkdownAsMd,
  },
};
