import { useMemo, useState } from "react";
import { MagniferLinear } from "solar-icon-set";
import type { QueryResult, ResultColumn } from "@/app/_mock/report-artifact";
import { formatMoney, formatNumber } from "./helpers";

export function ResultTab({ result }: { result: QueryResult }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string | null; dir: "asc" | "desc" }>({ key: null, dir: "asc" });
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    let r = result.rows;
    if (query) {
      const q = query.toLowerCase();
      r = r.filter((row) =>
        Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(q)),
      );
    }
    if (sort.key) {
      r = [...r].sort((a, b) => {
        const av = a[sort.key!];
        const bv = b[sort.key!];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (av < bv) return sort.dir === "asc" ? -1 : 1;
        if (av > bv) return sort.dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return r;
  }, [result.rows, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function toggleSort(key: string) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  function exportCsv() {
    const header = result.columns.map((c) => c.label).join(",");
    const body = filtered
      .map((r) => result.columns.map((c) => String(r[c.key] ?? "")).join(","))
      .join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "result.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-fg-grey-200 bg-fg-grey-50 px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-fg-black">查询结果</span>
          <span className="text-xs text-fg-grey-700">
            {filtered.length} 行 · {result.columns.length} 列 · {result.queryMs} ms
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-fg-grey-200 bg-white px-2 py-1">
            <MagniferLinear size={13} color="#71717A" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="搜索行..."
              className="w-32 bg-transparent text-xs focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg border border-fg-grey-200 bg-white px-2.5 py-1 text-xs font-medium hover:border-fg-grey-400"
          >
            导出 CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-fg-grey-50">
            <tr className="border-b border-fg-grey-200">
              {result.columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className="cursor-pointer select-none px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-fg-grey-700 hover:text-fg-violet"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{c.label}</span>
                    <ColumnTypeBadge type={c.type} />
                    {sort.key === c.key ? (
                      <span className="text-fg-violet">{sort.dir === "asc" ? "↑" : "↓"}</span>
                    ) : (
                      <span className="text-fg-grey-300">↕</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, ri) => (
              <tr key={ri} className="border-b border-fg-grey-100 hover:bg-fg-grey-50">
                {result.columns.map((c) => (
                  <td key={c.key} className="px-4 py-2.5 text-fg-black">
                    {renderResultCell(c, r[c.key])}
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={result.columns.length}
                  className="px-4 py-12 text-center text-sm text-fg-grey-500"
                >
                  没有匹配的行
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-fg-grey-200 bg-fg-grey-50 px-4 py-2 text-xs text-fg-grey-700">
          <span>
            第 {safePage * PAGE_SIZE + 1} – {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} 行
            / 共 {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="rounded border border-fg-grey-200 bg-white px-2 py-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              上一页
            </button>
            <span className="px-2">
              {safePage + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage === pageCount - 1}
              className="rounded border border-fg-grey-200 bg-white px-2 py-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ColumnTypeBadge({ type }: { type: ResultColumn["type"] }) {
  const map: Record<ResultColumn["type"], { bg: string; label: string }> = {
    string:   { bg: "bg-fg-grey-100 text-fg-grey-700", label: "abc" },
    number:   { bg: "bg-blue-100 text-blue-700",        label: "123" },
    money:    { bg: "bg-emerald-100 text-emerald-700",  label: "¥" },
    date:     { bg: "bg-amber-100 text-amber-700",      label: "📅" },
    category: { bg: "bg-purple-100 text-fg-violet",     label: "▣" },
  };
  const m = map[type];
  return (
    <span className={`rounded px-1 text-[9px] font-bold ${m.bg}`}>{m.label}</span>
  );
}

export function renderResultCell(col: ResultColumn, value: string | number | null) {
  if (value == null) return <span className="text-fg-grey-300">NULL</span>;
  if (col.type === "money" && typeof value === "number") {
    return <span className="font-mono tabular-nums">{formatMoney(value)}</span>;
  }
  if (col.type === "number" && typeof value === "number") {
    return <span className="font-mono tabular-nums">{formatNumber(value)}</span>;
  }
  if (col.type === "category") {
    return (
      <span className="rounded bg-fg-grey-100 px-2 py-0.5 text-xs font-medium text-fg-grey-900">
        {value}
      </span>
    );
  }
  if (col.type === "date") return <span className="font-mono text-fg-grey-900">{value}</span>;
  return value;
}
