"use client";

/**
 * Code runnable Render — explicit run gate + lazy Sandpack。
 *
 * mode="runnable" 走浏览器内代码沙箱：左侧编辑器（CM6），右侧实时预览。
 * 根据 payload.language 选 template（react / static / vanilla）。
 *
 * 只支持单文件，多文件 + 文件树留进一步扩展。
 */

import dynamic from "next/dynamic";
import { useState } from "react";
import { PlayCircleBold, ShieldWarningLinear } from "solar-icon-set";
import { LazyArtifactGate, LazyArtifactLoading } from "@/app/_artifacts/shared/lazy-artifact-gate";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

const SandpackRender = dynamic(() => import("./sandpack-render"), {
  ssr: false,
  loading: () => <LazyArtifactLoading label="代码沙箱加载中…" />,
});

function templateForLanguage(language: string): "react" | "vanilla" | "static" {
  const l = language.toLowerCase();
  if (l === "react" || l === "jsx" || l === "tsx") return "react";
  if (l === "html" || l === "static") return "static";
  return "vanilla";
}

function entryFileForTemplate(template: "react" | "vanilla" | "static"): string {
  if (template === "react") return "/App.js";
  if (template === "static") return "/index.html";
  return "/index.js";
}

export default function CodeRunnableRender({ payload }: ArtifactRenderProps<"code">) {
  const template = templateForLanguage(payload.language);
  const entry = entryFileForTemplate(template);
  const approvalKey = `${payload.language}:${payload.content}`;
  const [runApproval, setRunApproval] = useState({ key: "", allowed: false });
  const allowedToRun = runApproval.allowed && runApproval.key === approvalKey;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-fg-grey-200 bg-fg-grey-50 px-4 py-2 text-xs text-fg-grey-700">
        <span className="font-mono font-semibold text-fg-grey-900">sandbox/{entry.replace(/^\//, "")}</span>
        <span className="rounded bg-fg-grey-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-fg-grey-900">
          {template}
        </span>
        <span className="rounded bg-fg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-fg-blue-500">
          沙箱运行
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        {allowedToRun ? (
          <SandpackRender
            template={template}
            entry={entry}
            content={payload.content}
          />
        ) : (
          <RunGate
            language={payload.language}
            onRun={() => setRunApproval({ key: approvalKey, allowed: true })}
          />
        )}
      </div>
    </div>
  );
}

function RunGate({ language, onRun }: { language: string; onRun: () => void }) {
  return (
    <LazyArtifactGate
      title="运行前确认"
      description="这段代码来自聊天 artifact，打开预览前不会自动执行。确认来源可信后再启动浏览器沙箱。"
      actionLabel="运行代码"
      badge={language}
      icon={<ShieldWarningLinear size={20} color="currentColor" />}
      onAction={onRun}
    >
      <div className="rounded-lg border border-fg-yellow-100 bg-fg-yellow-50 px-4 py-3 text-sm leading-6 text-fg-grey-900">
        Sandpack 会在点击后加载，并允许代码在隔离预览中执行浏览器 JavaScript。
        <span className="ml-1 inline-flex items-center gap-1 font-semibold text-fg-blue-500">
          <PlayCircleBold size={14} color="currentColor" />
          非自动执行
        </span>
      </div>
    </LazyArtifactGate>
  );
}
