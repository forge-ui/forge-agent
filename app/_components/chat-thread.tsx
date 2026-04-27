"use client";

import { useState } from "react";
import {
  AltArrowDownLinear,
  AltArrowRightLinear,
  CheckCircleBoldDuotone,
  CodeSquareLinear,
  CloseCircleLinear,
  CopyLinear,
  DocumentTextLinear,
  LightbulbBoldDuotone,
  LinkLinear,
  MagniferLinear,
  RefreshLinear,
  ShieldCheckBoldDuotone,
  ArrowLeftDownLinear,
  GalleryWideLinear,
  MusicNotesLinear,
  PlayCircleBoldDuotone,
} from "solar-icon-set";
import { ChatInputBar, type ChatInputBarToggle, FileTypeIcon } from "@forge-ui/react";

type ToolStep = {
  id: string;
  name: string;
  args: string;
  result: string;
  status: "ok" | "warn" | "error";
};

type Source = {
  id: string;
  title: string;
  hint: string;
  favicon: string;
  excerpt?: string;
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
      sources?: Source[];
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
        favicon: "https://www.google.com/s2/favicons?sz=32&domain=github.com",
        excerpt: "把 session cookie 的 HttpOnly 默认值从 true 改成 false，理由是方便前端读取登录态。",
      },
      {
        id: "s2",
        title: "ESLint Report",
        hint: "ci-2026-04-27 · 3 errors",
        favicon: "https://www.google.com/s2/favicons?sz=32&domain=eslint.org",
        excerpt: "session.ts:42 no-unsafe-cookie / list.ts:88 no-await-in-loop",
      },
      {
        id: "s3",
        title: "OWASP Top 10 — A01 Broken Auth",
        hint: "owasp.org",
        favicon: "https://www.google.com/s2/favicons?sz=32&domain=owasp.org",
        excerpt: "Session tokens must not be accessible to client-side scripts. Use HttpOnly + Secure + SameSite.",
      },
      {
        id: "s4",
        title: "MDN · Set-Cookie HttpOnly",
        hint: "developer.mozilla.org",
        favicon: "https://www.google.com/s2/favicons?sz=32&domain=mdn.io",
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
      url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
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
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
        "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&q=80",
        "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&q=80",
      ],
      extraCount: 6,
    },
    time: "14:13",
  },
];

type Drawer =
  | { kind: "sources"; messageId: string }
  | { kind: "thinking"; messageId: string }
  | { kind: "tools"; messageId: string }
  | null;

export function ChatThread() {
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"think" | "search" | null>(null);
  const [drawer, setDrawer] = useState<Drawer>(null);

  const toggles: ChatInputBarToggle[] = [
    {
      id: "think",
      label: "深度思考",
      icon: <LightbulbBoldDuotone size={15} color={mode === "think" ? "#fff" : "#52525B"} />,
      active: mode === "think",
      onClick: () => setMode(mode === "think" ? null : "think"),
    },
    {
      id: "search",
      label: "联网搜索",
      icon: <MagniferLinear size={15} color={mode === "search" ? "#fff" : "#52525B"} />,
      active: mode === "search",
      onClick: () => setMode(mode === "search" ? null : "search"),
    },
    {
      id: "upload",
      label: "上传文件",
      icon: <DocumentTextLinear size={15} color="#52525B" />,
      onClick: () => {},
    },
  ];

  const activeMessage = drawer
    ? MOCK_MESSAGES.find((m) => m.role === "assistant" && m.id === drawer.messageId)
    : null;

  return (
    <div className="relative flex h-full min-h-[calc(100vh-80px)] flex-col">
      <main className="mx-auto flex w-full max-w-[820px] flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
        {MOCK_MESSAGES.map((m) =>
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
      </main>
      <div className="mx-auto flex w-full max-w-[820px] justify-center px-4 pb-6">
        <ChatInputBar
          className="w-full"
          multiline
          rows={3}
          placeholder="继续问点什么..."
          value={draft}
          onChange={setDraft}
          onSend={() => setDraft("")}
          toggles={toggles}
        />
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
      <div className="flex items-center gap-2.5 rounded-2xl bg-purple-100 px-3 py-2">
        <button
          type="button"
          aria-label="播放语音"
          className="flex size-7 items-center justify-center rounded-full bg-fg-violet text-white"
        >
          <PlayCircleBoldDuotone size={16} color="#fff" />
        </button>
        <div className="flex items-end gap-0.5">
          {[3, 5, 8, 6, 4, 7, 9, 5, 3, 6, 8, 4, 5, 7, 4, 3].map((h, i) => (
            <span
              key={i}
              className="block w-0.5 rounded-full bg-fg-violet/70"
              style={{ height: `${h * 2}px` }}
            />
          ))}
        </div>
        <span className="text-xs font-medium tabular-nums text-fg-violet">{att.duration}</span>
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
        <img src={att.url} alt={att.alt} className="h-44 w-auto object-cover" />
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
              <img src={url} alt="" className="h-full w-full object-cover" />
              {showOverlay && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
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
      <LightbulbBoldDuotone size={15} color="#A78BFA" />
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
      <CodeSquareLinear size={15} color="#7C3AED" />
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
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
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
            <CloseCircleLinear size={20} color="currentColor" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          <ol className="flex flex-col gap-4">
            {steps.map((s, i) => (
              <li key={s.id} className="flex gap-3">
                <div className="flex flex-col items-center pt-0.5">
                  {s.status === "ok" ? (
                    <CheckCircleBoldDuotone size={18} color="#059669" />
                  ) : s.status === "warn" ? (
                    <ShieldCheckBoldDuotone size={18} color="#D97706" />
                  ) : (
                    <RefreshLinear size={18} color="#E11D48" />
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

function MarkdownBody({ text }: { text: string }) {
  const blocks = parseMarkdownBlocks(text);
  return (
    <div className="flex flex-col gap-3 text-[15px] leading-7 text-fg-black">
      {blocks.map((b, i) =>
        b.type === "code" ? (
          <pre
            key={i}
            className="overflow-x-auto rounded-xl bg-fg-grey-900 px-4 py-3 font-mono text-sm leading-6 text-white"
          >
            <code>{b.content}</code>
          </pre>
        ) : (
          <p key={i} dangerouslySetInnerHTML={{ __html: renderInline(b.content) }} />
        ),
      )}
    </div>
  );
}

function MessageActions({
  time,
  latency,
  sources,
  onOpenSources,
}: {
  time: string;
  latency?: string;
  sources: Source[];
  onOpenSources: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-fg-grey-500">
      <ActionBtn icon={<CopyLinear size={13} color="currentColor" />} label="复制" />
      <ActionBtn icon={<RefreshLinear size={13} color="currentColor" />} label="重新生成" />
      <span className="text-fg-grey-400">·</span>
      <span>{time}</span>
      {latency && (
        <>
          <span className="text-fg-grey-400">·</span>
          <span>{latency}</span>
        </>
      )}
      {sources.length > 0 && (
        <button
          type="button"
          onClick={onOpenSources}
          className="ml-auto flex items-center gap-2 rounded-full border border-fg-grey-200 bg-white px-2.5 py-1 text-xs font-medium text-fg-grey-900 transition hover:border-fg-violet"
        >
          <span className="flex -space-x-1.5">
            {sources.slice(0, 3).map((s) => (
              <img
                key={s.id}
                src={s.favicon}
                alt=""
                className="size-4 rounded-full ring-2 ring-white"
              />
            ))}
          </span>
          <span>{sources.length} 个来源</span>
        </button>
      )}
    </div>
  );
}

function ActionBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 transition hover:text-fg-grey-900"
    >
      {icon}
      {label}
    </button>
  );
}

function FollowUps({ items }: { items: string[] }) {
  return (
    <div className="mt-1 flex flex-col">
      {items.map((q, i) => (
        <button
          key={i}
          type="button"
          className={`flex items-center gap-2 py-2 text-left text-sm text-fg-grey-900 transition hover:text-fg-violet ${
            i > 0 ? "border-t border-fg-grey-100" : ""
          }`}
        >
          <ArrowLeftDownLinear size={14} color="#A1A1AA" />
          <span>{q}</span>
        </button>
      ))}
    </div>
  );
}

function SourcesDrawer({
  sources,
  onClose,
}: {
  sources: Source[];
  onClose: () => void;
}) {
  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 transition" onClick={onClose} />
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
            <CloseCircleLinear size={20} color="currentColor" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          <ol className="flex flex-col gap-4">
            {sources.map((s, i) => (
              <li
                key={s.id}
                className="rounded-xl border border-fg-grey-200 bg-white p-4 transition hover:border-fg-violet"
              >
                <div className="flex items-center gap-2 text-xs text-fg-grey-700">
                  <span className="flex size-5 items-center justify-center rounded-full bg-fg-grey-100 text-[11px] font-semibold text-fg-grey-900">
                    {i + 1}
                  </span>
                  <img src={s.favicon} alt="" className="size-4 rounded-full" />
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
                    className="flex items-center gap-1.5 text-xs font-medium text-fg-violet hover:underline"
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
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
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
            <CloseCircleLinear size={20} color="currentColor" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          <ol className="flex flex-col gap-5">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center pt-0.5">
                  <span className="flex size-6 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-fg-violet">
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

function parseMarkdownBlocks(text: string): { type: "p" | "code"; content: string }[] {
  const out: { type: "p" | "code"; content: string }[] = [];
  const parts = text.split(/```(\w*)\n?/);
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) {
      const trimmed = parts[i].trim();
      if (trimmed) out.push({ type: "p", content: trimmed });
    } else if (i % 3 === 2) {
      out.push({ type: "code", content: parts[i].replace(/\n```$/, "").trim() });
    }
  }
  return out;
}

function renderInline(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-fg-grey-100 font-mono text-[13px]">$1</code>')
    .replace(/\n/g, "<br />");
}
