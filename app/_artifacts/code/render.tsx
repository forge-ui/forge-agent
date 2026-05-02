"use client";

/**
 * Code artifact Render —
 *   mode="readonly" → CM6 只读
 *   mode="editable" → CM6 编辑器（默认）
 *   mode="runnable" → Sandpack 沙箱（左编辑器 + 右实时预览）
 *
 * Runnable mode 走 dynamic import 切独立 chunk，Sandpack 体积大不进默认 bundle。
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import type { Extension } from "@codemirror/state";
import { CopyLinear, PlayCircleBold } from "solar-icon-set";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";
import { loadLanguage } from "./languages";

const RunnableRender = dynamic(() => import("./runnable-render"), { ssr: false });

export default function CodeRender(props: ArtifactRenderProps<"code">) {
  if (props.payload.mode === "runnable") {
    return <RunnableRender {...props} />;
  }
  return <EditorOnly {...props} />;
}

function EditorOnly({
  payload,
  readOnly,
  onChange,
}: ArtifactRenderProps<"code">) {
  const [content, setContent] = useState(payload.content);
  const [extensions, setExtensions] = useState<Extension[]>([]);

  // 按需加载语言扩展
  useEffect(() => {
    let cancelled = false;
    loadLanguage(payload.language).then((ext) => {
      if (cancelled) return;
      setExtensions(ext ? [ext] : []);
    });
    return () => {
      cancelled = true;
    };
  }, [payload.language]);

  const isReadOnly = readOnly || payload.mode === "readonly";
  const isRunnable = payload.mode === "runnable";

  function commit(next: string) {
    setContent(next);
    onChange?.({ ...payload, content: next });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-fg-grey-200 bg-fg-grey-50 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-fg-grey-700">
          <span className="font-mono font-semibold text-fg-grey-900">
            snippet.{extensionForLanguage(payload.language)}
          </span>
          <span className="rounded bg-fg-grey-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-fg-grey-900">
            {payload.language}
          </span>
          {isReadOnly && (
            <span className="rounded bg-fg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-fg-blue-500">
              只读
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isRunnable && (
            <button
              type="button"
              className="flex items-center gap-1 rounded bg-fg-blue-500 px-3 py-1 text-xs font-semibold text-white transition hover:brightness-90"
            >
              <PlayCircleBold size={12} color="currentColor" />
              运行
            </button>
          )}
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(content)}
            className="flex items-center gap-1 rounded border border-fg-grey-200 bg-white px-2.5 py-1 text-xs font-medium text-fg-grey-900 transition hover:border-fg-grey-400"
          >
            <CopyLinear size={12} color="currentColor" />
            复制
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={content}
          height="100%"
          theme="light"
          editable={!isReadOnly}
          readOnly={isReadOnly}
          extensions={[...extensions, EditorView.lineWrapping]}
          onChange={commit}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: !isReadOnly,
            highlightActiveLineGutter: !isReadOnly,
            foldGutter: true,
            autocompletion: !isReadOnly,
          }}
          style={{ height: "100%", fontSize: 13 }}
        />
      </div>
    </div>
  );
}

function extensionForLanguage(lang: string): string {
  const map: Record<string, string> = {
    sql: "sql",
    javascript: "js",
    js: "js",
    typescript: "ts",
    ts: "ts",
    python: "py",
    py: "py",
    json: "json",
  };
  return map[lang.toLowerCase()] ?? "txt";
}
