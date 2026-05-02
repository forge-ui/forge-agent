import dynamic from "next/dynamic";
import { PaletteLinear } from "solar-icon-set";
import type { ArtifactDefinition } from "@/app/_artifacts/types";

const Render = dynamic(() => import("./render"), { ssr: false });

export const whiteboardArtifact: ArtifactDefinition<"whiteboard"> = {
  type: "whiteboard",
  label: "白板",
  icon: PaletteLinear,
  Render,
};
