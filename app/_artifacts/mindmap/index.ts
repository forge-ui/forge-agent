import dynamic from "next/dynamic";
import { PieChartLinear } from "solar-icon-set";
import type { ArtifactDefinition, ArtifactPayloadMap } from "@/app/_artifacts/types";

const Render = dynamic(() => import("./render"), { ssr: false });

export const mindmapArtifact: ArtifactDefinition<"mindmap"> = {
  type: "mindmap",
  label: "思维导图",
  icon: PieChartLinear,
  Render,
  exporters: {
    md: async (p: ArtifactPayloadMap["mindmap"]) =>
      new Blob([p.markdown], { type: "text/markdown;charset=utf-8" }),
  },
};
