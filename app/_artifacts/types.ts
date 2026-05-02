/**
 * Artifact 系统核心类型
 * 设计参考: docs/specs/2026-04-29-artifact-system-design.md
 */

import type { ComponentType } from "react";

// ----------------------------------------------------------------
// Artifact Type 枚举
// ----------------------------------------------------------------

export type ArtifactType =
  | "markdown"
  | "document" // P3 — Plate + .docx 互通
  | "spreadsheet" // P3 — Univer Sheets
  | "slide" // P3 — SlideSchema + PptxGenJS
  | "code"
  | "whiteboard"
  | "diagram"
  | "mindmap"
  | "pdf"
  | "web"
  | "report"; // 兼容现有 ReportArtifact（KPI/Chart/Table/Markdown 复合 view）

export type ArtifactStatus = "streaming" | "ready" | "error";

// ----------------------------------------------------------------
// 结构化 Attachment（挂在 markdown/code 上，不为表格/图表单独立 type）
// ----------------------------------------------------------------

export type AttachmentTable = {
  kind: "table";
  caption?: string;
  columns: { key: string; label: string; type: "string" | "number" | "money" | "date" | "category" | "boolean" }[];
  rows: Record<string, unknown>[];
};

export type AttachmentChart = {
  kind: "chart";
  spec: {
    type: "bar" | "line" | "pie" | "area" | "scatter";
    title?: string;
    xField: string;
    yField: string;
    groupField?: string;
    colorTheme?: "violet" | "indigo" | "mixed";
  };
  data: Record<string, unknown>[];
};

export type AttachmentImage = { kind: "image"; url: string; alt?: string };
export type AttachmentLink = { kind: "link"; url: string; title: string };

export type ArtifactAttachment =
  | AttachmentTable
  | AttachmentChart
  | AttachmentImage
  | AttachmentLink;

// ----------------------------------------------------------------
// Payload 占位类型（P3 实装时替换为真实类型）
// ----------------------------------------------------------------

// 等装 @univerjs/* 后替换
type IWorkbookData = unknown;
// 等装 @excalidraw/excalidraw 后替换
type ExcalidrawElement = Record<string, unknown>;

// SlideSchema — 自定义，本期内定义
export type SlideLayout = "title" | "bullets" | "image-text" | "two-col";
export type Slide = {
  id: string;
  layout: SlideLayout;
  title: string;
  bullets?: string[];
  image?: string;
  notes?: string;
};

// ----------------------------------------------------------------
// Report (兼容现有 mock 数据 / 编程 App 的 SQL workspace)
// ----------------------------------------------------------------

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

export type ChartType = "bar" | "line" | "pie" | "area";

export type ChartSpec = {
  type: ChartType;
  title: string;
  xField: string;
  yField: string;
  groupField?: string;
  colorTheme?: "violet" | "indigo" | "mixed";
};

export type HeadingBlock = { type: "heading"; id: string; level: 1 | 2 | 3; text: string };

export type KpiBlock = {
  type: "kpi";
  id: string;
  items: { label: string; value: string; delta?: string; trend?: "up" | "down" | "flat" }[];
};

export type ChartBlock = { type: "chart"; id: string; spec: ChartSpec; data: ResultRow[] };

export type TableBlock = {
  type: "table";
  id: string;
  caption?: string;
  columns: ResultColumn[];
  rows: ResultRow[];
  maxRows?: number;
};

export type MarkdownBlock = { type: "markdown"; id: string; content: string };

export type ReportBlock = HeadingBlock | KpiBlock | ChartBlock | TableBlock | MarkdownBlock;

/** report payload 内的 view tab */
export type ReportArtifactTab = "sql" | "result" | "report" | "schema";

/** AI 思考 / SQL 生成 / 执行 等步骤 — 兼容现有 reportMessages 的 steps */
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

// ----------------------------------------------------------------
// Payload 映射
// ----------------------------------------------------------------

export type ArtifactPayloadMap = {
  markdown: {
    content: string;
    attachments?: ArtifactAttachment[];
  };
  document: {
    /** Markdown / HTML 内容，传给 Umo Editor iframe 初始化 */
    content: string;
    /** 后端导出的 .docx 下载链接（可选） */
    docxUrl?: string;
  };
  spreadsheet: {
    univerSnapshot: IWorkbookData;
  };
  slide: {
    slides: Slide[];
  };
  code: {
    language: string;
    content: string;
    mode: "readonly" | "editable" | "runnable";
    attachments?: ArtifactAttachment[];
  };
  whiteboard: {
    /** inline 存元素列表，不走 URL — 避免用户编辑后无法持久化 */
    elements: ExcalidrawElement[];
    appState?: Record<string, unknown>;
  };
  diagram: {
    source: string; // mermaid / d2 文本
    mode: "text" | "interactive";
  };
  mindmap: {
    markdown: string;
    mode: "readonly" | "editable";
  };
  pdf: {
    url: string; // PDF 是只读 viewer，URL 即可
  };
  web: {
    url: string;
    title?: string;
    description?: string;
  };
  report: {
    /** 兼容 ReportArtifact 的多 view 复合数据 */
    sql?: string;
    result?: QueryResult;
    blocks: ReportBlock[];
    database?: DatabaseSchema;
    activeView?: "sql" | "result" | "report" | "schema";
  };
};

// ----------------------------------------------------------------
// Version & Artifact
// ----------------------------------------------------------------

export type ArtifactVersion<T extends ArtifactType> = {
  id: string;
  payload: ArtifactPayloadMap[T];
  createdAt: number;
  source: "ai" | "user";
  label?: string;
};

export type Artifact<T extends ArtifactType = ArtifactType> = {
  id: string;
  type: T;
  title: string;
  status: ArtifactStatus;
  versions: ArtifactVersion<T>[];
  activeVersionId: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * Discriminated union — 用于按 type 收窄。
 * 在 store / mock 数据里用 AnyArtifact，渲染时做 type narrowing。
 */
export type AnyArtifact = { [K in ArtifactType]: Artifact<K> }[ArtifactType];

// ----------------------------------------------------------------
// 编辑会话状态（dirtyPayload + savedVersionId）
// ----------------------------------------------------------------

export type ArtifactEditSession<T extends ArtifactType = ArtifactType> = {
  artifactId: string;
  savedVersionId: string;
  dirtyPayload?: ArtifactPayloadMap[T];
  isDirty: boolean;
};

// ----------------------------------------------------------------
// Definition — 每个 artifact type 注册到 registry 的元数据
// ----------------------------------------------------------------

export type ArtifactRenderProps<T extends ArtifactType> = {
  payload: ArtifactPayloadMap[T];
  readOnly?: boolean;
  onChange?: (next: ArtifactPayloadMap[T]) => void;
};

export type ArtifactDefinition<T extends ArtifactType> = {
  type: T;
  label: string;
  /** 用 solar-icon-set 的 ComponentType 形态 */
  icon: ComponentType<{ size?: number; color?: string }>;
  /**
   * 必须 dynamic({ ssr:false })。资源清理放组件 useEffect cleanup，不在 def 上。
   * Render 组件本身在子模块 ./render.tsx，index.ts 顶层禁止 import 重型库。
   */
  Render: ComponentType<ArtifactRenderProps<T>>;
  exporters?: Record<string, (p: ArtifactPayloadMap[T]) => Promise<Blob>>;
  importers?: Record<string, (file: File) => Promise<ArtifactPayloadMap[T]>>;
};

// ----------------------------------------------------------------
// Message Part（Chat 消息内容拆分）
// ----------------------------------------------------------------

export type MessagePart =
  | { kind: "text"; text: string }
  | { kind: "thinking"; summary: string; details?: { title: string; body: string }[]; duration?: string }
  | {
      kind: "tool-call";
      tool: string;
      args?: string;
      summary: string;
      result?: string;
      status?: "ok" | "warn" | "error";
    }
  | { kind: "source"; title: string; url: string; favicon?: string; excerpt?: string }
  | {
      kind: "artifact-ref";
      artifactId: string;
      action: "create" | "update";
      /** 冗余存预览，避免历史消息渲染依赖 artifact store 全量加载 */
      preview: { type: ArtifactType; title: string; subtitle?: string };
    };
