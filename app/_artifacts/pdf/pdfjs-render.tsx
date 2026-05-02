"use client";

/**
 * PDF artifact full viewer.
 *
 * Keep this intentionally light for the chat demo: the browser's native PDF
 * viewer is enough for previewing user artifacts, and it avoids pulling a
 * dedicated PDF runtime into the Next client graph.
 */

import type { ArtifactRenderProps } from "@/app/_artifacts/types";

export default function PdfjsRender({ payload }: ArtifactRenderProps<"pdf">) {
  const filename = filenameFromUrl(payload.url);

  return (
    <div className="flex h-full flex-col bg-fg-white">
      <div className="flex items-center gap-2 border-b border-fg-grey-200 bg-fg-grey-50 px-4 py-2 text-xs text-fg-grey-700">
        <span className="min-w-0 truncate font-mono font-semibold text-fg-grey-900">{filename}</span>
        <span className="shrink-0 rounded bg-fg-grey-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-fg-grey-900">
          浏览器预览
        </span>
      </div>
      <iframe
        src={payload.url}
        title={filename}
        referrerPolicy="no-referrer"
        className="h-full flex-1 border-0 bg-fg-white"
      />
    </div>
  );
}

function filenameFromUrl(url: string): string {
  try {
    const u = new URL(url, "http://x");
    const last = u.pathname.split("/").pop();
    return last || "document.pdf";
  } catch {
    return "document.pdf";
  }
}
