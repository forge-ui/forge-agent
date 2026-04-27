import { type ComponentType } from "react";
import {
  CodeSquareBoldDuotone,
  NotebookBoldDuotone,
  PenNewSquareBoldDuotone,
  GraphBoldDuotone,
} from "solar-icon-set";

export type AppAccent = "purple" | "blue" | "emerald" | "amber";

export type ChatSuggestion = { title: string; body: string };

export type ConversationGroup = "today" | "yesterday" | "earlier";

export type Conversation = {
  id: string;
  title: string;
  group: ConversationGroup;
};

export type ForgeApp = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  accent: AppAccent;
  /** Empty-state hero illustration path (in /public). 没图就 fallback 到 icon */
  heroIllustration?: string;
  suggestions: ChatSuggestion[];
  /** Sidebar 对话列表 mock */
  conversations: Conversation[];
};

// 占位 App 列表 —— 后续从配置 / 后端接入
export const apps: ForgeApp[] = [
  {
    id: "code-studio",
    slug: "code-studio",
    name: "Code Studio",
    tagline: "Code review, refactor, debug",
    description: "你的代码搭子，盯着 PR、揪 bug、给重构建议。",
    icon: CodeSquareBoldDuotone,
    accent: "purple",
    heroIllustration: "/chat-mascot.png",
    suggestions: [
      { title: "帮我审一下这个 PR", body: "找回归、安全隐患、粗糙的边界条件。" },
      { title: "重构这个函数", body: "抽公共逻辑、消重复、保持行为不变。" },
      { title: "讲讲这个代码库", body: "带我过一遍入口和核心模块。" },
      { title: "排查这个 Bug", body: "贴报错和最小复现，给修复方案。" },
    ],
    conversations: [
      { id: "c-1", title: "改下登录页样式", group: "today" },
      { id: "c-2", title: "PR #234 review", group: "today" },
      { id: "c-3", title: "Tailwind v4 @source 解释", group: "today" },
      { id: "c-4", title: "重构 user-service hooks", group: "yesterday" },
      { id: "c-5", title: "修 vitest mock fetch 的报错", group: "yesterday" },
      { id: "c-6", title: "Migration 失败排查", group: "earlier" },
      { id: "c-7", title: "Server Component 不能用 useState?", group: "earlier" },
    ],
  },
  {
    id: "research-lab",
    slug: "research-lab",
    name: "Research Lab",
    tagline: "Search, compare, cite",
    description: "调研助手，搜索整合多源资料，每条结论都带引用。",
    icon: NotebookBoldDuotone,
    accent: "blue",
    suggestions: [
      { title: "对比 X 和 Y", body: "结构化对照，每条结论带来源。" },
      { title: "总结这篇论文", body: "贴 PDF 或链接，输出结构化摘要。" },
      { title: "帮我找资料", body: "可靠、近期、带引用。" },
    ],
    conversations: [
      { id: "r-1", title: "对比 LangChain vs LlamaIndex", group: "today" },
      { id: "r-2", title: "找 RAG 最新论文", group: "yesterday" },
    ],
  },
  {
    id: "writing-desk",
    slug: "writing-desk",
    name: "Writing Desk",
    tagline: "Edit, polish, restructure",
    description: "写作教练，砍冗余、理逻辑、润语气。",
    icon: PenNewSquareBoldDuotone,
    accent: "emerald",
    suggestions: [
      { title: "压缩这篇草稿", body: "砍冗余，论点更利。" },
      { title: "换个语气", body: "更有力 / 更亲和 / 更正式。" },
      { title: "重排大纲", body: "用最强论点开头。" },
    ],
    conversations: [
      { id: "w-1", title: "公众号文章润色", group: "today" },
      { id: "w-2", title: "PR description 改写", group: "earlier" },
    ],
  },
  {
    id: "data-console",
    slug: "data-console",
    name: "Data Console",
    tagline: "Clean, model, visualize",
    description: "数据助手，自动清洗 / 建模 / 可视化。",
    icon: GraphBoldDuotone,
    accent: "amber",
    suggestions: [
      { title: "清洗 CSV", body: "丢空值、规范列、去重。" },
      { title: "找趋势", body: "快速统计 + 一张说人话的图。" },
      { title: "搭个 dashboard", body: "按列选合适的图。" },
    ],
    conversations: [
      { id: "d-1", title: "Q1 销售数据透视", group: "today" },
    ],
  },
];

export const DEFAULT_APP_SLUG = apps[0].slug;

export function getAppBySlug(slug: string | undefined): ForgeApp | undefined {
  if (!slug) return undefined;
  return apps.find((a) => a.slug === slug);
}

// accent → tailwind 配色（icon 容器用）
export const accentBg: Record<AppAccent, string> = {
  purple: "bg-purple-100",
  blue: "bg-indigo-100",
  emerald: "bg-emerald-100",
  amber: "bg-amber-100",
};

export const accentIconColor: Record<AppAccent, string> = {
  purple: "#7C3AED",
  blue: "#2563EB",
  emerald: "#059669",
  amber: "#D97706",
};
