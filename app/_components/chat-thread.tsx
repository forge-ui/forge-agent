"use client";

import Image from "next/image";
import { useState } from "react";
import {
  AltArrowRightLinear,
  CheckSquareBoldDuotone,
  CodeSquareLinear,
  CloseSquareBoldDuotone,
  CloseSquareLinear,
  DocumentTextLinear,
  LightbulbBoldDuotone,
  LinkLinear,
  MagniferLinear,
  ShieldCheckBoldDuotone,
  PlayBoldDuotone,
} from "solar-icon-set";
import { FileTypeIcon } from "@forge-ui/react";
import { ChatPillBar, type PillAction } from "./chat-pill-bar";
import {
  type ChatSource,
  FollowUps,
  MarkdownBody,
  MessageActions,
} from "./chat-shared";

type ToolStep = {
  id: string;
  name: string;
  args: string;
  result: string;
  status: "ok" | "warn" | "error";
};

type UserAttachment =
  | { kind: "voice"; duration: string }
  | { kind: "file"; name: string; size: string }
  | { kind: "image"; url: string; alt: string }
  | { kind: "image-grid"; urls: string[]; extraCount?: number };

type Message =
  | {
      role: "user";
      id: string;
      content?: string;
      attachment?: UserAttachment;
      time: string;
    }
  | {
      role: "assistant";
      id: string;
      thinking?: { duration: string; steps: { title: string; body: string }[] };
      toolSteps?: ToolStep[];
      markdown: string;
      sources?: ChatSource[];
      followUps?: string[];
      time: string;
      latency?: string;
    };

const MOCK_MESSAGES: Message[] = [
  {
    role: "user",
    id: "u1",
    content: "帮我审一下 PR #234，重点看安全和性能。",
    time: "14:02",
  },
  {
    role: "assistant",
    id: "a1",
    thinking: {
      duration: "1.2s",
      steps: [
        {
          title: "拆解任务",
          body: "用户想审 PR #234，关注「安全」和「性能」两个维度。审 PR 通常需要：拉取 diff、跑 lint、看 test coverage、综合判断风险等级。",
        },
        {
          title: "确认数据源",
          body: "session.ts 是这次 PR 的核心改动，先看它；其次是 src/api/user/list.ts 这种 hot path。",
        },
        {
          title: "决定输出结构",
          body: "按「问题严重度」排序而不是按文件，这样用户能直接知道哪些必须改、哪些可以延后。",
        },
      ],
    },
    toolSteps: [
      {
        id: "t1",
        name: "read_pr_diff",
        args: 'pr=234, repo="forge-ui/forge"',
        result: "12 files changed, +328 / -156, 主要在 src/auth、src/api/user",
        status: "ok",
      },
      {
        id: "t2",
        name: "run_eslint",
        args: "files=changed",
        result: "找到 3 个 error / 5 个 warn，error 都在 src/auth/session.ts",
        status: "warn",
      },
      {
        id: "t3",
        name: "check_test_coverage",
        args: "scope=changed",
        result: "整体覆盖率 87%，但 session.ts 只有 41%",
        status: "warn",
      },
    ],
    markdown: `看完了 PR #234，**3 个值得立刻处理的问题**：

1. **安全风险（必须改）** — \`src/auth/session.ts:42\` 直接把 cookie 的 \`HttpOnly\` 设成了 \`false\`，意味着 session token 暴露给 JS。如果有 XSS，token 直接被偷。
2. **性能瓶颈** — \`src/api/user/list.ts:88\` 在 loop 里调 \`getRoleByUserId\`，N+1 查询。500 个用户 = 500 次 DB 调用。建议改成一次 \`IN\` 查询 + map。
3. **测试盲区** — session.ts 是这个 PR 的核心改动，但覆盖率只有 41%。建议补上 \`refresh expired token\` 和 \`concurrent login\` 两个用例。

\`\`\`ts
// session.ts:42 改成
res.cookie("session", token, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
});
\`\`\`

其他 5 个 warn 都是 unused import，可以一起清掉。`,
    sources: [
      {
        id: "s1",
        title: "PR #234 · session 改造",
        hint: "github.com/forge-ui/forge",
        favicon: "/images/forge-logo.svg",
        excerpt: "把 session cookie 的 HttpOnly 默认值从 true 改成 false，理由是方便前端读取登录态。",
      },
      {
        id: "s2",
        title: "ESLint Report",
        hint: "ci-2026-04-27 · 3 errors",
        favicon: "/images/forge-logo.svg",
        excerpt: "session.ts:42 no-unsafe-cookie / list.ts:88 no-await-in-loop",
      },
      {
        id: "s3",
        title: "OWASP Top 10 — A01 Broken Auth",
        hint: "owasp.org",
        favicon: "/images/forge-logo.svg",
        excerpt: "Session tokens must not be accessible to client-side scripts. Use HttpOnly + Secure + SameSite.",
      },
      {
        id: "s4",
        title: "MDN · Set-Cookie HttpOnly",
        hint: "developer.mozilla.org",
        favicon: "/images/forge-logo.svg",
        excerpt: "When the HttpOnly attribute is set, the cookie cannot be accessed via document.cookie.",
      },
    ],
    followUps: ["第 1 个安全风险展开讲讲", "性能那块给个 IN 查询的代码示例", "测试用例怎么写"],
    time: "14:03",
    latency: "1.4s",
  },
  // ---- 多模态用户消息 mock ----
  {
    role: "user",
    id: "u-voice",
    attachment: { kind: "voice", duration: "0:18" },
    time: "14:08",
  },
  {
    role: "user",
    id: "u-file",
    content: "顺便看看这份设计文档，安全设计有问题吗？",
    attachment: { kind: "file", name: "auth-redesign-v2.pdf", size: "1.2 MB" },
    time: "14:10",
  },
  {
    role: "user",
    id: "u-image",
    content: "这是当前登录页截图，cookie 头有什么问题？",
    attachment: {
      kind: "image",
      url: "/images/screenshot.png",
      alt: "Login page screenshot",
    },
    time: "14:12",
  },
  {
    role: "user",
    id: "u-images",
    content: "几张测试报告截图，挑出失败用例。",
    attachment: {
      kind: "image-grid",
      urls: [
        "/images/chart-card.png",
        "/images/stat-card.png",
        "/chat-hero-code-studio.png",
        "/chat-hero-v2.png",
      ],
      extraCount: 6,
    },
    time: "14:13",
  },
];

const GENERAL_CHAT_PRESETS: Record<
  string,
  {
    user: string;
    assistant: string;
    followUps?: string[];
  }
> = {
  "g-1": {
    user: "帮我把 Q2 OKR 整理成一版能发给团队的版本。",
    assistant: `整理好了，建议拆成 **3 个目标 / 8 个关键结果**：

1. **增长目标** — 新增 3 个高意向行业客户，销售线索转化率提升到 18%。
2. **产品目标** — 完成 Agent 工作台 v1.2，上线 artifact 面板、会话切换、导出能力。
3. **效率目标** — 把周会材料准备时间从 2 小时压到 30 分钟以内。

我也把每个 KR 的负责人、验收口径、风险项补了一版，适合直接贴进飞书文档。`,
    followUps: ["把 KR 改得更可量化", "补一版负责人分工", "压缩成老板能扫一眼的版本"],
  },
  "g-2": {
    user: "把这份产品周会纪要改写得更清楚，别太口语。",
    assistant: `可以，建议按 **结论 / 决策 / 行动项 / 风险** 重排：

1. 本周确定保留右侧预览面板，但组件加载改为按需触发。
2. 输入框固定在底部，消息列表独立滚动，避免切换会话时位置跳动。
3. Word 编辑器先保留 Umo 方案，后续评估更轻量的富文本替代。

行动项我会按负责人和截止时间单独列出，这样后续追踪更稳。`,
    followUps: ["整理成表格", "变成会议邮件", "只保留行动项"],
  },
  "g-3": {
    user: "帮我回一封拒绝邀约的邮件，语气礼貌一点。",
    assistant: `可以这样写：

感谢你的邀请，也很高兴看到这个项目的推进。不过我近期的排期已经比较满，暂时没有足够时间投入到这次合作里。

这不是对项目本身的判断，只是现阶段精力分配确实不太允许。祝活动顺利，如果后续有更合适的时间窗口，我们可以再聊。`,
    followUps: ["更正式一点", "更短一点", "加一点人情味"],
  },
  "g-4": {
    user: "下周深圳出差怎么安排比较顺？",
    assistant: `建议按区域排：

1. **周二上午** 到南山，先见产品和研发相关客户。
2. **周二下午** 留给福田，适合安排商务会和晚餐。
3. **周三上午** 去前海，集中处理合作方拜访。
4. **周三下午** 预留机动时间，避免跨区堵车导致后续全乱。

酒店优先选南山和福田之间，通勤会更稳。`,
    followUps: ["按高铁行程排", "加上餐厅建议", "做成两天日程表"],
  },
  "g-5": {
    user: "讲讲 SQL window functions，别太教科书。",
    assistant: `Window function 可以理解成：**不把行合并掉的聚合**。

普通 \`GROUP BY\` 会把多行压成一行；窗口函数会保留每一行，同时让你看到“这一行在一组数据里的排名、累计值、前后邻居”。

常见用法：

1. \`row_number()\`：组内编号。
2. \`rank()\`：组内排名。
3. \`sum(amount) over (...)\`：累计销售额。
4. \`lag()/lead()\`：看上一行/下一行。`,
    followUps: ["给一个销售数据例子", "讲讲 partition by", "和 group by 对比"],
  },
  "g-6": {
    user: "给老板写一封感谢信，别太谄媚。",
    assistant: `可以写得克制一点：

这段时间项目推进很快，感谢你在关键节点上帮团队明确优先级，也给了我们足够的空间把方案打磨完整。

我自己也从这次协作里学到不少，尤其是如何在不确定的情况下先把核心问题收敛出来。后面我会继续把节奏和质量稳住。`,
    followUps: ["更像微信消息", "更正式邮件版", "加一句团队视角"],
  },
  "g-7": {
    user: "为啥 Q1 转化率掉了 8%？帮我列排查思路。",
    assistant: `先别直接归因，建议拆成四层：

1. **流量结构**：渠道占比有没有变，低意向流量是否增加。
2. **线索质量**：新客画像、地区、行业是否偏离目标客户。
3. **产品路径**：注册、试用、报价、支付每一步掉点在哪。
4. **销售动作**：跟进时效、话术、报价策略有没有变化。

先做漏斗分解，再看渠道和客户分层，通常能定位到 1-2 个主因。`,
    followUps: ["给一张排查表", "转成 SQL 指标", "写成汇报口径"],
  },
};

function getGeneralMessages(conversationId: string): Message[] {
  const preset = GENERAL_CHAT_PRESETS[conversationId];
  if (!preset) return MOCK_MESSAGES;
  return [
    {
      role: "user",
      id: `${conversationId}-u1`,
      content: preset.user,
      time: "14:02",
    },
    {
      role: "assistant",
      id: `${conversationId}-a1`,
      markdown: preset.assistant,
      followUps: preset.followUps,
      time: "14:03",
      latency: "1.1s",
    },
  ];
}

type Drawer =
  | { kind: "sources"; messageId: string }
  | { kind: "thinking"; messageId: string }
  | { kind: "tools"; messageId: string }
  | null;

export function ChatThread({ conversationId }: { conversationId: string }) {
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"think" | "search" | null>(null);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const messages = getGeneralMessages(conversationId);

  const pillActions: PillAction[] = [
    {
      id: "think",
      label: "深度思考",
      icon: <LightbulbBoldDuotone size={16} color="currentColor" />,
      active: mode === "think",
      onClick: () => setMode(mode === "think" ? null : "think"),
    },
    {
      id: "search",
      label: "联网搜索",
      icon: <MagniferLinear size={16} color="currentColor" />,
      active: mode === "search",
      onClick: () => setMode(mode === "search" ? null : "search"),
    },
    {
      id: "upload",
      label: "上传文件",
      icon: <DocumentTextLinear size={16} color="currentColor" />,
      closeOnClick: true,
      onClick: () => {},
    },
  ];

  const activeMessage = drawer
    ? messages.find((m) => m.role === "assistant" && m.id === drawer.messageId)
    : null;

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto px-4 pt-8 pb-44">
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-8">
          {messages.map((m) =>
            m.role === "user" ? (
              <UserMessage key={m.id} message={m} />
            ) : (
              <AssistantMessage
                key={m.id}
                message={m}
                onOpenSources={() => setDrawer({ kind: "sources", messageId: m.id })}
                onOpenThinking={() => setDrawer({ kind: "thinking", messageId: m.id })}
                onOpenTools={() => setDrawer({ kind: "tools", messageId: m.id })}
              />
            ),
          )}
        </div>
      </main>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-fg-grey-50 via-fg-grey-50/95 to-transparent px-4 pb-6 pt-10">
        <div className="pointer-events-auto mx-auto w-full max-w-[820px]">
          <ChatPillBar
            placeholder="继续问点什么..."
            value={draft}
            onChange={setDraft}
            onSend={() => setDraft("")}
            actions={pillActions}
          />
        </div>
      </div>

      {drawer?.kind === "sources" && activeMessage?.role === "assistant" && activeMessage.sources && (
        <SourcesDrawer sources={activeMessage.sources} onClose={() => setDrawer(null)} />
      )}
      {drawer?.kind === "thinking" && activeMessage?.role === "assistant" && activeMessage.thinking && (
        <ThinkingDrawer
          duration={activeMessage.thinking.duration}
          steps={activeMessage.thinking.steps}
          onClose={() => setDrawer(null)}
        />
      )}
      {drawer?.kind === "tools" && activeMessage?.role === "assistant" && activeMessage.toolSteps && (
        <ToolCallDrawer steps={activeMessage.toolSteps} onClose={() => setDrawer(null)} />
      )}
    </div>
  );
}

function UserMessage({
  message,
}: {
  message: Extract<Message, { role: "user" }>;
}) {
  const { content, attachment, time } = message;
  return (
    <div className="flex justify-end">
      <div className="flex max-w-[80%] flex-col items-end gap-1.5">
        {attachment && <UserAttachmentBlock att={attachment} />}
        {content && (
          <div className="rounded-2xl bg-fg-grey-100 px-4 py-2.5 text-[15px] leading-7 text-fg-black">
            {content}
          </div>
        )}
        <span className="text-xs text-fg-grey-500">{time}</span>
      </div>
    </div>
  );
}

function UserAttachmentBlock({ att }: { att: UserAttachment }) {
  if (att.kind === "voice") {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl bg-fg-blue-100 px-3 py-2">
        <button
          type="button"
          aria-label="播放语音"
          className="flex size-7 items-center justify-center rounded-full bg-fg-blue-500 text-white"
        >
          <PlayBoldDuotone size={16} color="var(--fg-grey-50)" />
        </button>
        <div className="flex items-end gap-0.5">
          {[3, 5, 8, 6, 4, 7, 9, 5, 3, 6, 8, 4, 5, 7, 4, 3].map((h, i) => (
            <span
              key={i}
              className="block w-0.5 rounded-full bg-fg-blue-500/70"
              style={{ height: `${h * 2}px` }}
            />
          ))}
        </div>
        <span className="text-xs font-medium tabular-nums text-fg-blue-500">{att.duration}</span>
      </div>
    );
  }
  if (att.kind === "file") {
    const ext = att.name.split(".").pop()?.toUpperCase() ?? "FILE";
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-fg-grey-200 bg-white px-3 py-2.5">
        <FileTypeIcon fileName={att.name} className="size-10" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-fg-black">{att.name}</span>
          <span className="text-xs text-fg-grey-700">{ext} · {att.size}</span>
        </div>
      </div>
    );
  }
  if (att.kind === "image") {
    return (
      <button
        type="button"
        aria-label={att.alt}
        className="overflow-hidden rounded-2xl"
      >
        <span className="relative block h-44 w-72">
          <Image
            src={att.url}
            alt={att.alt}
            fill
            sizes="288px"
            className="object-cover"
          />
        </span>
      </button>
    );
  }
  if (att.kind === "image-grid") {
    const visible = att.urls.slice(0, 4);
    const extra = att.extraCount ?? 0;
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {visible.map((url, i) => {
          const isLast = i === visible.length - 1;
          const showOverlay = isLast && extra > 0;
          return (
            <button
              key={i}
              type="button"
              className="relative h-24 w-32 overflow-hidden rounded-xl"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="128px"
                className="object-cover"
              />
              {showOverlay && (
                <span className="absolute inset-0 flex items-center justify-center bg-fg-black/55 text-sm font-semibold text-fg-grey-50">
                  +{extra}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
  return null;
}

function AssistantMessage({
  message,
  onOpenSources,
  onOpenThinking,
  onOpenTools,
}: {
  message: Extract<Message, { role: "assistant" }>;
  onOpenSources: () => void;
  onOpenThinking: () => void;
  onOpenTools: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {message.thinking && <ThinkingLine duration={message.thinking.duration} onOpen={onOpenThinking} />}
      {message.toolSteps && message.toolSteps.length > 0 && (
        <ToolCallLine steps={message.toolSteps} onOpen={onOpenTools} />
      )}
      <MarkdownBody text={message.markdown} />
      <MessageActions
        time={message.time}
        latency={message.latency}
        sources={message.sources ?? []}
        onOpenSources={onOpenSources}
      />
      {message.followUps && message.followUps.length > 0 && (
        <FollowUps items={message.followUps} />
      )}
    </div>
  );
}

function ThinkingLine({ duration, onOpen }: { duration: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-1.5 self-start text-sm text-fg-grey-700 transition hover:text-fg-grey-900"
    >
      <LightbulbBoldDuotone size={15} color="var(--fg-blue)" />
      <span>思考了 {duration}</span>
      <AltArrowRightLinear size={12} color="currentColor" />
    </button>
  );
}

function ToolCallLine({ steps, onOpen }: { steps: ToolStep[]; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-1.5 self-start text-sm text-fg-grey-700 transition hover:text-fg-grey-900"
    >
      <CodeSquareLinear size={15} color="var(--fg-blue)" />
      <span>调用了 {steps.length} 个工具</span>
      <AltArrowRightLinear size={12} color="currentColor" />
    </button>
  );
}

function ToolCallDrawer({
  steps,
  onClose,
}: {
  steps: ToolStep[];
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-fg-black/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-fg-grey-200 px-5 py-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-fg-grey-700">
              工具调用
            </span>
            <span className="font-display text-base font-semibold text-fg-black">
              {steps.length} 个工具
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex size-8 items-center justify-center rounded-full text-fg-grey-700 hover:bg-fg-grey-100"
          >
            <CloseSquareLinear size={20} color="currentColor" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          <ol className="flex flex-col gap-4">
            {steps.map((s, i) => (
              <li key={s.id} className="flex gap-3">
                <div className="flex flex-col items-center pt-0.5">
                  {s.status === "ok" ? (
                    <CheckSquareBoldDuotone size={18} color="var(--fg-green-600)" />
                  ) : s.status === "warn" ? (
                    <ShieldCheckBoldDuotone size={18} color="var(--fg-yellow-600)" />
                  ) : (
                    <CloseSquareBoldDuotone size={18} color="var(--fg-red-600)" />
                  )}
                  {i < steps.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-fg-grey-200" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 pb-2">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-fg-grey-100 px-1.5 py-0.5 font-mono text-xs text-fg-grey-900">
                      {s.name}
                    </code>
                  </div>
                  <p className="font-mono text-xs leading-5 text-fg-grey-500">{s.args}</p>
                  <p className="text-sm leading-6 text-fg-grey-900">{s.result}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </>
  );
}

function SourcesDrawer({
  sources,
  onClose,
}: {
  sources: ChatSource[];
  onClose: () => void;
}) {
  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-40 bg-fg-black/20 transition" onClick={onClose} />
      {/* drawer */}
      <aside className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-fg-grey-200 px-5 py-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-fg-grey-700">
              来源
            </span>
            <span className="font-display text-base font-semibold text-fg-black">
              {sources.length} 个引用
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex size-8 items-center justify-center rounded-full text-fg-grey-700 hover:bg-fg-grey-100"
          >
            <CloseSquareLinear size={20} color="currentColor" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          <ol className="flex flex-col gap-4">
            {sources.map((s, i) => (
              <li
                key={s.id}
                className="rounded-xl border border-fg-grey-200 bg-white p-4 transition hover:border-fg-blue-500"
              >
                <div className="flex items-center gap-2 text-xs text-fg-grey-700">
                  <span className="flex size-5 items-center justify-center rounded-full bg-fg-grey-100 text-[11px] font-semibold text-fg-grey-900">
                    {i + 1}
                  </span>
                  <Image src={s.favicon} alt="" width={16} height={16} className="size-4 rounded-full" />
                  <span className="truncate">{s.hint}</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold leading-snug text-fg-black">
                  {s.title}
                </h3>
                {s.excerpt && (
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-fg-grey-700">
                    {s.excerpt}
                  </p>
                )}
                <div className="mt-3 flex">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs font-medium text-fg-blue-500 hover:underline"
                  >
                    <LinkLinear size={12} color="currentColor" />
                    查看原文
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </>
  );
}

function ThinkingDrawer({
  duration,
  steps,
  onClose,
}: {
  duration: string;
  steps: { title: string; body: string }[];
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-fg-black/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-fg-grey-200 px-5 py-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-fg-grey-700">
              思考过程
            </span>
            <span className="font-display text-base font-semibold text-fg-black">
              共思考 {duration} · {steps.length} 步
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex size-8 items-center justify-center rounded-full text-fg-grey-700 hover:bg-fg-grey-100"
          >
            <CloseSquareLinear size={20} color="currentColor" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          <ol className="flex flex-col gap-5">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center pt-0.5">
                  <span className="flex size-6 items-center justify-center rounded-full bg-fg-blue-100 text-xs font-semibold text-fg-blue-500">
                    {i + 1}
                  </span>
                  {i < steps.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-fg-grey-200" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 pb-2">
                  <h3 className="text-sm font-semibold text-fg-black">{s.title}</h3>
                  <p className="text-xs leading-6 text-fg-grey-700">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </>
  );
}

// ============================================================
// 极简 markdown 解析（demo 用）
// ============================================================
