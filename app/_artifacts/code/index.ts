/**
 * Code artifact 注册定义。
 *
 * 顶层不 import CodeMirror 或语言扩展 — Render 用 dynamic({ ssr:false }) 切独立 chunk。
 */

import dynamic from "next/dynamic";
import { CodeSquareLinear } from "solar-icon-set";
import type { ArtifactDefinition } from "@/app/_artifacts/types";
import { exportCodeAsFile } from "./exporter";

const Render = dynamic(() => import("./render"), { ssr: false });

export const codeArtifact: ArtifactDefinition<"code"> = {
  type: "code",
  label: "代码",
  icon: CodeSquareLinear,
  Render,
  exporters: {
    txt: exportCodeAsFile,
  },
};
