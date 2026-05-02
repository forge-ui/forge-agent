/**
 * Report artifact 注册定义。
 *
 * 顶层不 import 重型库 / tab 子组件 — Render 用 dynamic({ ssr:false }) 切独立 chunk。
 */

import dynamic from "next/dynamic";
import { DatabaseLinear } from "solar-icon-set";
import type { ArtifactDefinition } from "@/app/_artifacts/types";

const Render = dynamic(() => import("./render"), { ssr: false });

export const reportArtifact: ArtifactDefinition<"report"> = {
  type: "report",
  label: "数据报表",
  icon: DatabaseLinear,
  Render,
};
