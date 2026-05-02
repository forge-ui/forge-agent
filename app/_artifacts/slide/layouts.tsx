"use client";

/**
 * 4 种 Slide layout 的 React 渲染组件。
 * 设计为 16:9，固定 aspect ratio container 内 absolute 定位。
 *
 * AI 输出的 SlideSchema:
 *   { id, layout: "title"|"bullets"|"image-text"|"two-col", title, bullets?, image?, notes? }
 */

import type { Slide } from "@/app/_artifacts/types";

export function SlideRenderer({ slide }: { slide: Slide }) {
  switch (slide.layout) {
    case "title":
      return <TitleLayout slide={slide} />;
    case "bullets":
      return <BulletsLayout slide={slide} />;
    case "image-text":
      return <ImageTextLayout slide={slide} />;
    case "two-col":
      return <TwoColLayout slide={slide} />;
    default:
      return <BulletsLayout slide={slide} />;
  }
}

// ============================================================
// 16:9 frame
// ============================================================

function SlideFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-fg-grey-200" style={{ aspectRatio: "16 / 9" }}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

// ============================================================
// Layout 1: title — 大居中标题（封面页）
// ============================================================

function TitleLayout({ slide }: { slide: Slide }) {
  return (
    <SlideFrame>
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-fg-blue-700 to-fg-blue-500 px-12 text-white">
        <h1 className="text-center text-5xl font-bold leading-tight">{slide.title}</h1>
        {slide.notes && <p className="mt-4 text-center text-lg text-white/80">{slide.notes}</p>}
      </div>
    </SlideFrame>
  );
}

// ============================================================
// Layout 2: bullets — 标题 + bullet list（最常用）
// ============================================================

function BulletsLayout({ slide }: { slide: Slide }) {
  return (
    <SlideFrame>
      <div className="flex h-full flex-col px-12 py-10">
        <div className="flex items-center gap-3 border-b-2 border-fg-blue-500 pb-3">
          <span className="h-6 w-1.5 rounded bg-fg-blue-500" />
          <h2 className="text-3xl font-bold text-fg-black">{slide.title}</h2>
        </div>
        <ul className="mt-6 flex flex-1 flex-col gap-3 overflow-hidden">
          {(slide.bullets ?? []).map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-xl leading-relaxed text-fg-grey-900">
              <span className="mt-2.5 size-2 shrink-0 rounded-full bg-fg-blue-500" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </SlideFrame>
  );
}

// ============================================================
// Layout 3: image-text — 左图右文
// ============================================================

function ImageTextLayout({ slide }: { slide: Slide }) {
  return (
    <SlideFrame>
      <div className="grid h-full grid-cols-2">
        <div className="relative overflow-hidden bg-fg-grey-100">
          {slide.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-fg-grey-500">
              [ 图片占位 ]
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center px-10 py-8">
          <h2 className="border-l-4 border-fg-blue-500 pl-3 text-2xl font-bold leading-tight text-fg-black">
            {slide.title}
          </h2>
          <ul className="mt-5 flex flex-col gap-2.5">
            {(slide.bullets ?? []).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-base text-fg-grey-900">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-fg-blue-500" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SlideFrame>
  );
}

// ============================================================
// Layout 4: two-col — 双栏对比
// ============================================================

function TwoColLayout({ slide }: { slide: Slide }) {
  const half = Math.ceil((slide.bullets ?? []).length / 2);
  const left = (slide.bullets ?? []).slice(0, half);
  const right = (slide.bullets ?? []).slice(half);
  return (
    <SlideFrame>
      <div className="flex h-full flex-col px-10 py-8">
        <div className="flex items-center gap-3 border-b-2 border-fg-blue-500 pb-3">
          <span className="h-6 w-1.5 rounded bg-fg-blue-500" />
          <h2 className="text-3xl font-bold text-fg-black">{slide.title}</h2>
        </div>
        <div className="mt-6 grid flex-1 grid-cols-2 gap-6">
          {[left, right].map((col, ci) => (
            <ul key={ci} className="flex flex-col gap-2.5">
              {col.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-base leading-relaxed text-fg-grey-900">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-fg-blue-500" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
