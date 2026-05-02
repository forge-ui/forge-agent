import dynamic from "next/dynamic";
import { DocumentTextLinear } from "solar-icon-set";
import type { ArtifactDefinition } from "@/app/_artifacts/types";

const Render = dynamic(() => import("./render"), { ssr: false });

export const pdfArtifact: ArtifactDefinition<"pdf"> = {
  type: "pdf",
  label: "PDF",
  icon: DocumentTextLinear,
  Render,
};
