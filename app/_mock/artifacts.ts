/**
 * 各 App 默认挂载的 mock artifact 集合 + 额外消息引用。
 *
 * 这一层是 ArtifactRegistry 体系的"数据源"——所有 chat 引用的 artifact
 * 都从这里查；接真后端时这一层换成从 store 拉。
 *
 * 当前内容：
 * - coding App：把现有 reportArtifact 适配成 Artifact<"report">；新增 markdown 周报草稿
 * - general App：暂无（普通 chat-thread 不挂 artifact）
 */

import { reportArtifact as legacyReportArtifact } from "./report-artifact";
import type { AnyArtifact, Artifact } from "@/app/_artifacts/types";

// ----------------------------------------------------------------
// 把老的 ReportArtifact 适配成新的 Artifact<"report">
// ----------------------------------------------------------------

function adaptLegacyReportArtifact(): Artifact<"report"> {
  const now = Date.now();
  return {
    id: legacyReportArtifact.id,
    type: "report",
    title: legacyReportArtifact.title,
    status: legacyReportArtifact.status === "running" ? "streaming" : legacyReportArtifact.status,
    activeVersionId: legacyReportArtifact.activeVersionId,
    createdAt: now,
    updatedAt: now,
    versions: legacyReportArtifact.versions.map((v, i) => ({
      id: v.id,
      label: `${v.label} · ${v.summary}`,
      source: "ai" as const,
      createdAt: now - (legacyReportArtifact.versions.length - i) * 60_000,
      payload: {
        sql: v.sql,
        result: v.result,
        blocks: v.report,
        database: legacyReportArtifact.database,
        activeView: "report" as const,
      },
    })),
  };
}

// ----------------------------------------------------------------
// Demo: markdown artifact（销售周报草稿）
// ----------------------------------------------------------------

const SALES_WEEKLY_MD = `# 销售周报 · 2026-04-21 → 2026-04-27

## 本周亮点

- 销售总额 **¥ 2,387 万**，环比 **+18.4%**，连续第 3 周上涨
- **杭州极智科技** 单笔下单 ¥ 482 万，刷新本季度最大单
- 华东大区贡献 **38%** 销售额，仍是头部市场

## 关键数据

\`\`\`
今日销售额    ¥ 384.2 万   ↑ +12.4%
今日订单数        318 单    ↑ +24
活跃客户数        147 户    ↑ +8
客单价        ¥ 12,082    ↓ -3.1%
\`\`\`

## 风险与跟进

- **客单价下滑 3.1%**：需要拉一下分品类数据看是否被小单拉低
- **西北大区**：订单数环比 -8%，建议销售经理跟进重点客户
- **新客占比 12%**：低于上月 18%，市场拓展节奏放缓

## 下周重点

1. 跟进杭州极智的续单意向
2. 西北大区拜访 5 个 A 级客户
3. 准备五一活动的产品组合定价方案

> 数据来源：sales.sales_orders + sales.customers，截至 2026-04-27 14:30
`;

const markdownDemoArtifact: Artifact<"markdown"> = {
  id: "md-weekly-2026-04-27",
  type: "markdown",
  title: "销售周报草稿",
  status: "ready",
  activeVersionId: "v1",
  createdAt: Date.now() - 10 * 60_000,
  updatedAt: Date.now() - 5 * 60_000,
  versions: [
    {
      id: "v1",
      label: "v1 · AI 初稿",
      source: "ai",
      createdAt: Date.now() - 10 * 60_000,
      payload: { content: SALES_WEEKLY_MD },
    },
  ],
};

// ----------------------------------------------------------------
// Demo: code artifact（SQL 优化版本）
// ----------------------------------------------------------------

const SQL_OPTIMIZED = `-- 销售订单 top 10 客户（优化版：加索引提示 + EXPLAIN）
EXPLAIN ANALYZE
SELECT
  c.name              AS customer_name,
  c.level             AS level,
  c.region            AS region,
  COUNT(o.id)         AS order_count,
  SUM(o.amount)       AS total_amount,
  AVG(o.amount)::int  AS avg_order_amount
FROM sales.sales_orders o
  /*+ INDEX(o, idx_sales_orders_status_created) */
  INNER JOIN sales.customers c
    ON c.id = o.customer_id
WHERE o.status     IN ('confirmed', 'shipped', 'delivered')
  AND o.created_at >= NOW() - INTERVAL '7 days'
GROUP BY c.id, c.name, c.level, c.region
ORDER BY total_amount DESC
LIMIT 10;

-- 优化点：
-- 1) JOIN 用 INNER JOIN 替代隐式 JOIN，强制使用索引
-- 2) GROUP BY 加 c.id，避免基于 name 的 hash agg（c.id 是主键有 index）
-- 3) 加 INDEX hint 走 idx_sales_orders_status_created (status, created_at)
-- 4) EXPLAIN ANALYZE 跑一次确认走 Index Scan 而不是 Seq Scan
`;

// ----------------------------------------------------------------
// Demo: code-runnable artifact（Sandpack 沙箱）
// ----------------------------------------------------------------

const REACT_DEMO_CODE = `export default function App() {
  const data = [
    { name: "杭州极智", value: 482 },
    { name: "深圳锐凡", value: 451 },
    { name: "苏州凯昇", value: 398 },
  ];
  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1 style={{ color: "#3553FF" }}>Top 客户销售额（万元）</h1>
      <ul>
        {data.map((d) => (
          <li key={d.name} style={{ margin: "8px 0" }}>
            <span style={{ display: "inline-block", width: 96 }}>{d.name}</span>
            <span style={{
              display: "inline-block",
              height: 16,
              width: d.value,
              background: "#3553FF",
              borderRadius: 4,
              verticalAlign: "middle",
            }} />
            <span style={{ marginLeft: 8 }}>{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
`;

const codeRunnableArtifact: Artifact<"code"> = {
  id: "code-runnable-bar-chart",
  type: "code",
  title: "Top 客户柱状图（沙箱版）",
  status: "ready",
  activeVersionId: "v1",
  createdAt: Date.now() - 5_000,
  updatedAt: Date.now() - 5_000,
  versions: [
    {
      id: "v1",
      label: "v1 · React + 内联样式",
      source: "ai",
      createdAt: Date.now() - 5_000,
      payload: {
        language: "react",
        content: REACT_DEMO_CODE,
        mode: "runnable",
      },
    },
  ],
};

// ----------------------------------------------------------------
// Demo: diagram artifact（Mermaid 流程图）
// ----------------------------------------------------------------

const SALES_DATA_FLOW_MERMAID = `flowchart LR
  A[销售订单<br/>sales_orders] --> B{执行 SQL<br/>聚合}
  C[客户主数据<br/>customers] --> B
  B --> D[QueryResult<br/>10 行结果]
  D --> E[报表 KPI / 图表 / 表格]
  D --> F[导出 Excel]
  E --> G[发周报]
  F --> G
  style A fill:#EBEEFF,stroke:#3553FF
  style C fill:#EBEEFF,stroke:#3553FF
  style B fill:#fff,stroke:#3553FF,stroke-width:2px
  style D fill:#FAFAFA,stroke:#868686
  style G fill:#3553FF,stroke:#3553FF,color:#fff
`;

const diagramDemoArtifact: Artifact<"diagram"> = {
  id: "diag-pipeline-2026-04-27",
  type: "diagram",
  title: "销售数据流程图",
  status: "ready",
  activeVersionId: "v1",
  createdAt: Date.now() - 6 * 60_000,
  updatedAt: Date.now() - 6 * 60_000,
  versions: [
    {
      id: "v1",
      label: "v1 · 数据流",
      source: "ai",
      createdAt: Date.now() - 6 * 60_000,
      payload: {
        source: SALES_DATA_FLOW_MERMAID,
        mode: "text",
      },
    },
  ],
};

// ----------------------------------------------------------------
// Demo: diagram-interactive artifact（ReactFlow 拖拽编辑）
// ----------------------------------------------------------------

const FLOW_INTERACTIVE_JSON = JSON.stringify(
  {
    nodes: [
      { id: "1", position: { x: 60, y: 80 }, data: { label: "原始数据 sales_orders" } },
      { id: "2", position: { x: 60, y: 200 }, data: { label: "客户主表 customers" } },
      { id: "3", position: { x: 360, y: 140 }, data: { label: "聚合 SQL\n(JOIN + GROUP BY)" } },
      { id: "4", position: { x: 660, y: 140 }, data: { label: "QueryResult" } },
      { id: "5", position: { x: 900, y: 60 }, data: { label: "周报渲染" } },
      { id: "6", position: { x: 900, y: 220 }, data: { label: "Excel 导出" } },
    ],
    edges: [
      { id: "e1-3", source: "1", target: "3", animated: true },
      { id: "e2-3", source: "2", target: "3", animated: true },
      { id: "e3-4", source: "3", target: "4" },
      { id: "e4-5", source: "4", target: "5" },
      { id: "e4-6", source: "4", target: "6" },
    ],
  },
  null,
  2,
);

const diagramInteractiveArtifact: Artifact<"diagram"> = {
  id: "diag-interactive-pipeline",
  type: "diagram",
  title: "数据流程图（可拖拽）",
  status: "ready",
  activeVersionId: "v1",
  createdAt: Date.now() - 12_000,
  updatedAt: Date.now() - 12_000,
  versions: [
    {
      id: "v1",
      label: "v1 · 6 节点 5 连线",
      source: "ai",
      createdAt: Date.now() - 12_000,
      payload: {
        source: FLOW_INTERACTIVE_JSON,
        mode: "interactive",
      },
    },
  ],
};

// ----------------------------------------------------------------
// Demo: mindmap artifact（Markmap 思维导图）
// ----------------------------------------------------------------

const MINDMAP_MD = `# 销售周报结构

## 本周亮点
- 总销售额
- Top 客户
- 头部市场

## 关键数据
- 销售额 / 订单数
- 活跃客户
- 客单价

## 风险与跟进
- 客单价下滑
- 西北大区放缓
- 新客占比下降

## 下周重点
- 杭州极智续单
- 西北 A 级客户拜访
- 五一活动定价
`;

const mindmapDemoArtifact: Artifact<"mindmap"> = {
  id: "mind-weekly-structure",
  type: "mindmap",
  title: "周报结构思维导图",
  status: "ready",
  activeVersionId: "v1",
  createdAt: Date.now() - 4 * 60_000,
  updatedAt: Date.now() - 4 * 60_000,
  versions: [
    {
      id: "v1",
      label: "v1 · 4 大块",
      source: "ai",
      createdAt: Date.now() - 4 * 60_000,
      payload: {
        markdown: MINDMAP_MD,
        mode: "readonly",
      },
    },
  ],
};

// ----------------------------------------------------------------
// Demo: mindmap-editable artifact（mind-elixir 可编辑）
// ----------------------------------------------------------------

const MINDMAP_EDITABLE_MD = `# 销售周报结构

## 本周亮点
- 总销售额
- Top 客户
- 头部市场

## 风险与跟进
- 客单价下滑
- 西北大区
`;

const mindmapEditableArtifact: Artifact<"mindmap"> = {
  id: "mind-editable-weekly",
  type: "mindmap",
  title: "周报结构（可编辑）",
  status: "ready",
  activeVersionId: "v1",
  createdAt: Date.now() - 8_000,
  updatedAt: Date.now() - 8_000,
  versions: [
    {
      id: "v1",
      label: "v1 · 节点可拖拽",
      source: "ai",
      createdAt: Date.now() - 8_000,
      payload: {
        markdown: MINDMAP_EDITABLE_MD,
        mode: "editable",
      },
    },
  ],
};

// ----------------------------------------------------------------
// Demo: whiteboard artifact（Excalidraw — 系统架构草图）
// ----------------------------------------------------------------

const whiteboardDemoArtifact: Artifact<"whiteboard"> = {
  id: "wb-architecture-sketch",
  type: "whiteboard",
  title: "数据 Pipeline 架构草图",
  status: "ready",
  activeVersionId: "v1",
  createdAt: Date.now() - 3 * 60_000,
  updatedAt: Date.now() - 3 * 60_000,
  versions: [
    {
      id: "v1",
      label: "v1 · 草图",
      source: "ai",
      createdAt: Date.now() - 3 * 60_000,
      payload: {
        elements: [],
        appState: { viewBackgroundColor: "#FFFFFF" },
      },
    },
  ],
};

// ----------------------------------------------------------------
// Demo: spreadsheet artifact（Univer Sheets）
// ----------------------------------------------------------------

const SPREADSHEET_SNAPSHOT = {
  id: "wb-top-customers",
  sheetOrder: ["sheet-1"],
  name: "Top 客户分析",
  sheets: {
    "sheet-1": {
      id: "sheet-1",
      name: "Top 10 客户",
      rowCount: 100,
      columnCount: 26,
      cellData: {
        0: {
          0: { v: "客户名称" },
          1: { v: "等级" },
          2: { v: "区域" },
          3: { v: "订单数" },
          4: { v: "销售总额" },
          5: { v: "客单价" },
        },
        1: { 0: { v: "杭州极智科技有限公司" }, 1: { v: "S" }, 2: { v: "华东" }, 3: { v: 38 }, 4: { v: 4_829_400 }, 5: { v: 127_089 } },
        2: { 0: { v: "深圳锐凡电子股份" }, 1: { v: "A" }, 2: { v: "华南" }, 3: { v: 41 }, 4: { v: 4_512_800 }, 5: { v: 110_068 } },
        3: { 0: { v: "苏州凯昇精密" }, 1: { v: "S" }, 2: { v: "华东" }, 3: { v: 29 }, 4: { v: 3_984_200 }, 5: { v: 137_386 } },
        4: { 0: { v: "广州启航贸易" }, 1: { v: "A" }, 2: { v: "华南" }, 3: { v: 33 }, 4: { v: 3_421_900 }, 5: { v: 103_694 } },
        5: { 0: { v: "北京云途智能" }, 1: { v: "A" }, 2: { v: "华北" }, 3: { v: 24 }, 4: { v: 3_184_500 }, 5: { v: 132_687 } },
        6: { 0: { v: "成都赛博机电" }, 1: { v: "B" }, 2: { v: "西南" }, 3: { v: 27 }, 4: { v: 2_897_300 }, 5: { v: 107_307 } },
        7: { 0: { v: "上海星河自动化" }, 1: { v: "S" }, 2: { v: "华东" }, 3: { v: 19 }, 4: { v: 2_812_400 }, 5: { v: 148_021 } },
        8: { 0: { v: "武汉联创工控" }, 1: { v: "B" }, 2: { v: "华中" }, 3: { v: 22 }, 4: { v: 2_408_900 }, 5: { v: 109_495 } },
        9: { 0: { v: "西安鼎盛半导体" }, 1: { v: "A" }, 2: { v: "西北" }, 3: { v: 18 }, 4: { v: 2_104_700 }, 5: { v: 116_927 } },
        10: { 0: { v: "宁波四海传感" }, 1: { v: "B" }, 2: { v: "华东" }, 3: { v: 26 }, 4: { v: 1_983_500 }, 5: { v: 76_288 } },
        12: { 0: { v: "总计：" }, 4: { f: "=SUM(E2:E11)" } },
      },
    },
  },
} as const;

const spreadsheetDemoArtifact: Artifact<"spreadsheet"> = {
  id: "ss-top-customers",
  type: "spreadsheet",
  title: "Top 10 客户表",
  status: "ready",
  activeVersionId: "v1",
  createdAt: Date.now() - 20_000,
  updatedAt: Date.now() - 20_000,
  versions: [
    {
      id: "v1",
      label: "v1 · 含合计公式",
      source: "ai",
      createdAt: Date.now() - 20_000,
      payload: {
        univerSnapshot: SPREADSHEET_SNAPSHOT as never,
      },
    },
  ],
};

// ----------------------------------------------------------------
// Demo: document artifact（Plate v53 富文本）
// ----------------------------------------------------------------

const documentDemoArtifact: Artifact<"document"> = {
  id: "doc-weekly-formal",
  type: "document",
  title: "销售周报（正式版）",
  status: "ready",
  activeVersionId: "v1",
  createdAt: Date.now() - 30_000,
  updatedAt: Date.now() - 30_000,
  versions: [
    {
      id: "v1",
      label: "v1 · Plate 富文本",
      source: "ai",
      createdAt: Date.now() - 30_000,
      payload: {
        content: `<h1>销售周报 · 2026-04-21 → 2026-04-27</h1>
<h2>本周亮点</h2>
<p>销售总额 <strong>¥ 2,387 万</strong>，环比 <strong>+18.4%</strong>，连续第 3 周上涨。</p>
<p><strong>杭州极智科技</strong> 单笔下单 ¥ 482 万，刷新本季度最大单。华东大区贡献 38% 销售额，仍是头部市场。</p>
<h2>风险与跟进</h2>
<blockquote><p>客单价同比下降 3.1%，需关注是否由小单驱动增长；西北大区订单数 -8%。</p></blockquote>
<h2>下周重点</h2>
<ol>
  <li><p>跟进杭州极智的续单意向</p></li>
  <li><p>西北大区拜访 5 个 A 级客户</p></li>
  <li><p>准备五一活动的产品组合定价方案</p></li>
</ol>`,
      },
    },
  ],
};

// ----------------------------------------------------------------
// Demo: slide artifact（自定义 SlideSchema → React 渲染 → PptxGenJS 导出）
// ----------------------------------------------------------------

const slideDemoArtifact: Artifact<"slide"> = {
  id: "slide-weekly-deck",
  type: "slide",
  title: "销售周报演示稿",
  status: "ready",
  activeVersionId: "v1",
  createdAt: Date.now() - 1 * 60_000,
  updatedAt: Date.now() - 1 * 60_000,
  versions: [
    {
      id: "v1",
      label: "v1 · 6 页初稿",
      source: "ai",
      createdAt: Date.now() - 1 * 60_000,
      payload: {
        slides: [
          {
            id: "s1",
            layout: "title",
            title: "销售周报",
            notes: "2026-04-21 → 2026-04-27",
          },
          {
            id: "s2",
            layout: "bullets",
            title: "本周亮点",
            bullets: [
              "销售总额 ¥ 2,387 万，环比 +18.4%，连续第 3 周上涨",
              "杭州极智科技 单笔下单 ¥ 482 万，刷新本季度最大单",
              "华东大区贡献 38% 销售额，仍是头部市场",
              "新增 12 家 A 级客户，客户拓展节奏良好",
            ],
            notes: "重点强调华东和杭州极智的故事",
          },
          {
            id: "s3",
            layout: "two-col",
            title: "关键数据",
            bullets: [
              "今日销售额 ¥ 384.2 万 ↑ +12.4%",
              "今日订单数 318 单 ↑ +24",
              "活跃客户 147 户 ↑ +8",
              "客单价 ¥ 12,082 ↓ -3.1%",
              "新客占比 12% ↓ -6pp",
              "退货率 2.1% → 持平",
            ],
          },
          {
            id: "s4",
            layout: "bullets",
            title: "风险与跟进",
            bullets: [
              "客单价下滑 3.1%：拉一下分品类数据看是否被小单拉低",
              "西北大区订单数环比 -8%：销售经理跟进重点客户",
              "新客占比 12%：低于上月 18%，市场拓展节奏放缓",
            ],
          },
          {
            id: "s5",
            layout: "bullets",
            title: "下周重点",
            bullets: [
              "跟进杭州极智的续单意向",
              "西北大区拜访 5 个 A 级客户",
              "准备五一活动的产品组合定价方案",
              "完成 Q2 销售目标的二次拆解",
            ],
          },
          {
            id: "s6",
            layout: "title",
            title: "Q&A",
            notes: "数据来源：sales.sales_orders + sales.customers",
          },
        ],
      },
    },
  ],
};

// ----------------------------------------------------------------
// Demo: pdf artifact（browser PDF viewer）
// ----------------------------------------------------------------

const pdfDemoArtifact: Artifact<"pdf"> = {
  id: "pdf-spec-sample",
  type: "pdf",
  title: "PostgreSQL 16 性能调优指南.pdf",
  status: "ready",
  activeVersionId: "v1",
  createdAt: Date.now() - 2 * 60_000,
  updatedAt: Date.now() - 2 * 60_000,
  versions: [
    {
      id: "v1",
      label: "v1 · 上传",
      source: "user",
      createdAt: Date.now() - 2 * 60_000,
      payload: {
        // 公开 sample PDF（mozilla pdf.js 自带）；CORS 友好
        url: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
      },
    },
  ],
};

// ----------------------------------------------------------------
// Demo: web artifact（iframe web preview）
// ----------------------------------------------------------------

const webDemoArtifact: Artifact<"web"> = {
  id: "web-forge-knowledge-preview",
  type: "web",
  title: "Agent 任务看板网页预览",
  status: "ready",
  activeVersionId: "v1",
  createdAt: Date.now() - 90_000,
  updatedAt: Date.now() - 90_000,
  versions: [
    {
      id: "v1",
      label: "v1 · 本地页面",
      source: "ai",
      createdAt: Date.now() - 90_000,
      payload: {
        url: "/web-preview/agent-status.html",
        title: "Agent 任务看板",
        description: "像 Codex 客户端的 web preview 一样，在右侧面板里直接预览一个网页。",
      },
    },
  ],
};

const codeDemoArtifact: Artifact<"code"> = {
  id: "code-sql-optimized-2026-04-27",
  type: "code",
  title: "Top 客户 SQL（优化版）",
  status: "ready",
  activeVersionId: "v1",
  createdAt: Date.now() - 8 * 60_000,
  updatedAt: Date.now() - 3 * 60_000,
  versions: [
    {
      id: "v1",
      label: "v1 · 加 INDEX hint + EXPLAIN",
      source: "ai",
      createdAt: Date.now() - 8 * 60_000,
      payload: {
        language: "sql",
        content: SQL_OPTIMIZED,
        mode: "editable",
      },
    },
  ],
};

// ----------------------------------------------------------------
// 额外 chat 消息（在 reportMessages 后追加，引用新的 markdown artifact）
// ----------------------------------------------------------------

export type ExtraArtifactRef = {
  artifactId: string;
  type: AnyArtifact["type"];
  title: string;
  subtitle: string;
};

export type ExtraMessage = {
  role: "user" | "assistant";
  id: string;
  content: string;
  time: string;
  artifactRef?: ExtraArtifactRef;
};

const codingExtraMessagesByConversation: Record<string, ExtraMessage[]> = {
  "c-1": [
    {
      role: "user",
      id: "u-md-1",
      content: "把这份日报扩成一份完整的销售周报，加上风险跟进和下周重点。",
      time: "14:32",
    },
    {
      role: "assistant",
      id: "a-md-1",
      content:
        "已经把日报扩展为完整周报，加了**亮点 / 关键数据 / 风险跟进 / 下周重点**四个段落，可以直接编辑右侧 Markdown 草稿。",
      time: "14:33",
      artifactRef: {
        artifactId: markdownDemoArtifact.id,
        type: "markdown",
        title: "销售周报草稿",
        subtitle: "AI 初稿 · 可编辑",
      },
    },
  ],
  "c-2": [
    {
      role: "user",
      id: "u-code-1",
      content: "Top 10 客户那条 SQL 跑得有点慢，能不能优化一下？",
      time: "14:36",
    },
    {
      role: "assistant",
      id: "a-code-1",
      content:
        "看了执行计划，瓶颈是 `sales_orders` 走了 Seq Scan。改成显式 INNER JOIN + 加 INDEX hint 走 `(status, created_at)` 复合索引，预计能从 142ms 降到 30ms 内。已经把优化版 SQL 抽成独立 artifact，你可以在右侧编辑器里继续调，跑 EXPLAIN ANALYZE 验证。",
      time: "14:37",
      artifactRef: {
        artifactId: codeDemoArtifact.id,
        type: "code",
        title: "Top 客户 SQL（优化版）",
        subtitle: "PostgreSQL · 可编辑",
      },
    },
  ],
  "c-3": [
    {
      role: "user",
      id: "u-diag-1",
      content: "把整个销售数据从原始表到周报的数据流画一下。",
      time: "14:40",
    },
    {
      role: "assistant",
      id: "a-diag-1",
      content:
        "用 Mermaid 画了流程图：从 `sales_orders` / `customers` 两张原始表，经过聚合 SQL 出结果，分两路走 → 周报渲染 + Excel 导出，最终汇成发给老板的周报。",
      time: "14:40",
      artifactRef: {
        artifactId: diagramDemoArtifact.id,
        type: "diagram",
        title: "销售数据流程图",
        subtitle: "Mermaid · 文本驱动",
      },
    },
    {
      role: "user",
      id: "u-mind-1",
      content: "把周报四块结构脑图化一下，给团队对齐用。",
      time: "14:43",
    },
    {
      role: "assistant",
      id: "a-mind-1",
      content:
        "脑图已经出来了：**本周亮点 / 关键数据 / 风险与跟进 / 下周重点** 四个一级节点，每个节点下挂 3-4 个二级要点，可以直接展开给团队看。",
      time: "14:43",
      artifactRef: {
        artifactId: mindmapDemoArtifact.id,
        type: "mindmap",
        title: "周报结构思维导图",
        subtitle: "Markmap · 只读预览",
      },
    },
  ],
  "c-4": [
    {
      role: "user",
      id: "u-wb-1",
      content: "我想再画几笔架构图，标一下 ETL 节点位置。",
      time: "14:46",
    },
    {
      role: "assistant",
      id: "a-wb-1",
      content:
        "已经开了一块白板（Excalidraw），你可以直接在右侧画矩形 / 箭头 / 文字标注，画完点导出。",
      time: "14:47",
      artifactRef: {
        artifactId: whiteboardDemoArtifact.id,
        type: "whiteboard",
        title: "数据 Pipeline 架构草图",
        subtitle: "Excalidraw · 可编辑",
      },
    },
  ],
  "c-5": [
    {
      role: "user",
      id: "u-pdf-1",
      content: "顺便把 PostgreSQL 16 调优手册放上来，开会时一起看。",
      time: "14:50",
    },
    {
      role: "assistant",
      id: "a-pdf-1",
      content:
        "PDF 已经挂上来，14 页内容，重点章节有 EXPLAIN ANALYZE / Index Selection / Vacuum 调优。直接在右侧翻页 + 缩放阅读。",
      time: "14:50",
      artifactRef: {
        artifactId: pdfDemoArtifact.id,
        type: "pdf",
        title: "PostgreSQL 16 性能调优指南.pdf",
        subtitle: "14 页 · 可翻页 / 缩放",
      },
    },
    {
      role: "user",
      id: "u-web-1",
      content: "再挂一个网页预览吧，类似 Codex 客户端里右侧那种 web preview。",
      time: "14:52",
    },
    {
      role: "assistant",
      id: "a-web-1",
      content:
        "已加一个网页预览 artifact，默认只展示链接摘要，打开后在右侧面板内嵌页面，适合预览本地 demo 页或文档页。",
      time: "14:52",
      artifactRef: {
        artifactId: webDemoArtifact.id,
        type: "web",
        title: "Agent 任务看板网页预览",
        subtitle: "iframe · 按需加载",
      },
    },
  ],
  "c-6": [
    {
      role: "user",
      id: "u-ss-1",
      content: "把 Top 10 客户结果导出成 Excel 工作簿，加合计公式。",
      time: "14:49",
    },
    {
      role: "assistant",
      id: "a-ss-1",
      content:
        "已经生成 Univer 工作簿：A-F 列分别是 客户名称 / 等级 / 区域 / 订单数 / 销售总额 / 客单价，第 12 行加了 `=SUM(E2:E11)` 合计公式。可以在右侧直接编辑或导出 .xlsx。",
      time: "14:49",
      artifactRef: {
        artifactId: spreadsheetDemoArtifact.id,
        type: "spreadsheet",
        title: "Top 10 客户表",
        subtitle: "Univer Sheets · 含公式",
      },
    },
  ],
  "c-7": [
    {
      role: "user",
      id: "u-doc-1",
      content: "把周报草稿格式化成正式 Word 文档版本，标题/加粗/引用都用上。",
      time: "14:51",
    },
    {
      role: "assistant",
      id: "a-doc-1",
      content:
        "已经用富文本编辑器（Plate）格式化好正式版：H1/H2 分级标题、关键数字加粗、风险段落用引用块标出。可以在右侧直接继续编辑，加粗 / 斜体 / 下划线 / H1-H3 / 引用 全套工具栏。",
      time: "14:52",
      artifactRef: {
        artifactId: documentDemoArtifact.id,
        type: "document",
        title: "销售周报（正式版）",
        subtitle: "Plate 富文本 · 可编辑",
      },
    },
    {
      role: "user",
      id: "u-slide-1",
      content: "把这份周报改成 PPT，下午要给老板汇报，导出原生 .pptx 我自己再调。",
      time: "14:53",
    },
    {
      role: "assistant",
      id: "a-slide-1",
      content:
        "PPT 已经出 6 页：**封面 / 本周亮点 / 关键数据（双栏）/ 风险与跟进 / 下周重点 / Q&A**。点演示模式直接全屏，或者点导出 .pptx 下载到本地用 PowerPoint 继续调（文字都是 native 元素，能直接编辑）。",
      time: "14:54",
      artifactRef: {
        artifactId: slideDemoArtifact.id,
        type: "slide",
        title: "销售周报演示稿",
        subtitle: "6 页 · 可导出原生 .pptx",
      },
    },
  ],
};

// ----------------------------------------------------------------
// 按 appId 分配 mock artifact
// ----------------------------------------------------------------

const codingArtifacts: AnyArtifact[] = [
  adaptLegacyReportArtifact(),
  markdownDemoArtifact,
  codeDemoArtifact,
  diagramDemoArtifact,
  mindmapDemoArtifact,
  whiteboardDemoArtifact,
  pdfDemoArtifact,
  webDemoArtifact,
  slideDemoArtifact,
  documentDemoArtifact,
  spreadsheetDemoArtifact,
  diagramInteractiveArtifact,
  mindmapEditableArtifact,
  codeRunnableArtifact,
];

export const mockArtifactsByAppId: Record<string, AnyArtifact[]> = {
  coding: codingArtifacts,
  // general 暂不挂 artifact，留给后续 artifact 类型落地
};

export const mockExtraMessagesByAppId: Record<string, ExtraMessage[]> = {
  coding: Object.values(codingExtraMessagesByConversation).flat(),
};

export function getMockArtifacts(appId: string): AnyArtifact[] {
  return mockArtifactsByAppId[appId] ?? [];
}

export function getMockExtraMessages(appId: string, conversationId?: string): ExtraMessage[] {
  if (appId === "coding" && conversationId) {
    return codingExtraMessagesByConversation[conversationId] ?? [];
  }
  return mockExtraMessagesByAppId[appId] ?? [];
}
