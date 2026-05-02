import dynamic from "next/dynamic";
import { GlobalLinear } from "solar-icon-set";
import type { ArtifactDefinition } from "@/app/_artifacts/types";

const Render = dynamic(() => import("./render"), { ssr: false });

export const webArtifact: ArtifactDefinition<"web"> = {
  type: "web",
  label: "网页预览",
  icon: GlobalLinear,
  Render,
};
