"use client";

/**
 * Mindmap artifact Render —
 *   mode="readonly" → Markmap（左 markdown / 右 SVG，只读）
 *   mode="editable" → mind-elixir-core（节点拖拽 / 直接编辑）
 *
 * Editable mode 走 dynamic import 切独立 chunk。
 */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CopyLinear } from "solar-icon-set";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

const EditableRender = dynamic(() => import("./editable-render"), { ssr: false });

export default function MindmapRender(props: ArtifactRenderProps<"mindmap">) {
  if (props.payload.mode === "editable") {
    return <EditableRender {...props} />;
  }
  return <ReadonlyMindmapRender {...props} />;
}

function ReadonlyMindmapRender({ payload, readOnly, onChange }: ArtifactRenderProps<"mindmap">) {
  const [content, setContent] = useState(payload.markdown);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markmapRef = useRef<{ destroy?: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [{ Transformer }, { Markmap }] = await Promise.all([
        import("markmap-lib"),
        import("markmap-view"),
      ]);
      if (cancelled || !containerRef.current) return;

      const transformer = new Transformer();
      const { root } = transformer.transform(content);

      // 清掉旧 SVG
      containerRef.current.innerHTML = "";
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.style.width = "100%";
      svg.style.height = "100%";
      containerRef.current.appendChild(svg);

      // 蓝色主题：按 depth 走 fg-blue 色阶（深 → 浅）
      const BLUE_RAMP = [
        "var(--fg-blue-700)",
        "var(--fg-blue-500)",
        "var(--fg-blue-400)",
        "var(--fg-blue-300)",
        "var(--fg-blue-200)",
      ];
      const mm = Markmap.create(
        svg,
        {
          color: (node: { state?: { depth?: number } }) => {
            const depth = node.state?.depth ?? 0;
            return BLUE_RAMP[Math.min(depth, BLUE_RAMP.length - 1)];
          },
          paddingX: 12,
          duration: 300,
        },
        root,
      );
      markmapRef.current = mm as unknown as { destroy?: () => void };
    })();

    return () => {
      cancelled = true;
      markmapRef.current?.destroy?.();
      markmapRef.current = null;
    };
  }, [content]);

  function commit(next: string) {
    setContent(next);
    onChange?.({ ...payload, markdown: next });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-fg-grey-200 bg-fg-grey-50 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-fg-grey-700">
          <span className="font-mono font-semibold text-fg-grey-900">mindmap.md</span>
          <span className="rounded bg-fg-grey-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-fg-grey-900">
            markmap
          </span>
          {payload.mode === "readonly" && (
            <span className="rounded bg-fg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-fg-blue-500">
              只读预览
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(content)}
          className="flex items-center gap-1 rounded border border-fg-grey-200 bg-white px-2.5 py-1 text-xs font-medium text-fg-grey-900 transition hover:border-fg-grey-400"
        >
          <CopyLinear size={12} color="currentColor" />
          复制
        </button>
      </div>

      <div className="grid flex-1 grid-cols-2 overflow-hidden divide-x divide-fg-grey-200">
        <textarea
          value={content}
          onChange={(e) => commit(e.target.value)}
          readOnly={readOnly || payload.mode === "readonly"}
          spellCheck={false}
          className="h-full w-full resize-none overflow-y-auto bg-white px-4 py-3 font-mono text-sm leading-6 text-fg-grey-900 outline-none focus:bg-fg-grey-50/40"
        />
        <div ref={containerRef} className="h-full w-full overflow-hidden bg-white" />
      </div>
    </div>
  );
}
