// ERP 销售报表 Agent — mock 数据
// 场景：销售订单分析，三版本演化

export type ArtifactTab = "sql" | "result" | "report" | "schema";

// ---------------------------------------------------------------
// Schema
// ---------------------------------------------------------------

export type ColumnType =
  | "int"
  | "bigint"
  | "decimal"
  | "varchar"
  | "text"
  | "date"
  | "timestamp"
  | "bool";

export type TableColumn = {
  name: string;
  type: ColumnType;
  nullable: boolean;
  comment?: string;
  sample?: string | number;
  isPK?: boolean;
  isFK?: boolean;
  references?: { table: string; column: string };
};

export type TableSchema = {
  name: string;
  comment?: string;
  rowCount: number;
  columns: TableColumn[];
};

export type DatabaseSchema = {
  database: string;
  schema: string;
  tables: TableSchema[];
};

// ---------------------------------------------------------------
// Result (执行 SQL 后的结果)
// ---------------------------------------------------------------

export type ResultColumn = {
  key: string;
  label: string;
  type: "string" | "number" | "money" | "date" | "category";
};

export type ResultRow = Record<string, string | number | null>;

export type QueryResult = {
  columns: ResultColumn[];
  rows: ResultRow[];
  rowCount: number;
  queryMs: number;
  scannedRows: number;
  warnings?: string[];
};

// ---------------------------------------------------------------
// Chart
// ---------------------------------------------------------------

export type ChartType = "bar" | "line" | "pie" | "area";

export type ChartSpec = {
  type: ChartType;
  title: string;
  xField: string;
  yField: string;
  groupField?: string;
  colorTheme?: "violet" | "indigo" | "mixed";
};

// ---------------------------------------------------------------
// Report blocks
// ---------------------------------------------------------------

export type KpiBlock = {
  type: "kpi";
  id: string;
  items: { label: string; value: string; delta?: string; trend?: "up" | "down" | "flat" }[];
};

export type HeadingBlock = {
  type: "heading";
  id: string;
  level: 1 | 2 | 3;
  text: string;
};

export type ChartBlock = {
  type: "chart";
  id: string;
  spec: ChartSpec;
  data: ResultRow[];
};

export type TableBlock = {
  type: "table";
  id: string;
  caption?: string;
  columns: ResultColumn[];
  rows: ResultRow[];
  maxRows?: number;
};

export type MarkdownBlock = {
  type: "markdown";
  id: string;
  content: string;
};

export type ReportBlock = KpiBlock | HeadingBlock | ChartBlock | TableBlock | MarkdownBlock;

// ---------------------------------------------------------------
// Artifact
// ---------------------------------------------------------------

export type ReportVersion = {
  id: string;
  label: string;
  summary: string;
  createdAt: string;
  sql: string;
  result: QueryResult;
  report: ReportBlock[];
};

export type ReportArtifact = {
  id: string;
  title: string;
  status: "ready" | "running" | "error";
  database: DatabaseSchema;
  versions: ReportVersion[];
  activeVersionId: string;
};

export type ReportMessage =
  | { role: "user"; id: string; content: string; time: string }
  | {
      role: "assistant";
      id: string;
      content: string;
      artifactId?: string;
      time: string;
      steps?: AssistantStep[];
      followUps?: string[];
      latency?: string;
    };

export type AssistantStep = {
  id: string;
  kind:
    | "understanding"
    | "schema_explore"
    | "sql_draft"
    | "executing"
    | "analyzing"
    | "chart_suggest"
    | "narrative";
  title: string;
  summary: string;
  status: "ok" | "running" | "fail";
  detail?: string;
};

// ---------------------------------------------------------------
// Schema mock — ERP 销售模块
// ---------------------------------------------------------------

const erpSchema: DatabaseSchema = {
  database: "erp_prod",
  schema: "sales",
  tables: [
    {
      name: "sales_orders",
      comment: "销售订单主表",
      rowCount: 142_385,
      columns: [
        { name: "id", type: "bigint", nullable: false, isPK: true, sample: 1024381, comment: "订单 ID" },
        { name: "order_no", type: "varchar", nullable: false, sample: "SO-2026-04-21-008", comment: "订单号" },
        { name: "customer_id", type: "bigint", nullable: false, isFK: true, references: { table: "customers", column: "id" }, sample: 8821 },
        { name: "region", type: "varchar", nullable: false, sample: "华东", comment: "销售大区" },
        { name: "amount", type: "decimal", nullable: false, sample: 128_900, comment: "订单金额" },
        { name: "quantity", type: "int", nullable: false, sample: 24 },
        { name: "status", type: "varchar", nullable: false, sample: "shipped", comment: "draft/confirmed/shipped/delivered/canceled" },
        { name: "owner_id", type: "bigint", nullable: false, isFK: true, references: { table: "employees", column: "id" }, sample: 318, comment: "归属销售" },
        { name: "created_at", type: "timestamp", nullable: false, sample: "2026-04-21 14:32:08" },
        { name: "delivered_at", type: "timestamp", nullable: true, sample: "2026-04-23 10:08:51" },
      ],
    },
    {
      name: "customers",
      comment: "客户主数据",
      rowCount: 4_812,
      columns: [
        { name: "id", type: "bigint", nullable: false, isPK: true, sample: 8821 },
        { name: "name", type: "varchar", nullable: false, sample: "杭州极智科技有限公司" },
        { name: "level", type: "varchar", nullable: false, sample: "A", comment: "S/A/B/C 客户等级" },
        { name: "region", type: "varchar", nullable: false, sample: "华东" },
        { name: "industry", type: "varchar", nullable: false, sample: "消费电子" },
        { name: "credit_limit", type: "decimal", nullable: false, sample: 5_000_000 },
        { name: "created_at", type: "timestamp", nullable: false, sample: "2024-09-12 10:21:33" },
      ],
    },
    {
      name: "products",
      comment: "产品/物料",
      rowCount: 3_204,
      columns: [
        { name: "id", type: "bigint", nullable: false, isPK: true, sample: 5021 },
        { name: "sku", type: "varchar", nullable: false, sample: "PRD-AX08-V2" },
        { name: "name", type: "varchar", nullable: false, sample: "AX08 控制器 V2" },
        { name: "category", type: "varchar", nullable: false, sample: "工业控制" },
        { name: "list_price", type: "decimal", nullable: false, sample: 4_280 },
      ],
    },
    {
      name: "order_lines",
      comment: "订单行",
      rowCount: 528_104,
      columns: [
        { name: "id", type: "bigint", nullable: false, isPK: true },
        { name: "order_id", type: "bigint", nullable: false, isFK: true, references: { table: "sales_orders", column: "id" } },
        { name: "product_id", type: "bigint", nullable: false, isFK: true, references: { table: "products", column: "id" } },
        { name: "quantity", type: "int", nullable: false, sample: 8 },
        { name: "unit_price", type: "decimal", nullable: false, sample: 4_280 },
        { name: "subtotal", type: "decimal", nullable: false, sample: 34_240 },
      ],
    },
    {
      name: "employees",
      comment: "员工/销售",
      rowCount: 612,
      columns: [
        { name: "id", type: "bigint", nullable: false, isPK: true },
        { name: "name", type: "varchar", nullable: false, sample: "刘星" },
        { name: "department", type: "varchar", nullable: false, sample: "销售一部" },
        { name: "region", type: "varchar", nullable: false, sample: "华东" },
      ],
    },
  ],
};

// ---------------------------------------------------------------
// V1 — 最近 7 天销售订单 top 10 客户
// ---------------------------------------------------------------

const v1Sql = `-- 最近 7 天销售订单 top 10 客户
SELECT
  c.name              AS customer_name,
  c.level             AS level,
  c.region            AS region,
  COUNT(o.id)         AS order_count,
  SUM(o.amount)       AS total_amount,
  AVG(o.amount)::int  AS avg_order_amount
FROM sales.sales_orders o
JOIN sales.customers   c ON c.id = o.customer_id
WHERE o.status   IN ('confirmed', 'shipped', 'delivered')
  AND o.created_at >= NOW() - INTERVAL '7 days'
GROUP BY c.name, c.level, c.region
ORDER BY total_amount DESC
LIMIT 10;`;

const v1Rows: ResultRow[] = [
  { customer_name: "杭州极智科技有限公司", level: "S", region: "华东", order_count: 38, total_amount: 4_829_400, avg_order_amount: 127_089 },
  { customer_name: "深圳锐凡电子股份",      level: "A", region: "华南", order_count: 41, total_amount: 4_512_800, avg_order_amount: 110_068 },
  { customer_name: "苏州凯昇精密",         level: "S", region: "华东", order_count: 29, total_amount: 3_984_200, avg_order_amount: 137_386 },
  { customer_name: "广州启航贸易",         level: "A", region: "华南", order_count: 33, total_amount: 3_421_900, avg_order_amount: 103_694 },
  { customer_name: "北京云途智能",         level: "A", region: "华北", order_count: 24, total_amount: 3_184_500, avg_order_amount: 132_687 },
  { customer_name: "成都赛博机电",         level: "B", region: "西南", order_count: 27, total_amount: 2_897_300, avg_order_amount: 107_307 },
  { customer_name: "上海星河自动化",       level: "S", region: "华东", order_count: 19, total_amount: 2_812_400, avg_order_amount: 148_021 },
  { customer_name: "武汉联创工控",         level: "B", region: "华中", order_count: 22, total_amount: 2_408_900, avg_order_amount: 109_495 },
  { customer_name: "西安鼎盛半导体",       level: "A", region: "西北", order_count: 18, total_amount: 2_104_700, avg_order_amount: 116_927 },
  { customer_name: "宁波四海传感",         level: "B", region: "华东", order_count: 26, total_amount: 1_983_500, avg_order_amount: 76_288 },
];

const v1Columns: ResultColumn[] = [
  { key: "customer_name",    label: "客户",       type: "string" },
  { key: "level",            label: "等级",       type: "category" },
  { key: "region",           label: "区域",       type: "category" },
  { key: "order_count",      label: "订单数",     type: "number" },
  { key: "total_amount",     label: "销售总额",   type: "money" },
  { key: "avg_order_amount", label: "客单价",     type: "money" },
];

// ---------------------------------------------------------------
// V2 — + 按区域拆分 + 每日趋势
// ---------------------------------------------------------------

const v2Sql = `-- 最近 7 天，按区域拆分 + 每日趋势
SELECT
  DATE(o.created_at)  AS day,
  o.region            AS region,
  COUNT(o.id)         AS order_count,
  SUM(o.amount)       AS total_amount
FROM sales.sales_orders o
WHERE o.status     IN ('confirmed', 'shipped', 'delivered')
  AND o.created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(o.created_at), o.region
ORDER BY day ASC, total_amount DESC;`;

// 7 天 × 6 区域 = 42 行，金额单位：万元
const regions = ["华东", "华南", "华北", "华中", "西南", "西北"];
const days = ["04-21", "04-22", "04-23", "04-24", "04-25", "04-26", "04-27"];
const baseByRegion: Record<string, number> = {
  华东: 380, 华南: 320, 华北: 240, 华中: 180, 西南: 165, 西北: 110,
};

const v2Rows: ResultRow[] = [];
days.forEach((day, di) => {
  regions.forEach((region) => {
    const base = baseByRegion[region];
    const wave = Math.sin((di + region.charCodeAt(0)) * 0.6) * 35;
    const trend = di * 7;
    const amountWan = Math.round(base + wave + trend);
    const orderCount = Math.max(3, Math.round(amountWan / 11 + (di % 3)));
    v2Rows.push({
      day,
      region,
      order_count: orderCount,
      total_amount: amountWan * 10_000,
    });
  });
});

const v2Columns: ResultColumn[] = [
  { key: "day",          label: "日期",     type: "date" },
  { key: "region",       label: "区域",     type: "category" },
  { key: "order_count",  label: "订单数",   type: "number" },
  { key: "total_amount", label: "销售额",   type: "money" },
];

// 区域汇总（饼图用）
const v2RegionSummary: ResultRow[] = regions.map((region) => {
  const total = v2Rows
    .filter((r) => r.region === region)
    .reduce((sum, r) => sum + (r.total_amount as number), 0);
  return { region, total_amount: total };
});

// ---------------------------------------------------------------
// V3 — 完整销售日报
// ---------------------------------------------------------------

const v3Sql = `-- 销售日报 (2026-04-27)
-- 1) KPI 汇总
WITH today AS (
  SELECT * FROM sales.sales_orders
   WHERE DATE(created_at) = CURRENT_DATE
     AND status IN ('confirmed','shipped','delivered')
), yesterday AS (
  SELECT * FROM sales.sales_orders
   WHERE DATE(created_at) = CURRENT_DATE - 1
     AND status IN ('confirmed','shipped','delivered')
)
SELECT
  (SELECT SUM(amount)         FROM today)     AS today_amount,
  (SELECT COUNT(*)            FROM today)     AS today_orders,
  (SELECT COUNT(DISTINCT customer_id) FROM today) AS today_customers,
  (SELECT AVG(amount)::int    FROM today)     AS today_aov,
  (SELECT SUM(amount)         FROM yesterday) AS yest_amount;

-- 2) 7 天每日 + 每区趋势 (折线)
-- 3) 区域分布 (饼图)
-- 4) 当日 top 10 客户 (表)`;

// 当日 top 客户
const v3TopCustomerRows: ResultRow[] = v1Rows.slice(0, 8).map((r, i) => ({
  rank: i + 1,
  customer_name: r.customer_name,
  region: r.region,
  amount: Math.round((r.total_amount as number) / 7 + (i % 3) * 18_000),
  orders: Math.max(2, Math.round((r.order_count as number) / 7)),
}));

const v3TopCustomerColumns: ResultColumn[] = [
  { key: "rank",          label: "#",       type: "number" },
  { key: "customer_name", label: "客户",    type: "string" },
  { key: "region",        label: "区域",    type: "category" },
  { key: "amount",        label: "今日销售额", type: "money" },
  { key: "orders",        label: "今日订单数", type: "number" },
];

// 7 天趋势（每日总额，折线用）
const v3TrendRows: ResultRow[] = days.map((day) => {
  const dayRows = v2Rows.filter((r) => r.day === day);
  const total = dayRows.reduce((sum, r) => sum + (r.total_amount as number), 0);
  return { day, total_amount: total };
});

// ---------------------------------------------------------------
// Artifact 组装
// ---------------------------------------------------------------

export const reportArtifact: ReportArtifact = {
  id: "rpt-1",
  title: "销售订单分析",
  status: "ready",
  database: erpSchema,
  activeVersionId: "v3",
  versions: [
    {
      id: "v1",
      label: "v1",
      summary: "最近 7 天 top 10 客户",
      createdAt: "14:21",
      sql: v1Sql,
      result: {
        columns: v1Columns,
        rows: v1Rows,
        rowCount: v1Rows.length,
        queryMs: 142,
        scannedRows: 142_385,
      },
      report: [
        { type: "heading", id: "h1", level: 2, text: "最近 7 天 Top 10 客户" },
        {
          type: "chart",
          id: "c1",
          spec: { type: "bar", title: "销售总额（元）", xField: "customer_name", yField: "total_amount", colorTheme: "violet" },
          data: v1Rows,
        },
        {
          type: "table",
          id: "t1",
          caption: "明细",
          columns: v1Columns,
          rows: v1Rows,
        },
      ],
    },
    {
      id: "v2",
      label: "v2",
      summary: "+ 区域拆分 + 每日趋势",
      createdAt: "14:24",
      sql: v2Sql,
      result: {
        columns: v2Columns,
        rows: v2Rows,
        rowCount: v2Rows.length,
        queryMs: 218,
        scannedRows: 142_385,
      },
      report: [
        { type: "heading", id: "h1", level: 2, text: "近 7 天 · 区域拆分" },
        {
          type: "chart",
          id: "c1",
          spec: { type: "line", title: "每日销售额（按区域）", xField: "day", yField: "total_amount", groupField: "region", colorTheme: "mixed" },
          data: v2Rows,
        },
        {
          type: "chart",
          id: "c2",
          spec: { type: "pie", title: "7 天销售额区域占比", xField: "region", yField: "total_amount", colorTheme: "mixed" },
          data: v2RegionSummary,
        },
        {
          type: "table",
          id: "t1",
          caption: "明细（前 12 行）",
          columns: v2Columns,
          rows: v2Rows.slice(0, 12),
          maxRows: 12,
        },
      ],
    },
    {
      id: "v3",
      label: "v3",
      summary: "拼成销售日报",
      createdAt: "14:28",
      sql: v3Sql,
      result: {
        columns: v3TopCustomerColumns,
        rows: v3TopCustomerRows,
        rowCount: v3TopCustomerRows.length,
        queryMs: 386,
        scannedRows: 284_770,
      },
      report: [
        { type: "heading", id: "h0", level: 1, text: "销售日报 · 2026-04-27" },
        {
          type: "kpi",
          id: "k1",
          items: [
            { label: "今日销售额",   value: "¥ 384.2 万", delta: "+12.4%", trend: "up" },
            { label: "今日订单数",   value: "318",        delta: "+24",    trend: "up" },
            { label: "活跃客户",     value: "147",        delta: "+8",     trend: "up" },
            { label: "客单价",       value: "¥ 12,082",   delta: "-3.1%",  trend: "down" },
          ],
        },
        { type: "heading", id: "h1", level: 2, text: "近 7 天销售趋势" },
        {
          type: "chart",
          id: "c1",
          spec: { type: "area", title: "每日销售额合计", xField: "day", yField: "total_amount", colorTheme: "violet" },
          data: v3TrendRows,
        },
        { type: "heading", id: "h2", level: 2, text: "区域分布" },
        {
          type: "chart",
          id: "c2",
          spec: { type: "pie", title: "7 天销售额区域占比", xField: "region", yField: "total_amount", colorTheme: "mixed" },
          data: v2RegionSummary,
        },
        { type: "heading", id: "h3", level: 2, text: "今日 Top 8 客户" },
        {
          type: "table",
          id: "t1",
          columns: v3TopCustomerColumns,
          rows: v3TopCustomerRows,
        },
        {
          type: "markdown",
          id: "m1",
          content:
            "**洞察**\n\n" +
            "- 今日销售额 **¥ 384.2 万**，环比 **+12.4%**，连续第 3 天上涨\n" +
            "- 华东大区贡献 **38%** 销售额，仍为头部市场\n" +
            "- 客单价同比下降 3.1%，需关注是否由小单驱动增长\n" +
            "- **杭州极智科技** 今日下单 ¥ 71 万，同比翻倍，建议销售跟进续单",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------
// 聊天消息（带 step 序列）
// ---------------------------------------------------------------

export const reportMessages: ReportMessage[] = [
  {
    role: "user",
    id: "u1",
    content: "看一下最近 7 天销售订单的 top 10 客户。",
    time: "14:20",
  },
  {
    role: "assistant",
    id: "a1",
    content:
      "找到了 7 天内 top 10 客户，**杭州极智科技 ¥482 万** 排第一。已生成柱状图和明细表，看右侧报表 tab。",
    artifactId: "rpt-1",
    time: "14:21",
    steps: [
      { id: "s1", kind: "understanding", title: "理解需求", summary: "近 7 天 / 销售订单 / top 10 客户 / 按销售额降序", status: "ok" },
      { id: "s2", kind: "schema_explore", title: "查找数据表", summary: "sales_orders + customers，需要 JOIN", status: "ok" },
      { id: "s3", kind: "sql_draft", title: "生成 SQL", summary: "JOIN + GROUP BY + LIMIT 10", status: "ok" },
      { id: "s4", kind: "executing", title: "执行查询", summary: "扫描 142,385 行 · 142 ms", status: "ok" },
      { id: "s5", kind: "analyzing", title: "分析结果", summary: "10 行 · 总销售 ¥3,213 万 · 头部 3 家占 41%", status: "ok" },
      { id: "s6", kind: "chart_suggest", title: "推荐图表", summary: "客户排名场景 → 柱状图最直观", status: "ok" },
    ],
    latency: "142 ms",
  },
  {
    role: "user",
    id: "u2",
    content: "按区域拆一下，再看每天趋势。",
    time: "14:23",
  },
  {
    role: "assistant",
    id: "a2",
    content:
      "已加上 `region` 维度和按天 `GROUP BY`，新增折线图（按区域）+ 区域占比饼图。**华东** 占比最高 38%。",
    artifactId: "rpt-1",
    time: "14:24",
    steps: [
      { id: "s1", kind: "sql_draft", title: "改写 SQL", summary: "去掉 LIMIT，加 DATE() + region 双维度 GROUP BY", status: "ok" },
      { id: "s2", kind: "executing", title: "执行查询", summary: "42 行 · 218 ms", status: "ok" },
      { id: "s3", kind: "chart_suggest", title: "推荐图表", summary: "时间趋势 + 分组 → 分组折线 + 占比饼图", status: "ok" },
    ],
    latency: "218 ms",
  },
  {
    role: "user",
    id: "u3",
    content: "拼一份完整的销售日报，KPI + 趋势图 + Top 客户 + 解读。",
    time: "14:27",
  },
  {
    role: "assistant",
    id: "a3",
    content:
      "完整销售日报 ✓ — 4 个 KPI（销售额 / 订单数 / 活跃客户 / 客单价）+ 趋势 area 图 + 区域饼图 + Top 8 客户表 + AI 写的洞察段落，看右侧报表 tab。",
    artifactId: "rpt-1",
    time: "14:28",
    steps: [
      { id: "s1", kind: "understanding", title: "拆解日报结构", summary: "4 KPI + 趋势 + 区域 + top 客户 + 洞察", status: "ok" },
      { id: "s2", kind: "sql_draft", title: "组合多查询", summary: "WITH today / yesterday + 趋势 + topN 三段", status: "ok" },
      { id: "s3", kind: "executing", title: "执行查询", summary: "扫描 284,770 行 · 386 ms", status: "ok" },
      { id: "s4", kind: "narrative", title: "生成洞察", summary: "环比 +12.4% / 华东占 38% / 客单价下滑预警", status: "ok" },
    ],
    latency: "386 ms",
    followUps: [
      "客单价为什么下滑？拉一下分品类看看",
      "把这份日报存成定时任务，每天早上 8 点跑",
      "导出 Excel，按区域+渠道两级分组",
    ],
  },
];
