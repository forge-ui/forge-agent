"use client";

/**
 * Whiteboard artifact Render — Excalidraw starts when the chat card opens panel.
 */

import dynamic from "next/dynamic";
import { LazyArtifactLoading } from "@/app/_artifacts/shared/lazy-artifact-gate";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

const WhiteboardEditorRender = dynamic(() => import("./editor-render"), {
  ssr: false,
  loading: () => <LazyArtifactLoading label="白板编辑器加载中…" />,
});

export default function WhiteboardRender(props: ArtifactRenderProps<"whiteboard">) {
  return <WhiteboardEditorRender {...props} />;
}
