"use client";

/**
 * Markdown artifact Render — 最小验证版（react-markdown + remark-gfm）。
 *
 * 设计：左 textarea 编辑源码 + 右 react-markdown 预览（支持 H1-H3 / 列表 /
 * 引用 / 表格 / 链接 / 内联代码 / 代码块）。
 * Plate (platejs) 真正接入推迟到 P3 document artifact（要做 .docx 互通时再上）。
 */

import { useState } from "react";
import { CopyLinear } from "solar-icon-set";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

export default function MarkdownRender({
  payload,
  readOnly,
  onChange,
}: ArtifactRenderProps<"markdown">) {
  const [content, setContent] = useState(payload.content);

  function commit(next: string) {
    setContent(next);
    onChange?.({ ...payload, content: next });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-fg-grey-200 bg-fg-grey-50 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-fg-grey-700">
          <span className="font-mono font-semibold text-fg-grey-900">document.md</span>
          {readOnly && (
            <span className="rounded bg-fg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-fg-blue-500">
              只读
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
        {/* 左：源码编辑 */}
        <textarea
          value={content}
          onChange={(e) => commit(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          className="h-full w-full resize-none overflow-y-auto bg-white px-4 py-3 font-mono text-sm leading-6 text-fg-grey-900 outline-none focus:bg-fg-grey-50/40 disabled:bg-fg-grey-50"
        />
        {/* 右：渲染预览 */}
        <div className="h-full overflow-y-auto bg-white px-6 py-4">
          <MarkdownPreview content={content} />
        </div>
      </div>
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mt-0 mb-4 border-b border-fg-grey-200 pb-2 text-2xl font-bold text-fg-black">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-6 mb-3 text-xl font-bold text-fg-black">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-5 mb-2 text-base font-bold text-fg-black">{children}</h3>
        ),
        p: ({ children }) => <p className="my-3 leading-7 text-fg-black">{children}</p>,
        ul: ({ children }) => <ul className="my-3 list-disc pl-6 leading-7">{children}</ul>,
        ol: ({ children }) => <ol className="my-3 list-decimal pl-6 leading-7">{children}</ol>,
        li: ({ children }) => <li className="my-1 text-fg-black">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-l-4 border-fg-blue-500 bg-fg-blue-50 px-4 py-2 italic text-fg-grey-700">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isBlock = /language-/.test(className ?? "");
          if (isBlock) {
            return (
              <code className={`${className} block whitespace-pre-wrap break-words`}>
                {children}
              </code>
            );
          }
          return (
            <code className="rounded bg-fg-grey-100 px-1.5 py-0.5 font-mono text-[13px] text-fg-grey-900">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="my-3 overflow-x-auto rounded-xl border border-fg-grey-200 bg-fg-grey-50 px-4 py-3 font-mono text-sm leading-6 text-fg-grey-900">
            {children}
          </pre>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg-blue-500 underline underline-offset-2 hover:text-fg-blue-700"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-6 border-fg-grey-200" />,
        strong: ({ children }) => <strong className="font-bold text-fg-black">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-fg-grey-200 bg-fg-grey-50 px-3 py-2 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-fg-grey-200 px-3 py-2">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
