"use client";

import { useParams } from "next/navigation";
import {
  accentBg,
  accentIconColor,
  DEFAULT_APP_SLUG,
  getAppBySlug,
} from "@/app/_mock/apps";

export function PagePlaceholder({
  pageLabel,
  description,
}: {
  pageLabel: string;
  description: string;
}) {
  const params = useParams<{ appId?: string }>();
  const slug = params?.appId ?? DEFAULT_APP_SLUG;
  const app = getAppBySlug(slug) ?? getAppBySlug(DEFAULT_APP_SLUG)!;
  const Icon = app.icon;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 rounded-card border border-dashed border-fg-grey-200 bg-white p-12 text-center">
      <div
        className={`flex size-16 items-center justify-center rounded-2xl ${accentBg[app.accent]}`}
      >
        <Icon size={32} color={accentIconColor[app.accent]} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-fg-grey-500">
          {app.name} · {pageLabel}
        </p>
        <h2 className="font-display text-2xl font-bold tracking-fg text-fg-black">
          {description}
        </h2>
        <p className="max-w-md text-sm text-fg-grey-700">
          这一页还没接业务，正在搭壳。切换左上角的 App 可以看不同业务的入口。
        </p>
      </div>
    </div>
  );
}
