"use client";

import { Suspense, type ReactNode, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AppLayout,
  type AppLayoutBreadcrumb,
  type AppLayoutPageHeaderVariant,
} from "@forge-ui/react";
import { profile } from "@/config/menu";
import { apps, DEFAULT_APP_SLUG, getAppBySlug } from "@/app/_mock/apps";
import { ChatSidebar } from "./chat-sidebar";

export function AppShell({
  pageTitle,
  pageHeaderVariant = "home",
  primaryAction,
  secondaryAction,
  breadcrumbs,
  onBack,
  searchPlaceholder,
  hideHeader,
  children,
}: {
  pageTitle?: string;
  pageHeaderVariant?: AppLayoutPageHeaderVariant;
  primaryAction?: { label: string; onClick?: () => void };
  secondaryAction?: { label: string; onClick?: () => void };
  breadcrumbs?: AppLayoutBreadcrumb[];
  onBack?: () => void;
  searchPlaceholder?: string;
  hideHeader?: boolean;
  children: ReactNode;
}) {
  const params = useParams<{ appId?: string }>();
  const router = useRouter();
  const currentSlug = params?.appId ?? DEFAULT_APP_SLUG;
  const currentApp = getAppBySlug(currentSlug) ?? getAppBySlug(DEFAULT_APP_SLUG)!;

  // forge-ui 的 TeamSwitcherDropdown 不暴露 onSelect，用事件委托拦截下拉项的点击
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const text = target.textContent?.trim();
      if (!text) return;
      const matched = apps.find((a) => a.name === text);
      if (!matched) return;
      if (target.closest('[data-popover-trigger="team"]')) return;
      if (matched.slug === currentApp.slug) return;
      e.preventDefault();
      e.stopPropagation();
      router.push(`/${matched.slug}/chat`);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [currentApp.slug, router]);

  const teams = useMemo(
    () =>
      apps.map((a) => ({
        id: a.id,
        name: a.name,
        active: a.id === currentApp.id,
      })),
    [currentApp.id],
  );

  return (
    <AppLayout
      mode="light"
      profilePosition="sidebar"
      accent="blue"
      teamName={currentApp.name}
      teamSubtitle={currentApp.tagline}
      teams={teams}
      teamLabels={{ invite: "邀请成员", settings: "应用设置", createNew: "新建应用" }}
      sidebarSlot={
        <Suspense fallback={null}>
          <ChatSidebar />
        </Suspense>
      }
      hideSidebarWidgets
      profile={profile}
      pageTitle={pageTitle}
      pageHeaderVariant={pageHeaderVariant}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      breadcrumbs={breadcrumbs}
      onBack={onBack}
      searchPlaceholder={searchPlaceholder}
      showDatePicker={false}
      showKebab={false}
      hideHeader={hideHeader}
    >
      {children}
    </AppLayout>
  );
}
