import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Area,
  AreaChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  RoundDoubleAltArrowDownLinear,
  RoundDoubleAltArrowUpLinear,
} from "solar-icon-set";
import type {
  ChartBlock,
  KpiBlock,
  ReportBlock,
  ResultRow,
} from "@/app/_mock/report-artifact";
import { formatAxis, formatMoney, renderMarkdown } from "./helpers";
import { renderResultCell } from "./result-tab";

export function ReportTab({ blocks }: { blocks: ReportBlock[] }) {
  return (
    <div className="h-full overflow-y-auto bg-fg-grey-50">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-1.5 p-1.5">
        {blocks.map((b) => (
          <ReportBlockView key={b.id} block={b} />
        ))}
      </div>
    </div>
  );
}

function ReportBlockView({ block }: { block: ReportBlock }) {
  if (block.type === "heading") {
    if (block.level === 1)
      return (
        <h1 className="font-display text-2xl font-bold text-fg-black">
          {block.text}
        </h1>
      );
    if (block.level === 2)
      return (
        <h2 className="mt-2 font-display text-lg font-semibold text-fg-black">
          {block.text}
        </h2>
      );
    return <h3 className="font-display text-base font-semibold text-fg-grey-900">{block.text}</h3>;
  }
  if (block.type === "kpi") return <KpiRow block={block} />;
  if (block.type === "chart") return <ChartCard block={block} />;
  if (block.type === "table") {
    const rows = block.maxRows ? block.rows.slice(0, block.maxRows) : block.rows;
    return (
      <div className="overflow-hidden rounded-xl border border-fg-grey-200 bg-white">
        {block.caption && (
          <div className="border-b border-fg-grey-200 bg-fg-grey-50 px-4 py-2 text-xs font-semibold text-fg-grey-700">
            {block.caption}
          </div>
        )}
        <table className="w-full text-sm">
          <thead className="bg-fg-grey-50">
            <tr className="border-b border-fg-grey-200">
              {block.columns.map((c) => (
                <th
                  key={c.key}
                  className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-fg-grey-700"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-b border-fg-grey-100 last:border-0">
                {block.columns.map((c) => (
                  <td key={c.key} className="px-4 py-2 text-fg-black">
                    {renderResultCell(c, r[c.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === "markdown") {
    return (
      <div
        className="rounded-xl border border-fg-grey-200 bg-white p-5 text-sm leading-7 text-fg-grey-900"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }}
      />
    );
  }
  return null;
}

function KpiRow({ block }: { block: KpiBlock }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {block.items.map((k, i) => (
        <div
          key={i}
          className="flex flex-col gap-1.5 rounded-xl border border-fg-grey-200 bg-white p-4"
        >
          <span className="text-xs font-medium text-fg-grey-700">{k.label}</span>
          <span className="font-display text-2xl font-bold tabular-nums whitespace-nowrap text-fg-black">
            {k.value}
          </span>
          {k.delta && (
            <span
              className={`flex items-center gap-1 text-xs font-semibold ${
                k.trend === "up"
                  ? "text-fg-green-600"
                  : k.trend === "down"
                  ? "text-fg-red-600"
                  : "text-fg-grey-700"
              }`}
            >
              {k.trend === "up" && <RoundDoubleAltArrowUpLinear size={12} color="currentColor" />}
              {k.trend === "down" && <RoundDoubleAltArrowDownLinear size={12} color="currentColor" />}
              {k.delta}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

const CHART_COLORS = [
  "var(--fg-blue)",
  "var(--fg-cyan)",
  "var(--fg-green)",
  "var(--fg-yellow)",
  "var(--fg-red)",
  "var(--fg-violet)",
  "var(--fg-cyan-700)",
  "var(--fg-blue-700)",
];

function ChartCard({ block }: { block: ChartBlock }) {
  const { spec, data } = block;
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const update = () => {
      setChartSize({ width: el.clientWidth, height: el.clientHeight });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="rounded-xl border border-fg-grey-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-sm font-semibold text-fg-black">{spec.title}</span>
        <ChartTypeBadge type={spec.type} />
      </div>
      <div ref={chartRef} className="h-72 w-full min-w-0">
        {chartSize.width > 0 && chartSize.height > 0 && (
          <>
            {spec.type === "bar" ? (
            <BarChart
              data={data}
              width={chartSize.width}
              height={chartSize.height}
              margin={{ top: 8, right: 12, left: 8, bottom: 32 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--fg-grey-200)" />
              <XAxis
                dataKey={spec.xField}
                tick={{ fontSize: 11, fill: "var(--fg-grey-700)" }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--fg-grey-700)" }} tickFormatter={formatAxis} />
              <Tooltip content={<CustomTooltip yLabel={spec.title} />} />
              <Bar dataKey={spec.yField} radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : spec.type === "line" ? (
            <LineChart
              data={pivotByGroup(data, spec)}
              width={chartSize.width}
              height={chartSize.height}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--fg-grey-200)" />
              <XAxis dataKey={spec.xField} tick={{ fontSize: 11, fill: "var(--fg-grey-700)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--fg-grey-700)" }} tickFormatter={formatAxis} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {groupKeys(data, spec).map((k, i) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          ) : spec.type === "area" ? (
            <AreaChart
              data={data}
              width={chartSize.width}
              height={chartSize.height}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--fg-blue)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--fg-blue)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--fg-grey-200)" />
              <XAxis dataKey={spec.xField} tick={{ fontSize: 11, fill: "var(--fg-grey-700)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--fg-grey-700)" }} tickFormatter={formatAxis} />
              <Tooltip content={<CustomTooltip yLabel={spec.title} />} />
              <Area
                type="monotone"
                dataKey={spec.yField}
                stroke="var(--fg-blue)"
                strokeWidth={2}
                fill="url(#areaFill)"
              />
            </AreaChart>
          ) : (
            <PieChart width={chartSize.width} height={chartSize.height}>
              <Pie
                data={data}
                dataKey={spec.yField}
                nameKey={spec.xField}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                paddingAngle={1}
                label={(p: { name?: string; percent?: number }) =>
                  `${p.name ?? ""} ${p.percent != null ? Math.round(p.percent * 100) : 0}%`
                }
                labelLine={false}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ChartTypeBadge({ type }: { type: ChartBlock["spec"]["type"] }) {
  const map = {
    bar: "柱状图",
    line: "折线图",
    pie: "饼图",
    area: "面积图",
  } as const;
  return (
    <span className="rounded-full bg-fg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-fg-blue-500">
      {map[type]}
    </span>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
  yLabel,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string }>;
  label?: string;
  yLabel?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-fg-grey-200 bg-white px-3 py-2 text-xs shadow-md">
      {label && <div className="mb-1 font-semibold text-fg-black">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: p.color }} />
            <span className="text-fg-grey-700">{p.name ?? yLabel ?? p.dataKey}</span>
          </div>
          <span className="font-mono font-semibold text-fg-black">
            {typeof p.value === "number" ? formatMoney(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// 把分组数据 pivot 成 recharts line 需要的形状: [{day, 华东:xx, 华南:xx, ...}, ...]
function pivotByGroup(rows: ResultRow[], spec: ChartBlock["spec"]) {
  if (!spec.groupField) return rows;
  const map = new Map<string, Record<string, string | number>>();
  for (const row of rows) {
    const x = String(row[spec.xField]);
    const g = String(row[spec.groupField]);
    const y = row[spec.yField] as number;
    if (!map.has(x)) map.set(x, { [spec.xField]: x });
    map.get(x)![g] = y;
  }
  return Array.from(map.values());
}

function groupKeys(rows: ResultRow[], spec: ChartBlock["spec"]) {
  if (!spec.groupField) return [spec.yField];
  const set = new Set<string>();
  rows.forEach((r) => set.add(String(r[spec.groupField!])));
  return Array.from(set);
}
