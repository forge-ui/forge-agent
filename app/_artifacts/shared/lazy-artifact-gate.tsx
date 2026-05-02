"use client";

import type { ReactNode } from "react";
import { Button, type ButtonColor } from "@forge-ui/react";

type LazyArtifactGateProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  badge?: string;
  actionColor?: ButtonColor;
  disabled?: boolean;
  disabledReason?: string;
  icon?: ReactNode;
  children?: ReactNode;
};

export function LazyArtifactGate({
  title,
  description,
  actionLabel,
  onAction,
  badge,
  actionColor = "blue",
  disabled,
  disabledReason,
  icon,
  children,
}: LazyArtifactGateProps) {
  return (
    <div className="flex h-full items-center justify-center overflow-auto bg-fg-grey-50 p-6">
      <section className="flex w-full max-w-[720px] flex-col gap-5 rounded-lg border border-fg-grey-200 bg-fg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          {icon ? (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-fg-blue-50 text-fg-blue-500">
              {icon}
            </span>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-bold text-fg-black">{title}</h3>
              {badge ? (
                <span className="rounded bg-fg-grey-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-fg-grey-900">
                  {badge}
                </span>
              ) : null}
            </div>
            <p className="text-sm leading-6 text-fg-grey-700">{description}</p>
          </div>
        </div>

        {children ? <div className="min-h-0">{children}</div> : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-fg-grey-100 pt-4">
          <span className="text-xs leading-5 text-fg-grey-700">
            {disabled && disabledReason ? disabledReason : "重型运行时会在点击后按需加载。"}
          </span>
          <Button
            type="button"
            color={actionColor}
            variant="primary"
            size="md"
            disabled={disabled}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}

export function LazyArtifactLoading({ label = "组件加载中…" }: { label?: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-fg-grey-50 px-6 text-sm text-fg-grey-700">
      {label}
    </div>
  );
}
