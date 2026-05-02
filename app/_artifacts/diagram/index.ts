/**
 * Diagram artifact 注册定义。
 * 顶层不 import mermaid — Render 内部 dynamic import。
 */

import dynamic from "next/dynamic";
import { ChartLinear } from "solar-icon-set";
import type { ArtifactDefinition, ArtifactPayloadMap } from "@/app/_artifacts/types";

const Render = dynamic(() => import("./render"), { ssr: false });

export const diagramArtifact: ArtifactDefinition<"diagram"> = {
  type: "diagram",
  label: "图表",
  icon: ChartLinear,
  Render,
  exporters: {
    mmd: async (p: ArtifactPayloadMap["diagram"]) =>
      new Blob([p.source], { type: "text/plain;charset=utf-8" }),
  },
};
