/**
 * Slide artifact exporter — 用 PptxGenJS 把 SlideSchema 转成原生 .pptx。
 *
 * 关键点：导出的 .pptx 是 native 元素（文本框 / shape），用户在 PowerPoint
 * 打开后能直接编辑文字 / 调样式，不是图片化的（这是 Marp 路线的劣势）。
 */

import type { ArtifactPayloadMap, Slide as SlideSchema } from "@/app/_artifacts/types";

const PPTXGEN_SCRIPT_SRC = "/vendor/pptxgen.bundle.js";
const BLUE_500 = "3553FF";
const BLUE_700 = "263BB5";
const BLACK = "000A19";
const GREY_700 = "868686";

export async function exportSlidesAsPptx(
  payload: ArtifactPayloadMap["slide"],
): Promise<Blob> {
  const PptxGenJS = await loadPptxGenJS();
  const pptx = new PptxGenJS();

  // 16:9 标准尺寸
  pptx.layout = "LAYOUT_WIDE";

  for (const slide of payload.slides) {
    const s = pptx.addSlide();
    addLayout(s as unknown as PptxSlide, slide);
  }

  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  return blob;
}

// ============================================================
// 浏览器端按需加载 PptxGenJS UMD
// ============================================================

type PptxGenCtor = new () => PptxInstance;

type PptxInstance = {
  layout: string;
  addSlide: () => PptxSlide;
  write: (options: { outputType: "blob" }) => Promise<Blob>;
};

declare global {
  interface Window {
    PptxGenJS?: PptxGenCtor;
  }
}

let pptxGenPromise: Promise<PptxGenCtor> | null = null;

function loadPptxGenJS(): Promise<PptxGenCtor> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PPTX 导出只能在浏览器中执行。"));
  }
  if (window.PptxGenJS) return Promise.resolve(window.PptxGenJS);
  if (pptxGenPromise) return pptxGenPromise;

  pptxGenPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-artifact-exporter="pptxgenjs"]`,
    );

    if (existing) {
      existing.addEventListener("load", () => resolveLoaded(resolve, reject), { once: true });
      existing.addEventListener("error", () => reject(new Error("PptxGenJS 加载失败。")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = PPTXGEN_SCRIPT_SRC;
    script.async = true;
    script.dataset.artifactExporter = "pptxgenjs";
    script.onload = () => resolveLoaded(resolve, reject);
    script.onerror = () => reject(new Error("PptxGenJS 加载失败。"));
    document.head.appendChild(script);
  });

  return pptxGenPromise;
}

function resolveLoaded(
  resolve: (value: PptxGenCtor) => void,
  reject: (reason?: unknown) => void,
) {
  if (window.PptxGenJS) {
    resolve(window.PptxGenJS);
    return;
  }
  reject(new Error("PptxGenJS 未暴露到 window。"));
}

// ============================================================
// 各 layout 写入 pptx
// ============================================================

// PptxGenJS 的 Slide 类型不在公开 d.ts 里稳定暴露，我们用结构化类型描述需要的方法。
// addText 在 PptxGenJS 接受 string | TextProps[]，签名用 unknown 兜底避免 import 冲突。
type PptxSlide = {
  background?: { color: string };
  addText: (text: unknown, opts?: Record<string, unknown>) => unknown;
  addShape: (type: string, opts: Record<string, unknown>) => unknown;
  addImage: (opts: Record<string, unknown>) => unknown;
  addNotes: (text: string) => unknown;
};

function addLayout(s: PptxSlide, slide: SlideSchema) {
  switch (slide.layout) {
    case "title":
      addTitle(s, slide);
      break;
    case "bullets":
      addBullets(s, slide);
      break;
    case "image-text":
      addImageText(s, slide);
      break;
    case "two-col":
      addTwoCol(s, slide);
      break;
    default:
      addBullets(s, slide);
  }
  if (slide.notes) s.addNotes(slide.notes);
}

function addTitle(s: PptxSlide, slide: SlideSchema) {
  s.background = { color: BLUE_700 };
  s.addText(slide.title, {
    x: 0.5,
    y: 2.5,
    w: 12.33,
    h: 2,
    fontSize: 54,
    bold: true,
    color: "FFFFFF",
    align: "center",
    valign: "middle",
    fontFace: "Calibri",
  });
  if (slide.notes) {
    s.addText(slide.notes, {
      x: 0.5,
      y: 4.5,
      w: 12.33,
      h: 1,
      fontSize: 20,
      color: "DDDDDD",
      align: "center",
      fontFace: "Calibri",
    });
  }
}

function addBullets(s: PptxSlide, slide: SlideSchema) {
  s.addShape("rect", { x: 0.5, y: 0.55, w: 0.18, h: 0.6, fill: { color: BLUE_500 }, line: { color: BLUE_500 } });
  s.addText(slide.title, {
    x: 0.85,
    y: 0.4,
    w: 11.5,
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: BLACK,
    fontFace: "Calibri",
  });
  s.addShape("line", {
    x: 0.5,
    y: 1.3,
    w: 12.33,
    h: 0,
    line: { color: BLUE_500, width: 2 },
  });
  const bullets = slide.bullets ?? [];
  s.addText(
    bullets.map((b) => ({ text: b, options: { bullet: { code: "25CF" }, color: BLACK } })),
    {
      x: 0.7,
      y: 1.6,
      w: 12,
      h: 5.3,
      fontSize: 22,
      fontFace: "Calibri",
      paraSpaceAfter: 12,
    },
  );
}

function addImageText(s: PptxSlide, slide: SlideSchema) {
  if (slide.image) {
    s.addImage({ path: slide.image, x: 0, y: 0, w: 6.67, h: 7.5 });
  } else {
    s.addShape("rect", { x: 0, y: 0, w: 6.67, h: 7.5, fill: { color: "EBEBEB" }, line: { color: "EBEBEB" } });
    s.addText("[ 图片占位 ]", {
      x: 0,
      y: 3.5,
      w: 6.67,
      h: 0.5,
      fontSize: 16,
      color: GREY_700,
      align: "center",
      fontFace: "Calibri",
    });
  }
  s.addShape("rect", { x: 7, y: 1.4, w: 0.08, h: 0.8, fill: { color: BLUE_500 }, line: { color: BLUE_500 } });
  s.addText(slide.title, {
    x: 7.2,
    y: 1.3,
    w: 5.8,
    h: 1,
    fontSize: 28,
    bold: true,
    color: BLACK,
    fontFace: "Calibri",
  });
  const bullets = slide.bullets ?? [];
  s.addText(
    bullets.map((b) => ({ text: b, options: { bullet: { code: "25CF" }, color: BLACK } })),
    {
      x: 7.2,
      y: 2.6,
      w: 5.8,
      h: 4.5,
      fontSize: 18,
      fontFace: "Calibri",
      paraSpaceAfter: 8,
    },
  );
}

function addTwoCol(s: PptxSlide, slide: SlideSchema) {
  s.addShape("rect", { x: 0.5, y: 0.55, w: 0.18, h: 0.6, fill: { color: BLUE_500 }, line: { color: BLUE_500 } });
  s.addText(slide.title, {
    x: 0.85,
    y: 0.4,
    w: 11.5,
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: BLACK,
    fontFace: "Calibri",
  });
  s.addShape("line", {
    x: 0.5,
    y: 1.3,
    w: 12.33,
    h: 0,
    line: { color: BLUE_500, width: 2 },
  });
  const bullets = slide.bullets ?? [];
  const half = Math.ceil(bullets.length / 2);
  const left = bullets.slice(0, half);
  const right = bullets.slice(half);

  for (const [bullets, x] of [[left, 0.7], [right, 6.85]] as const) {
    s.addText(
      bullets.map((b) => ({ text: b, options: { bullet: { code: "25CF" }, color: BLACK } })),
      {
        x,
        y: 1.6,
        w: 6,
        h: 5.3,
        fontSize: 18,
        fontFace: "Calibri",
        paraSpaceAfter: 8,
      },
    );
  }
}
