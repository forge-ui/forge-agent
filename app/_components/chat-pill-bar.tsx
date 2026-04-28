"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CheckIcon, PlusIcon } from "@forge-ui/react";
import { PlainBold } from "solar-icon-set";

export type PillAction = {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  /** 点击后是否关闭菜单（一次性 action 设 true，toggle 类 action 保持 false） */
  closeOnClick?: boolean;
  onClick: () => void;
};

export function ChatPillBar({
  value,
  onChange,
  onSend,
  placeholder,
  actions,
  maxHeight = 240,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder?: string;
  actions?: PillAction[];
  maxHeight?: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const newH = Math.min(ta.scrollHeight, maxHeight);
    ta.style.height = newH + "px";
    const cs = getComputedStyle(ta);
    const lineH = parseFloat(cs.lineHeight || "24");
    const padY =
      parseFloat(cs.paddingTop || "0") + parseFloat(cs.paddingBottom || "0");
    const contentH = newH - padY;
    setExpanded(contentH > lineH * 1.5);
  }, [value, maxHeight]);

  useEffect(() => {
    if (!menuOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [menuOpen]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) onSend();
    }
  }

  const canSend = value.trim().length > 0;
  const gridAreas = expanded
    ? `"primary primary primary" "leading . trailing"`
    : `"leading primary trailing"`;

  return (
    <div ref={containerRef} className="relative">
      {menuOpen && actions && actions.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 flex min-w-[200px] flex-col gap-0.5 rounded-2xl border border-fg-grey-200 bg-white p-1.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)]">
          {actions.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                a.onClick();
                if (a.closeOnClick) setMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${
                a.active
                  ? "bg-purple-100 text-fg-violet"
                  : "text-fg-black hover:bg-fg-grey-100"
              }`}
            >
              <span className="flex size-5 items-center justify-center">
                {a.icon}
              </span>
              <span className="flex-1 font-medium">{a.label}</span>
              {a.active && (
                <span className="text-fg-violet">
                  <CheckIcon size={14} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) taRef.current?.focus();
        }}
        className="grid cursor-text gap-2 border border-fg-grey-200 bg-white p-2 shadow-sm transition focus-within:border-fg-grey-400"
        style={{
          borderRadius: expanded ? 24 : 9999,
          gridTemplateColumns: "auto 1fr auto",
          gridTemplateAreas: gridAreas,
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((m) => !m);
          }}
          aria-label="更多操作"
          style={{ gridArea: "leading" }}
          className={`flex size-9 items-center justify-center self-end rounded-full transition ${
            menuOpen
              ? "bg-fg-violet text-white"
              : "text-fg-grey-700 hover:bg-fg-grey-100"
          }`}
        >
          <PlusIcon size={20} />
        </button>

        <div
          style={{ gridArea: "primary" }}
          className="flex min-h-10 items-center"
          onClick={() => taRef.current?.focus()}
        >
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent px-2 py-1.5 text-[15px] leading-6 text-fg-black placeholder:text-fg-grey-500 focus:outline-none"
            style={{ overflow: "auto" }}
          />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (canSend) onSend();
          }}
          aria-label="发送"
          disabled={!canSend}
          style={{ gridArea: "trailing" }}
          className="flex size-9 items-center justify-center self-end rounded-full bg-fg-violet text-white transition hover:bg-violet-700 disabled:bg-fg-grey-200 disabled:text-fg-grey-500"
        >
          <PlainBold size={16} color="currentColor" />
        </button>
      </div>
    </div>
  );
}
