"use client";

/**
 * Diagram artifact Render —
 *   mode="text"        → Mermaid（左 textarea / 右 SVG）
 *   mode="interactive" → ReactFlow（拖拽节点编辑）
 *
 * Interactive mode 走 dynamic import 切独立 chunk，不影响 text mode 用户。
 */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CopyLinear, RefreshLinear } from "solar-icon-set";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

const InteractiveRender = dynamic(() => import("./interactive-render"), { ssr: false });

export default function DiagramRender(props: ArtifactRenderProps<"diagram">) {
  if (props.payload.mode === "interactive") {
    return <InteractiveRender {...props} />;
  }
  return <TextDiagramRender {...props} />;
}

function TextDiagramRender({
  payload,
  readOnly,
  onChange,
}: ArtifactRenderProps<"diagram">) {
  const [source, setSource] = useState(payload.source);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const renderIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const id = ++renderIdRef.current;

    (async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "default",
        fontFamily: "inherit",
      });

      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, source);
        if (cancelled || id !== renderIdRef.current) return;
        if (previewRef.current) previewRef.current.innerHTML = svg;
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source]);

  function commit(next: string) {
    setSource(next);
    onChange?.({ ...payload, source: next });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-fg-grey-200 bg-fg-grey-50 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-fg-grey-700">
          <span className="font-mono font-semibold text-fg-grey-900">diagram.mmd</span>
          <span className="rounded bg-fg-grey-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-fg-grey-900">
            mermaid
          </span>
          {error && (
            <span className="rounded bg-fg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-fg-red">
              语法错误
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(source)}
          className="flex items-center gap-1 rounded border border-fg-grey-200 bg-white px-2.5 py-1 text-xs font-medium text-fg-grey-900 transition hover:border-fg-grey-400"
        >
          <CopyLinear size={12} color="currentColor" />
          复制
        </button>
      </div>

      <div className="grid flex-1 grid-cols-2 overflow-hidden divide-x divide-fg-grey-200">
        <textarea
          value={source}
          onChange={(e) => commit(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          className="h-full w-full resize-none overflow-y-auto bg-white px-4 py-3 font-mono text-sm leading-6 text-fg-grey-900 outline-none focus:bg-fg-grey-50/40"
        />
        <div className="h-full overflow-auto bg-white p-4">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <RefreshLinear size={20} color="var(--fg-grey-500)" />
              <code className="max-w-full overflow-x-auto whitespace-pre-wrap rounded bg-fg-grey-100 px-2 py-1 font-mono text-xs text-fg-grey-700">
                {error}
              </code>
            </div>
          ) : (
            <div ref={previewRef} className="flex h-full items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full" />
          )}
        </div>
      </div>
    </div>
  );
}
