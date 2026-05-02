/**
 * Spreadsheet artifact 注册定义。
 * 顶层不 import Univer — Render 用 dynamic({ ssr:false }) 切独立 chunk。
 * Univer 是本期最大的依赖（~800KB gzip），dynamic 是 must-have。
 */

import dynamic from "next/dynamic";
import { LayersMinimalisticLinear } from "solar-icon-set";
import type { ArtifactDefinition } from "@/app/_artifacts/types";

const Render = dynamic(() => import("./render"), { ssr: false });

export const spreadsheetArtifact: ArtifactDefinition<"spreadsheet"> = {
  type: "spreadsheet",
  label: "电子表格",
  icon: LayersMinimalisticLinear,
  Render,
};
