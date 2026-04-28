import { type ComponentType } from "react";
import {
  ChatRoundDotsBoldDuotone,
  CodeSquareBoldDuotone,
} from "solar-icon-set";

export type AppAccent = "purple" | "blue" | "emerald" | "amber";

export type ChatSuggestion = { title: string; body: string };

export type ConversationGroup = "today" | "earlier";

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

export const apps: ForgeApp[] = [
  {
    id: "general",
    slug: "general",
    name: "通用Agent",
    tagline: "邮件 / 计划 / 查资料，什么都聊",
    description: "你的全能助理，不挑场景。",
    icon: ChatRoundDotsBoldDuotone,
    accent: "purple",
    heroIllustration: "/chat-mascot.png",
    suggestions: [
      { title: "帮我写一份周报", body: "贴本周做的事，输出结构化周报。" },
      { title: "总结这份会议纪要", body: "提取决策、行动项、负责人。" },
      { title: "今天的 AI 新闻有哪些", body: "挑值得跟的，给一句话点评。" },
      { title: "明天演讲的提纲", body: "受众 + 时长 + 立意，给一份大纲。" },
    ],
    conversations: [
      { id: "g-1", title: "整理 Q2 OKR", group: "today" },
      { id: "g-2", title: "改写产品周会纪要", group: "today" },
      { id: "g-3", title: "回一封拒绝邀约的邮件", group: "today" },
      { id: "g-4", title: "下周深圳出差怎么安排", group: "earlier" },
      { id: "g-5", title: "讲讲 SQL window functions", group: "earlier" },
      { id: "g-6", title: "给老板写一封感谢信", group: "earlier" },
      { id: "g-7", title: "为啥 Q1 转化率掉了 8%", group: "earlier" },
    ],
  },
  {
    id: "coding",
    slug: "coding",
    name: "编程Agent",
    tagline: "PR 评审 / 重构 / Bug 排查",
    description: "你的代码搭子，盯 PR、揪 bug、给重构建议。",
    icon: CodeSquareBoldDuotone,
    accent: "blue",
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
      { id: "c-4", title: "重构 user-service hooks", group: "earlier" },
      { id: "c-5", title: "修 vitest mock fetch 的报错", group: "earlier" },
      { id: "c-6", title: "Migration 失败排查", group: "earlier" },
      { id: "c-7", title: "Server Component 不能用 useState?", group: "earlier" },
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
