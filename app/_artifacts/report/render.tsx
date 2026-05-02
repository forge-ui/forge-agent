"use client";

/**
 * Report artifact Render — 包装现有 4 个 tab（SQL / 结果 / 报表 / Schema）
 * 让现有 ReportArtifact mock 数据走新的 ArtifactRegistry 通道。
 */

import { useState } from "react";
import {
  CodeLinear,
  DatabaseLinear,
  DocumentTextLinear,
  LayersMinimalisticLinear,
} from "solar-icon-set";
import { ReportTab } from "@/app/_components/coding/report-tab";
import { ResultTab } from "@/app/_components/coding/result-tab";
import { SchemaTab } from "@/app/_components/coding/schema-tab";
import { SqlTab } from "@/app/_components/coding/sql-tab";
import type {
  ArtifactRenderProps,
  ReportArtifactTab,
} from "@/app/_artifacts/types";

type TabDef = {
  id: ReportArtifactTab;
  label: string;
  icon: React.ReactNode;
};

const TABS: TabDef[] = [
  { id: "sql", label: "SQL", icon: <CodeLinear size={14} color="currentColor" /> },
  { id: "result", label: "结果", icon: <LayersMinimalisticLinear size={14} color="currentColor" /> },
  { id: "report", label: "报表", icon: <DocumentTextLinear size={14} color="currentColor" /> },
  { id: "schema", label: "Schema", icon: <DatabaseLinear size={14} color="currentColor" /> },
];

export default function ReportRender({ payload }: ArtifactRenderProps<"report">) {
  const [activeTab, setActiveTab] = useState<ReportArtifactTab>(payload.activeView ?? "report");

  // 复用 SqlTab 接受的 ReportVersion 形状（兼容老 tab 组件）
  const versionLike = {
    sql: payload.sql ?? "",
    result: payload.result ?? {
      columns: [],
      rows: [],
      rowCount: 0,
      queryMs: 0,
      scannedRows: 0,
    },
  };

  return (
    <div className="flex h-full flex-col">
      <nav className="flex items-center gap-1 border-b border-fg-grey-200 px-3">
        {TABS.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={
                isActive
                  ? "-mb-px flex items-center gap-1.5 border-b-2 border-fg-blue-500 px-3 py-2.5 text-sm font-semibold text-fg-blue-500"
                  : "-mb-px flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-fg-grey-700 transition hover:text-fg-black"
              }
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </nav>
      <div className="flex-1 overflow-hidden">
        {activeTab === "sql" && payload.sql && (
          <SqlTab version={versionLike as never} />
        )}
        {activeTab === "result" && payload.result && (
          <ResultTab result={payload.result as never} />
        )}
        {activeTab === "report" && (
          <ReportTab blocks={payload.blocks as never} />
        )}
        {activeTab === "schema" && payload.database && (
          <SchemaTab database={payload.database as never} />
        )}
      </div>
    </div>
  );
}
