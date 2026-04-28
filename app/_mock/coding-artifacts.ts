export type ArtifactTab = "preview" | "code" | "diff" | "data";

export type CodeFile = {
  path: string;
  language: "tsx" | "ts" | "css" | "json" | "html";
  code: string;
  changeType: "created" | "modified" | "deleted" | "unchanged";
};

export type DiffLine = {
  type: "context" | "add" | "delete";
  oldLine?: number;
  newLine?: number;
  content: string;
};

export type DiffHunk = {
  header: string;
  lines: DiffLine[];
};

export type FileDiff = {
  path: string;
  changeType: "modified" | "created" | "deleted";
  hunks: DiffHunk[];
};

export type DataColumn = {
  key: string;
  label: string;
  type: "string" | "number" | "color" | "category";
};

export type DataTableArtifact = {
  title: string;
  columns: DataColumn[];
  rows: Record<string, string | number | null>[];
};

export type ArtifactVersion = {
  id: string;
  label: string;
  summary: string;
  createdAt: string;
  previewHtml: string;
  files: CodeFile[];
  diffs: FileDiff[];
  tables: DataTableArtifact[];
};

export type CodingArtifact = {
  id: string;
  title: string;
  status: "ready" | "streaming" | "error";
  versions: ArtifactVersion[];
  activeVersionId: string;
};

export type CodingMessage =
  | { role: "user"; id: string; content: string; time: string }
  | {
      role: "assistant";
      id: string;
      content: string;
      artifactId?: string;
      time: string;
      sources?: number;
    };

// ---------------------------------------------------------------
// Mock content
// ---------------------------------------------------------------

const buttonV1Code = `import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "ghost";

export function Button({
  variant = "outline",
  children,
  className,
  ...rest
}: {
  variant?: Variant;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        "px-5 py-2.5 rounded-xl font-semibold transition-colors",
        variant === "outline" &&
          "border border-violet-600 text-violet-700 bg-white hover:bg-violet-50",
        variant === "solid" && "bg-violet-600 text-white hover:bg-violet-700",
        variant === "ghost" && "text-zinc-500 hover:text-zinc-900",
        className,
      )}
    >
      {children}
    </button>
  );
}`;

const buttonV2Code = `import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "ghost";

export function Button({
  variant = "outline",
  children,
  className,
  ...rest
}: {
  variant?: Variant;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        "px-5 py-2.5 rounded-xl font-semibold transition-transform duration-200 hover:scale-105",
        variant === "outline" &&
          "border border-violet-600 text-violet-700 bg-white hover:bg-violet-50",
        variant === "solid" && "bg-violet-600 text-white hover:bg-violet-700",
        variant === "ghost" && "text-zinc-500 hover:text-zinc-900",
        className,
      )}
    >
      {children}
    </button>
  );
}`;

const themeCode = `export const tokens = {
  color: {
    "violet-600": "#7C3AED",
    "violet-700": "#6D28D9",
    "violet-50":  "#F5F3FF",
    "zinc-200":   "#E4E4E7",
    "zinc-500":   "#71717A",
    "zinc-900":   "#18181B",
  },
  radius: {
    xl: "12px",
  },
  spacing: {
    "2.5": "10px",
    "5":   "20px",
  },
};`;

function previewHtml({ outline, hoverScale }: { outline: boolean; hoverScale: boolean }): string {
  const baseClass = outline
    ? "border border-violet-600 text-violet-700 bg-white hover:bg-violet-50"
    : "bg-violet-600 text-white hover:bg-violet-700";
  const hoverClass = hoverScale
    ? " hover:scale-105 transition-transform duration-200"
    : " transition-colors";
  return `<!doctype html>
<html><head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"><\/script>
<style>body{font-family:-apple-system,sans-serif}</style>
</head>
<body class="bg-zinc-50 min-h-screen flex items-center justify-center p-8">
  <div class="flex flex-col gap-6 items-center">
    <div class="flex gap-3">
      <button class="px-5 py-2.5 rounded-xl font-semibold ${baseClass}${hoverClass}">主按钮</button>
      <button class="px-5 py-2.5 rounded-xl font-semibold border border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50">次按钮</button>
      <button class="px-5 py-2.5 rounded-xl font-semibold text-zinc-500 hover:text-zinc-900">幽灵按钮</button>
    </div>
    <p class="text-sm text-zinc-500">${hoverScale ? "鼠标悬停可看放大动效 ✨" : "outline 风格 · hover 仅换背景"}</p>
  </div>
</body></html>`;
}

const tokenTable: DataTableArtifact = {
  title: "用到的 Design Token",
  columns: [
    { key: "token", label: "Token", type: "string" },
    { key: "value", label: "值", type: "color" },
    { key: "category", label: "分类", type: "category" },
    { key: "usedBy", label: "用在", type: "string" },
    { key: "count", label: "次数", type: "number" },
  ],
  rows: [
    { token: "violet-600", value: "#7C3AED", category: "color", usedBy: "Button (outline border, solid bg)", count: 4 },
    { token: "violet-700", value: "#6D28D9", category: "color", usedBy: "Button (outline text, solid hover)", count: 3 },
    { token: "violet-50", value: "#F5F3FF", category: "color", usedBy: "Button (outline hover bg)", count: 1 },
    { token: "zinc-200", value: "#E4E4E7", category: "color", usedBy: "Button (secondary border)", count: 1 },
    { token: "zinc-500", value: "#71717A", category: "color", usedBy: "Button (ghost text)", count: 1 },
    { token: "zinc-900", value: "#18181B", category: "color", usedBy: "Button (ghost hover text)", count: 1 },
    { token: "radius-xl", value: "12px", category: "radius", usedBy: "Button (rounded-xl)", count: 1 },
    { token: "spacing-2.5", value: "10px", category: "spacing", usedBy: "Button (py-2.5)", count: 1 },
    { token: "spacing-5", value: "20px", category: "spacing", usedBy: "Button (px-5)", count: 1 },
  ],
};

const buttonDiff: FileDiff = {
  path: "components/Button.tsx",
  changeType: "modified",
  hunks: [
    {
      header: "@@ -14,7 +14,7 @@",
      lines: [
        { type: "context", oldLine: 14, newLine: 14, content: "      {...rest}" },
        { type: "context", oldLine: 15, newLine: 15, content: "      className={cn(" },
        { type: "delete", oldLine: 16, content: '        "px-5 py-2.5 rounded-xl font-semibold transition-colors",' },
        { type: "add", newLine: 16, content: '        "px-5 py-2.5 rounded-xl font-semibold transition-transform duration-200 hover:scale-105",' },
        { type: "context", oldLine: 17, newLine: 17, content: '        variant === "outline" &&' },
        { type: "context", oldLine: 18, newLine: 18, content: '          "border border-violet-600 text-violet-700 bg-white hover:bg-violet-50",' },
        { type: "context", oldLine: 19, newLine: 19, content: '        variant === "solid" && "bg-violet-600 text-white hover:bg-violet-700",' },
      ],
    },
  ],
};

export const codingArtifact: CodingArtifact = {
  id: "art-1",
  title: "Button outline 改造 + token 列表",
  status: "ready",
  activeVersionId: "v2",
  versions: [
    {
      id: "v1",
      label: "v1",
      summary: "Button 改 outline 风格",
      createdAt: "14:21",
      previewHtml: previewHtml({ outline: true, hoverScale: false }),
      files: [
        { path: "components/Button.tsx", language: "tsx", code: buttonV1Code, changeType: "modified" },
        { path: "lib/theme.ts", language: "ts", code: themeCode, changeType: "modified" },
      ],
      diffs: [buttonDiff],
      tables: [tokenTable],
    },
    {
      id: "v2",
      label: "v2",
      summary: "+ hover scale 动效",
      createdAt: "14:23",
      previewHtml: previewHtml({ outline: true, hoverScale: true }),
      files: [
        { path: "components/Button.tsx", language: "tsx", code: buttonV2Code, changeType: "modified" },
        { path: "lib/theme.ts", language: "ts", code: themeCode, changeType: "unchanged" },
      ],
      diffs: [buttonDiff],
      tables: [tokenTable],
    },
  ],
};

export const codingMessages: CodingMessage[] = [
  {
    role: "user",
    id: "u1",
    content: "把 Button 改成 outline 风格，加个 hover 动效，然后列一下用到的颜色 token。",
    time: "14:20",
  },
  {
    role: "assistant",
    id: "a1",
    content:
      "已更新 `Button.tsx`，加了 outline 变体和 hover 缩放动效。同时整理了用到的 4 个 color token + 2 个 spacing token，放在右侧 Data 面板里。",
    artifactId: "art-1",
    time: "14:23",
    sources: 2,
  },
];
