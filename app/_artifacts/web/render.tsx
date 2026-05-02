"use client";

/**
 * Web artifact Render — iframe preview starts when the chat card opens panel.
 */

import dynamic from "next/dynamic";
import { LazyArtifactLoading } from "@/app/_artifacts/shared/lazy-artifact-gate";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

const WebFrame = dynamic(() => import("./web-frame"), {
  ssr: false,
  loading: () => <LazyArtifactLoading label="网页预览加载中…" />,
});

export default function WebRender(props: ArtifactRenderProps<"web">) {
  return <WebFrame {...props} />;
}
