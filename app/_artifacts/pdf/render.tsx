"use client";

/**
 * PDF artifact Render — browser viewer starts when the chat card opens panel.
 */

import dynamic from "next/dynamic";
import { LazyArtifactLoading } from "@/app/_artifacts/shared/lazy-artifact-gate";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

const PdfRenderFrame = dynamic(() => import("./pdfjs-render"), {
  ssr: false,
  loading: () => <LazyArtifactLoading label="PDF 阅读器加载中…" />,
});

export default function PdfRender(props: ArtifactRenderProps<"pdf">) {
  return <PdfRenderFrame {...props} />;
}
