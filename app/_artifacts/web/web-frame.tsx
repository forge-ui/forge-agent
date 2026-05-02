"use client";

import { Button } from "@forge-ui/react";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

export default function WebFrame({ payload }: ArtifactRenderProps<"web">) {
  const title = payload.title ?? payload.url;

  return (
    <div className="flex h-full flex-col bg-fg-white">
      <div className="flex items-center gap-2 border-b border-fg-grey-200 bg-fg-grey-50 px-4 py-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-xs font-semibold text-fg-grey-900">{title}</span>
          <span className="truncate font-mono text-[11px] text-fg-grey-700">{payload.url}</span>
        </div>
        <Button
          type="button"
          color="blue"
          variant="secondary"
          size="sm"
          onClick={() => openInNewTab(payload.url)}
        >
          新标签打开
        </Button>
      </div>
      <iframe
        src={payload.url}
        title={title}
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-downloads allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts"
        className="h-full flex-1 border-0 bg-fg-white"
      />
    </div>
  );
}

function openInNewTab(url: string) {
  const target = new URL(url, window.location.origin).toString();
  window.open(target, "_blank", "noopener,noreferrer");
}
