/**
 * Slide artifact 注册定义。
 * 顶层不 import 渲染组件 / pptxgenjs — Render 用 dynamic({ ssr:false })。
 * exporter 在第一次调用时 dynamic import pptxgenjs。
 */

import dynamic from "next/dynamic";
import { GalleryLinear } from "solar-icon-set";
import type { ArtifactDefinition } from "@/app/_artifacts/types";

const Render = dynamic(() => import("./render"), { ssr: false });

export const slideArtifact: ArtifactDefinition<"slide"> = {
  type: "slide",
  label: "演示幻灯",
  icon: GalleryLinear,
  Render,
  exporters: {
    pptx: async (payload) => {
      const { exportSlidesAsPptx } = await import("./exporter");
      return exportSlidesAsPptx(payload);
    },
  },
};
