import { CopyLinear, DocumentTextLinear, PlayCircleBold } from "solar-icon-set";
import type { ReportVersion } from "@/app/_mock/report-artifact";
import { formatNumber, highlightSql } from "./helpers";

export function SqlTab({ version }: { version: ReportVersion }) {
  const lines = version.sql.split("\n");
  return (
    <div className="flex h-full flex-col">
      {/* SQL toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-fg-grey-200 bg-fg-grey-50 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-fg-grey-700">
          <span className="font-mono font-semibold text-fg-grey-900">query.sql</span>
          <span className="rounded bg-fg-grey-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-fg-grey-900">
            postgresql
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 rounded border border-fg-grey-200 bg-white px-2.5 py-1 text-xs font-medium hover:border-fg-grey-400">
            <DocumentTextLinear size={12} color="currentColor" />
            格式化
          </button>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(version.sql)}
            className="flex items-center gap-1 rounded border border-fg-grey-200 bg-white px-2.5 py-1 text-xs font-medium hover:border-fg-grey-400"
          >
            <CopyLinear size={12} color="currentColor" />
            复制
          </button>
          <button className="flex items-center gap-1 rounded bg-fg-violet px-3 py-1 text-xs font-semibold text-white hover:bg-violet-700">
            <PlayCircleBold size={12} color="#fff" />
            执行
          </button>
        </div>
      </div>

      {/* SQL body */}
      <div className="flex flex-1 overflow-auto bg-white font-mono text-[13px] leading-6">
        <div className="select-none border-r border-fg-grey-200 px-3 py-3 text-right text-fg-grey-500">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 px-4 py-3 text-fg-grey-900">
          <code dangerouslySetInnerHTML={{ __html: highlightSql(version.sql) }} />
        </pre>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between gap-4 border-t border-fg-grey-200 bg-fg-grey-50 px-4 py-2 text-xs text-fg-grey-700">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            执行成功
          </span>
          <span>·</span>
          <span>{version.result.rowCount} 行</span>
          <span>·</span>
          <span>{version.result.queryMs} ms</span>
          <span>·</span>
          <span>扫描 {formatNumber(version.result.scannedRows)} 行</span>
        </div>
        <span className="text-fg-grey-500">{version.createdAt}</span>
      </div>
    </div>
  );
}
