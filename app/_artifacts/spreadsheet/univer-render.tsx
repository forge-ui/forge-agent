"use client";

/**
 * Heavy Univer Sheets renderer. Loaded only after explicit user action.
 */

import { useEffect, useRef } from "react";
import {
  LocaleType,
  Univer,
  createUniver,
  defaultTheme,
  mergeLocales,
} from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import sheetsCoreEnUS from "@univerjs/preset-sheets-core/locales/en-US";
import "@univerjs/preset-sheets-core/lib/index.css";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

export default function UniverRender({ payload }: ArtifactRenderProps<"spreadsheet">) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const univerRef = useRef<Univer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;

    const { univer, univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(sheetsCoreEnUS),
      },
      theme: defaultTheme,
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
        }),
      ],
    });

    univerRef.current = univer;

    // 创建 workbook：用 payload.univerSnapshot 还原，没有就建空白
    const snapshot = (payload.univerSnapshot as Record<string, unknown> | null) ?? undefined;
    if (snapshot) {
      univerAPI.createWorkbook(snapshot as never);
    } else {
      univerAPI.createWorkbook({
        id: "wb-empty",
        sheetOrder: ["sheet-1"],
        sheets: {
          "sheet-1": {
            id: "sheet-1",
            name: "Sheet1",
            rowCount: 100,
            columnCount: 26,
          },
        },
      } as never);
    }

    return () => {
      if (disposed) return;
      disposed = true;
      try {
        univerRef.current?.dispose();
      } finally {
        univerRef.current = null;
      }
    };
    // payload 变化由 ArtifactPanel instance key 处理（remount → 新建 univer），
    // 所以这里依赖故意只有 [] 不放 payload，避免重复初始化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-fg-grey-200 bg-fg-grey-50 px-4 py-2 text-xs text-fg-grey-700">
        <span className="font-mono font-semibold text-fg-grey-900">workbook.xlsx</span>
        <span className="rounded bg-fg-grey-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-fg-grey-900">
          Univer Sheets
        </span>
      </div>
      <div ref={containerRef} className="flex-1 overflow-hidden bg-fg-white" />
    </div>
  );
}
