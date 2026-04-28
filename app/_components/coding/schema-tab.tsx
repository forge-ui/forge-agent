import { useState } from "react";
import {
  AltArrowDownLinear,
  AltArrowRightLinear,
  DatabaseLinear,
  KeyMinimalisticBoldDuotone,
  LayersMinimalisticLinear,
  LinkBoldDuotone,
} from "solar-icon-set";
import type { DatabaseSchema, TableSchema } from "@/app/_mock/report-artifact";
import { formatNumber } from "./helpers";

export function SchemaTab({ database }: { database: DatabaseSchema }) {
  const [openTable, setOpenTable] = useState<string | null>(database.tables[0]?.name ?? null);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-fg-grey-200 bg-fg-grey-50 px-4 py-2 text-xs text-fg-grey-700">
        <div className="flex items-center gap-2">
          <DatabaseLinear size={13} color="currentColor" />
          <span className="font-mono font-semibold text-fg-grey-900">
            {database.database}.{database.schema}
          </span>
          <span>·</span>
          <span>{database.tables.length} 张表</span>
        </div>
        <span className="font-mono">postgresql 16.2</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          {database.tables.map((t) => (
            <SchemaTableNode
              key={t.name}
              table={t}
              open={openTable === t.name}
              onToggle={() => setOpenTable(openTable === t.name ? null : t.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SchemaTableNode({
  table,
  open,
  onToggle,
}: {
  table: TableSchema;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-fg-grey-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-fg-grey-50"
      >
        <div className="flex items-center gap-2 min-w-0">
          {open ? (
            <AltArrowDownLinear size={13} color="#71717A" />
          ) : (
            <AltArrowRightLinear size={13} color="#71717A" />
          )}
          <LayersMinimalisticLinear size={14} color="#7C3AED" />
          <span className="font-mono text-sm font-semibold text-fg-black">{table.name}</span>
          {table.comment && (
            <span className="truncate text-xs text-fg-grey-700">— {table.comment}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-fg-grey-700">
          <span>{table.columns.length} 列</span>
          <span>·</span>
          <span>{formatNumber(table.rowCount)} 行</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-fg-grey-200 bg-fg-grey-50">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-fg-grey-700">
                <th className="px-3 py-1.5"></th>
                <th className="px-3 py-1.5">字段</th>
                <th className="px-3 py-1.5">类型</th>
                <th className="px-3 py-1.5">样例</th>
                <th className="px-3 py-1.5">备注</th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((c) => (
                <tr key={c.name} className="border-t border-fg-grey-200 hover:bg-white">
                  <td className="px-3 py-1.5">
                    {c.isPK && (
                      <span title="Primary Key">
                        <KeyMinimalisticBoldDuotone size={12} color="#D97706" />
                      </span>
                    )}
                    {c.isFK && (
                      <span title={`FK → ${c.references?.table}.${c.references?.column}`}>
                        <LinkBoldDuotone size={12} color="#0EA5E9" />
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 font-mono font-semibold text-fg-black">{c.name}</td>
                  <td className="px-3 py-1.5">
                    <span className="rounded bg-fg-grey-100 px-1.5 py-0.5 font-mono text-[10px] uppercase text-fg-grey-900">
                      {c.type}
                    </span>
                    {!c.nullable && (
                      <span className="ml-1 text-[10px] font-semibold text-rose-600">NOT NULL</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 font-mono text-fg-grey-700">
                    {c.sample != null ? String(c.sample) : <span className="text-fg-grey-300">—</span>}
                  </td>
                  <td className="px-3 py-1.5 text-fg-grey-700">{c.comment ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
