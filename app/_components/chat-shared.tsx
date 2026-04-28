"use client";

import { ArrowLeftDownLinear, CopyLinear, RefreshLinear } from "solar-icon-set";

export type ChatSource = {
  id: string;
  title: string;
  hint: string;
  favicon: string;
  excerpt?: string;
};

export function MarkdownBody({ text }: { text: string }) {
  const blocks = parseMarkdownBlocks(text);
  return (
    <div className="flex flex-col gap-3 text-[15px] leading-7 text-fg-black">
      {blocks.map((b, i) =>
        b.type === "code" ? (
          <pre
            key={i}
            className="overflow-x-auto rounded-xl border border-fg-grey-200 bg-white px-4 py-3 font-mono text-sm leading-6 text-fg-grey-900"
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

export function MessageActions({
  time,
  latency,
  sources,
  onOpenSources,
}: {
  time: string;
  latency?: string;
  sources?: ChatSource[];
  onOpenSources?: () => void;
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
      {sources && sources.length > 0 && (
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

export function FollowUps({
  items,
  onPick,
}: {
  items: string[];
  onPick?: (q: string) => void;
}) {
  return (
    <div className="mt-1 flex flex-col">
      {items.map((q, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick?.(q)}
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

export function parseMarkdownBlocks(
  text: string,
): { type: "p" | "code"; content: string }[] {
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

export function renderInline(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-fg-grey-100 font-mono text-[13px]">$1</code>')
    .replace(/\n/g, "<br />");
}
