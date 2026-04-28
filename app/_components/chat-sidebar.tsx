"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { PlusIcon } from "@forge-ui/react";
import {
  ChatRoundLineLinear,
  LibraryBoldDuotone,
  SettingsBoldDuotone,
} from "solar-icon-set";
import {
  type Conversation,
  type ConversationGroup,
  DEFAULT_APP_SLUG,
  getAppBySlug,
} from "@/app/_mock/apps";

const GROUP_LABEL: Record<ConversationGroup, string> = {
  today: "今天",
  earlier: "更早",
};

const GROUP_ORDER: ConversationGroup[] = ["today", "earlier"];

export function ChatSidebar() {
  const params = useParams<{ appId?: string }>();
  const pathname = usePathname() ?? "";
  const slug = params?.appId ?? DEFAULT_APP_SLUG;
  const app = getAppBySlug(slug) ?? getAppBySlug(DEFAULT_APP_SLUG)!;

  const grouped = groupConversations(app.conversations);

  const knowledgeHref = `/${app.slug}/knowledge`;
  const settingsHref = `/${app.slug}/settings`;

  return (
    <div className="flex h-full flex-col gap-4 px-1">
      {/* + 新对话 */}
      <Link
        href={`/${app.slug}/chat`}
        className="flex items-center justify-center gap-2 rounded-xl bg-fg-violet px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
      >
        <PlusIcon size={16} />
        新对话
      </Link>

      {/* 对话列表 */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {GROUP_ORDER.map((g) => {
          const items = grouped[g];
          if (!items || items.length === 0) return null;
          return (
            <div key={g} className="flex flex-col gap-1">
              <div className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-fg-grey-700">
                {GROUP_LABEL[g]}
              </div>
              {items.map((c) => (
                <ChatRow key={c.id} conv={c} slug={app.slug} />
              ))}
            </div>
          );
        })}
      </div>

      {/* 底部菜单 */}
      <nav className="flex flex-col gap-1 border-t border-fg-grey-200 pt-3">
        <SidebarLink
          href={knowledgeHref}
          active={pathname.startsWith(knowledgeHref)}
          icon={<LibraryBoldDuotone size={18} />}
          label="知识库"
        />
        <SidebarLink
          href={settingsHref}
          active={pathname.startsWith(settingsHref)}
          icon={<SettingsBoldDuotone size={18} />}
          label="设置"
        />
      </nav>
    </div>
  );
}

function ChatRow({ conv, slug }: { conv: Conversation; slug: string }) {
  return (
    <Link
      href={`/${slug}/chat?c=${conv.id}`}
      className="flex items-center gap-2 truncate rounded-lg px-3 py-2 text-left text-sm text-fg-grey-900 transition hover:bg-fg-grey-100"
    >
      <ChatRoundLineLinear size={14} color="#71717A" />
      <span className="truncate">{conv.title}</span>
    </Link>
  );
}

function SidebarLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "flex items-center gap-3 rounded-xl bg-fg-violet px-3 py-2.5 text-sm font-semibold text-white"
          : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-fg-grey-900 hover:bg-fg-grey-100"
      }
    >
      {icon}
      {label}
    </Link>
  );
}

function groupConversations(items: Conversation[]) {
  return items.reduce(
    (acc, c) => {
      acc[c.group] = acc[c.group] ?? [];
      acc[c.group]!.push(c);
      return acc;
    },
    {} as Partial<Record<ConversationGroup, Conversation[]>>,
  );
}
