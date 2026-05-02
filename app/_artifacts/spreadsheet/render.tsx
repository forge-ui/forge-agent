"use client";

/**
 * Spreadsheet artifact Render — Univer starts when the chat card opens panel.
 */

import dynamic from "next/dynamic";
import { LazyArtifactLoading } from "@/app/_artifacts/shared/lazy-artifact-gate";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

const UniverRender = dynamic(() => import("./univer-render"), {
  ssr: false,
  loading: () => <LazyArtifactLoading label="表格编辑器加载中…" />,
});

export default function SpreadsheetRender(props: ArtifactRenderProps<"spreadsheet">) {
  return <UniverRender {...props} />;
}
