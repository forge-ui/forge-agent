/**
 * 按需懒加载 CodeMirror 6 语言扩展。
 * 不在 index.ts 顶层 import 任何 lang 包——避免主 bundle 拉所有语言。
 */

import type { Extension } from "@codemirror/state";

type LangLoader = () => Promise<{ default: () => Extension } | { sql: () => Extension } | { javascript: () => Extension } | { python: () => Extension } | { json: () => Extension }>;

const loaders: Record<string, LangLoader> = {
  sql: () => import("@codemirror/lang-sql"),
  javascript: () => import("@codemirror/lang-javascript"),
  js: () => import("@codemirror/lang-javascript"),
  typescript: () => import("@codemirror/lang-javascript"),
  ts: () => import("@codemirror/lang-javascript"),
  python: () => import("@codemirror/lang-python"),
  py: () => import("@codemirror/lang-python"),
  json: () => import("@codemirror/lang-json"),
};

/**
 * 加载并构造对应语言的 CM 扩展。失败时返回 null，render 端降级到无高亮。
 */
export async function loadLanguage(lang: string): Promise<Extension | null> {
  const loader = loaders[lang.toLowerCase()];
  if (!loader) return null;
  try {
    const mod = await loader();
    if ("sql" in mod) return mod.sql();
    if ("javascript" in mod) {
      const isTs = lang.toLowerCase().startsWith("ts");
      return (mod.javascript as (opts?: { typescript?: boolean }) => Extension)({ typescript: isTs });
    }
    if ("python" in mod) return mod.python();
    if ("json" in mod) return mod.json();
    return null;
  } catch {
    return null;
  }
}

export const SUPPORTED_LANGUAGES = Object.keys(loaders);
