"use client";

/**
 * Slide artifact Render — 缩略图栏 + 当前页大屏。
 *
 * AI 输出 SlideSchema (Slide[])，前端渲染：
 * - 左侧 thumbnail 列（点击切页）
 * - 右侧大屏当前 slide
 * - 顶部工具栏：页码 / 上下页 / 添加 slide / 演示模式
 *
 * 编辑能力（暂时占位）：每个 slide 是否可编辑由 readOnly 决定，但 inline editing
 * 是 P4 的事；这次只验证 SlideSchema → React 渲染 → PptxGenJS 导出整套链路。
 */

import { useState } from "react";
import { AddCircleLinear, AltArrowLeftLinear, AltArrowRightLinear, PlayCircleBold } from "solar-icon-set";
import type { ArtifactRenderProps, Slide } from "@/app/_artifacts/types";
import { SlideRenderer } from "./layouts";

export default function SlideRender({ payload, readOnly, onChange }: ArtifactRenderProps<"slide">) {
  const [active, setActive] = useState(0);
  const slides = payload.slides;
  const currentSlide = slides[active] ?? slides[0];

  function addSlide() {
    if (readOnly) return;
    const next: Slide = {
      id: `s-${Date.now()}`,
      layout: "bullets",
      title: "新建幻灯",
      bullets: ["在这里写要点"],
    };
    const nextSlides = [...slides, next];
    onChange?.({ slides: nextSlides });
    setActive(nextSlides.length - 1);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-fg-grey-200 bg-fg-grey-50 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-fg-grey-700">
          <span className="font-mono font-semibold text-fg-grey-900">deck.pptx</span>
          <span className="rounded bg-fg-grey-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-fg-grey-900">
            {slides.length} 页
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ToolbarBtn
            ariaLabel="上一页"
            disabled={active <= 0}
            onClick={() => setActive((i) => Math.max(0, i - 1))}
            icon={<AltArrowLeftLinear size={14} color="currentColor" />}
          />
          <span className="px-2 text-xs tabular-nums text-fg-grey-900">
            {active + 1} / {slides.length}
          </span>
          <ToolbarBtn
            ariaLabel="下一页"
            disabled={active >= slides.length - 1}
            onClick={() => setActive((i) => Math.min(slides.length - 1, i + 1))}
            icon={<AltArrowRightLinear size={14} color="currentColor" />}
          />
          <span className="mx-1 h-4 w-px bg-fg-grey-200" />
          <ToolbarBtn
            ariaLabel="添加幻灯"
            disabled={readOnly}
            onClick={addSlide}
            icon={<AddCircleLinear size={14} color="currentColor" />}
          />
          <button
            type="button"
            className="ml-1 flex items-center gap-1 rounded bg-fg-blue-500 px-3 py-1 text-xs font-semibold text-white transition hover:brightness-90"
          >
            <PlayCircleBold size={12} color="currentColor" />
            演示
          </button>
        </div>
      </div>

      <div className="grid flex-1 overflow-hidden" style={{ gridTemplateColumns: "180px 1fr" }}>
        {/* 缩略图栏 */}
        <aside className="overflow-y-auto border-r border-fg-grey-200 bg-fg-grey-50 p-3">
          <ol className="flex flex-col gap-2">
            {slides.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className={
                    i === active
                      ? "block w-full rounded-md p-1 ring-2 ring-fg-blue-500"
                      : "block w-full rounded-md p-1 ring-1 ring-fg-grey-200 transition hover:ring-fg-blue-300"
                  }
                >
                  <span className="block text-left text-[10px] font-semibold text-fg-grey-700">
                    {i + 1}.
                  </span>
                  <div className="pointer-events-none origin-top-left scale-[0.18] transform-gpu" style={{ width: "555%" }}>
                    <SlideRenderer slide={s} />
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        {/* 当前页大屏 */}
        <section className="overflow-auto bg-fg-grey-100 p-8">
          {currentSlide && (
            <div className="mx-auto w-full max-w-4xl">
              <SlideRenderer slide={currentSlide} />
              {currentSlide.notes && (
                <div className="mt-4 rounded-lg border border-fg-grey-200 bg-white px-4 py-3 text-sm leading-6 text-fg-grey-700">
                  <span className="font-semibold text-fg-grey-900">演讲备注：</span>
                  {currentSlide.notes}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ToolbarBtn({
  icon,
  onClick,
  disabled,
  ariaLabel,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex size-7 items-center justify-center rounded text-fg-grey-700 transition hover:bg-fg-grey-100 hover:text-fg-black disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}
    </button>
  );
}
