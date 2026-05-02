"use client";

/**
 * Mindmap editable Render — mind-elixir-core。
 *
 * payload.markdown 在 editable mode 下自动解析成 mind-elixir 的 NodeObj 树。
 * 用户可点击节点编辑、拖拽重组、增删子节点。变更通过 onChange 回写 markdown。
 */

import { useEffect, useRef } from "react";
import MindElixir from "mind-elixir";
import "mind-elixir/style";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

type NodeObj = {
  id: string;
  topic: string;
  children?: NodeObj[];
};

// Markdown → NodeObj 解析：# 是 root、## 一级子、### 二级子，- 当成同级 bullet
function parseMarkdownToNode(md: string): NodeObj {
  const lines = md.split("\n").map((l) => l.trim()).filter(Boolean);
  let id = 0;
  const nextId = () => `n${++id}`;

  let root: NodeObj = { id: nextId(), topic: "Mindmap" };
  const stack: { level: number; node: NodeObj }[] = [{ level: 0, node: root }];

  for (const line of lines) {
    let level: number;
    let topic: string;
    if (line.startsWith("# ")) {
      level = 0;
      topic = line.slice(2);
    } else if (line.startsWith("## ")) {
      level = 1;
      topic = line.slice(3);
    } else if (line.startsWith("### ")) {
      level = 2;
      topic = line.slice(4);
    } else if (line.startsWith("#### ")) {
      level = 3;
      topic = line.slice(5);
    } else if (line.startsWith("- ")) {
      level = (stack[stack.length - 1]?.level ?? 0) + 1;
      topic = line.slice(2);
    } else {
      continue;
    }

    const node: NodeObj = { id: nextId(), topic };

    if (level === 0) {
      root = node;
      stack.length = 0;
      stack.push({ level: 0, node });
      continue;
    }

    while (stack.length > 0 && (stack[stack.length - 1]?.level ?? -1) >= level) {
      stack.pop();
    }
    const parent = stack[stack.length - 1]?.node ?? root;
    parent.children = parent.children ?? [];
    parent.children.push(node);
    stack.push({ level, node });
  }

  return root;
}

// NodeObj → Markdown（导回）
function nodeToMarkdown(node: NodeObj, level = 0): string {
  const prefix = level === 0 ? "# " : level === 1 ? "## " : level === 2 ? "### " : "#### ";
  const lines = [`${prefix}${node.topic}`];
  for (const child of node.children ?? []) {
    lines.push("");
    lines.push(nodeToMarkdown(child, level + 1));
  }
  return lines.join("\n");
}

export default function MindmapEditableRender({
  payload,
  readOnly,
  onChange,
}: ArtifactRenderProps<"mindmap">) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const meRef = useRef<{ destroy?: () => void } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const data = parseMarkdownToNode(payload.markdown);

    const me = new MindElixir({
      el: containerRef.current,
      direction: MindElixir.SIDE,
      editable: !readOnly,
      // 蓝色主题：mind-elixir 通过 theme 自定义颜色
      theme: {
        name: "forge-blue",
        type: "light",
        palette: [
          "var(--fg-blue-500)",
          "var(--fg-blue-400)",
          "var(--fg-blue-300)",
          "var(--fg-blue-200)",
          "var(--fg-blue-700)",
        ],
        cssVar: {
          "--main-color": "var(--fg-black)",
          "--main-bgcolor": "var(--fg-grey-50)",
          "--color": "var(--fg-black)",
          "--bgcolor": "var(--fg-grey-50)",
          "--root-color": "var(--fg-grey-50)",
          "--root-bgcolor": "var(--fg-blue-500)",
          "--root-border-color": "var(--fg-blue-500)",
        } as never,
      },
    });

    me.init({ nodeData: data as never });
    meRef.current = me as unknown as { destroy?: () => void };

    if (!readOnly) {
      me.bus.addListener("operation", () => {
        const next = me.nodeData as unknown as NodeObj;
        onChange?.({ ...payload, markdown: nodeToMarkdown(next) });
      });
    }

    return () => {
      try {
        meRef.current?.destroy?.();
      } finally {
        meRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="h-full w-full bg-fg-grey-50" />;
}
