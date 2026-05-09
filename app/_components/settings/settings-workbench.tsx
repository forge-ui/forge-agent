"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import {
  Button,
  ConfirmationDialog,
  DescriptionItem,
  Label,
  ListGroup,
  ListItem,
  ProgressCard,
  SelectOption,
  StatusBadge,
  TextArea,
  TextField,
  Toggle,
} from "@forge-ui-official/core";
import {
  BookLinear,
  CodeSquareLinear,
  CopyLinear,
  DatabaseLinear,
  DangerTriangleBold,
  GalleryLinear,
  GlobalLinear,
  KeyLinear,
  LinkLinear,
  PaperclipLinear,
  TextSquareLinear,
  TrashBinMinimalisticBold,
} from "solar-icon-set";
import { DEFAULT_APP_SLUG, getAppBySlug } from "@/app/_mock/apps";

type ArtifactMode = "split" | "fullscreen" | "closed";
type Retention = "30" | "90" | "365";
type Environment = "dev" | "staging" | "prod";
type AuthMode = "bearer" | "mtls" | "oauth" | "none";
type ProtocolVersion = "ui-stream-v6" | "ui-stream-v5" | "custom";

type CapabilityKey =
  | "web-search"
  | "files"
  | "code"
  | "artifact-doc"
  | "artifact-sheet"
  | "artifact-whiteboard";

type CapabilityState = Record<CapabilityKey, boolean>;

type Capability = {
  key: CapabilityKey;
  label: string;
  description: string;
  icon: ReactNode;
  color: "purple" | "green" | "blue" | "red" | "cyan" | "yellow";
};

const capabilities: Capability[] = [
  {
    key: "web-search",
    label: "联网搜索",
    description: "在输入区暴露入口，搜索由 Agent 端执行。",
    icon: <GlobalLinear size={18} color="currentColor" />,
    color: "blue",
  },
  {
    key: "files",
    label: "文件理解",
    description: "允许用户在对话中上传文档、图片、表格交给 Agent。",
    icon: <PaperclipLinear size={18} color="currentColor" />,
    color: "purple",
  },
  {
    key: "code",
    label: "代码执行",
    description: "为编程类任务渲染代码块、diff 和运行结果。",
    icon: <CodeSquareLinear size={18} color="currentColor" />,
    color: "green",
  },
  {
    key: "artifact-doc",
    label: "文档 / PPT 渲染",
    description: "Agent 输出文档/PPT 时在右侧 artifact 面板预览。",
    icon: <TextSquareLinear size={18} color="currentColor" />,
    color: "red",
  },
  {
    key: "artifact-sheet",
    label: "表格 / 数据",
    description: "支持电子表格和数据可视化卡片。",
    icon: <DatabaseLinear size={18} color="currentColor" />,
    color: "cyan",
  },
  {
    key: "artifact-whiteboard",
    label: "白板 / 图表",
    description: "脑图、流程图、白板草图的画布渲染。",
    icon: <GalleryLinear size={18} color="currentColor" />,
    color: "yellow",
  },
];

export function SettingsWorkbench() {
  const params = useParams<{ appId?: string }>();
  const slug = params?.appId ?? DEFAULT_APP_SLUG;
  const app = getAppBySlug(slug) ?? getAppBySlug(DEFAULT_APP_SLUG)!;

  const [environment, setEnvironment] = useState<Environment>("prod");
  const [endpoint, setEndpoint] = useState(
    `https://api.example.com/agents/${app.slug}/chat`,
  );
  const [authMode, setAuthMode] = useState<AuthMode>("bearer");
  const [protocolVersion, setProtocolVersion] =
    useState<ProtocolVersion>("ui-stream-v6");

  const [name, setName] = useState(app.name);
  const [description, setDescription] = useState(app.description);
  const [welcome, setWelcome] = useState(`我是 ${app.name}，${app.description}`);
  const [placeholder, setPlaceholder] =
    useState("输入你的问题，或直接下达任务...");

  const [capabilityState, setCapabilityState] = useState<CapabilityState>({
    "web-search": true,
    files: true,
    code: app.slug === "coding",
    "artifact-doc": true,
    "artifact-sheet": app.slug === "coding",
    "artifact-whiteboard": app.slug === "coding",
  });

  const [artifactMode, setArtifactMode] = useState<ArtifactMode>("split");
  const [showToolSteps, setShowToolSteps] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [syncMemory, setSyncMemory] = useState(true);
  const [retention, setRetention] = useState<Retention>("90");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [status, setStatus] = useState("本地草稿");

  const enabledCount = useMemo(
    () => Object.values(capabilityState).filter(Boolean).length,
    [capabilityState],
  );

  const envLabel: Record<Environment, string> = {
    dev: "Development",
    staging: "Staging",
    prod: "Production",
  };

  return (
    <div className="min-h-[calc(100vh-11rem)] bg-fg-grey-50 px-4 pb-10 pt-1">
      <div className="mx-auto grid w-full max-w-[1120px] gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <ListGroup
            title={name}
            subtitle={description}
            color="blue"
            badge={<StatusBadge label="已连接" color="green" />}
            items={
              <>
                <ListItem title="环境" subtitle="当前部署目标" value={envLabel[environment]} />
                <ListItem
                  title="能力声明"
                  subtitle="已启用 / 全部"
                  value={`${enabledCount}/${capabilities.length}`}
                />
                <ListItem title="协议版本" subtitle="当前 UI 流协议" value={protocolVersion} />
              </>
            }
          />

          <ListGroup
            title="接入配置"
            subtitle="UI 通过 HTTP + SSE 连接到客户 Agent。配置之外的事由 Agent 端决定。"
            color="blue"
            badge={<Label color="blue" size="sm" variant="outline">基础模式</Label>}
            action={
              <Button type="button" color="blue" size="sm" onClick={() => setStatus("已触发连接测试。")}>
                测试连接
              </Button>
            }
            items={
              <>
                <TextField
                  label="Endpoint"
                  value={endpoint}
                  color="blue"
                  onChange={setEndpoint}
                  iconRight={<CopyLinear size={16} color="currentColor" />}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectOption
                    label="环境"
                    color="blue"
                    width="100%"
                    value={environment}
                    options={[
                      { value: "dev", label: "Development" },
                      { value: "staging", label: "Staging" },
                      { value: "prod", label: "Production" },
                    ]}
                    onChange={(value) => setEnvironment(value as Environment)}
                  />
                  <SelectOption
                    label="协议版本"
                    color="blue"
                    width="100%"
                    value={protocolVersion}
                    options={[
                      { value: "ui-stream-v6", label: "AI SDK UI Stream v6" },
                      { value: "ui-stream-v5", label: "AI SDK UI Stream v5" },
                      { value: "custom", label: "自定义协议" },
                    ]}
                    onChange={(value) => setProtocolVersion(value as ProtocolVersion)}
                  />
                </div>
                <SelectOption
                  label="鉴权方式"
                  color="blue"
                  width="100%"
                  value={authMode}
                  options={[
                    { value: "bearer", label: "Bearer Token" },
                    { value: "mtls", label: "mTLS" },
                    { value: "oauth", label: "OAuth Client Credentials" },
                    { value: "none", label: "无鉴权（仅开发环境）" },
                  ]}
                  onChange={(value) => setAuthMode(value as AuthMode)}
                />
                {authMode !== "none" ? (
                  <DescriptionItem
                    lead={{
                      kind: "icon",
                      icon: <KeyLinear size={18} color="currentColor" />,
                      color: "blue",
                      variant: "neutral",
                    }}
                    label="凭据"
                    content="凭据已配置 · 最近更新 5 月 1 日"
                    actions={
                      <Button type="button" color="grey" variant="secondary" size="sm" disabled>
                        重新设置
                      </Button>
                    }
                  />
                ) : null}
                <DescriptionItem
                  lead={{
                    kind: "icon",
                    icon: <BookLinear size={18} color="currentColor" />,
                    color: "blue",
                    variant: "light",
                  }}
                  label="Claude Agent SDK"
                  content="Adapter starter 暂未接入下载地址。"
                  actions={
                    <Button type="button" color="blue" variant="secondary" size="sm" disabled>
                      查看文档
                    </Button>
                  }
                />
              </>
            }
          />

          <ListGroup
            title="品牌与展示"
            subtitle="影响用户在工作站里看到的 Agent 形象，不改变底层能力。"
            color="purple"
            items={
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="显示名称"
                    value={name}
                    color="blue"
                    onChange={setName}
                  />
                  <TextField
                    label="输入框占位"
                    value={placeholder}
                    color="blue"
                    onChange={setPlaceholder}
                  />
                </div>
                <TextArea
                  label="一句话简介"
                  rows={2}
                  value={description}
                  color="blue"
                  onChange={setDescription}
                />
                <TextArea
                  label="欢迎语"
                  rows={3}
                  value={welcome}
                  color="blue"
                  onChange={setWelcome}
                />
              </>
            }
          />

          <ListGroup
            title="能力声明"
            subtitle="UI 按声明决定入口是否展示，能力本身由 Agent 端实现。"
            color="black"
            badge={<Label color="gray" size="sm" variant="outline">Manifest override</Label>}
            items={
              <>
                {capabilities.map((capability) => (
                  <ListItem
                    key={capability.key}
                    lead={{
                      kind: "icon",
                      icon: capability.icon,
                      color: capability.color,
                      variant: "neutral",
                      size: "lg",
                    }}
                    title={capability.label}
                    subtitle={capability.description}
                    trailing={
                      <Toggle
                        checked={capabilityState[capability.key]}
                        color="blue"
                        onChange={(value) =>
                          setCapabilityState((prev) => ({
                            ...prev,
                            [capability.key]: value,
                          }))
                        }
                      />
                    }
                  />
                ))}
              </>
            }
          />

          <ListGroup
            title="对话渲染"
            subtitle="控制 Agent 输出在对话区怎么呈现。"
            color="blue"
            items={
              <>
                <ListItem
                  lead={{
                    kind: "icon",
                    icon: <TextSquareLinear size={18} color="currentColor" />,
                    color: "blue",
                    variant: "neutral",
                  }}
                  title="显示工具调用过程"
                  subtitle="把工具调用、执行摘要折叠在主回答上方。"
                  trailing={
                    <Toggle checked={showToolSteps} color="blue" onChange={setShowToolSteps} />
                  }
                />
                <ListItem
                  lead={{
                    kind: "icon",
                    icon: <LinkLinear size={18} color="currentColor" />,
                    color: "green",
                    variant: "neutral",
                  }}
                  title="显示引用来源"
                  subtitle="Agent 返回 sources 时，在消息底部展示引用入口。"
                  trailing={
                    <Toggle checked={showSources} color="blue" onChange={setShowSources} />
                  }
                />
                <SelectOption
                  label="Artifact 默认打开方式"
                  color="blue"
                  width="100%"
                  value={artifactMode}
                  options={[
                    { value: "split", label: "右侧分栏" },
                    { value: "fullscreen", label: "全屏预览" },
                    { value: "closed", label: "仅显示卡片" },
                  ]}
                  onChange={(value) => setArtifactMode(value as ArtifactMode)}
                />
              </>
            }
          />

          <ListGroup
            title="数据策略"
            subtitle="UI 侧对话历史与记忆策略，Agent 端自有数据不在此管理。"
            color="black"
            items={
              <>
                <ListItem
                  lead={{
                    kind: "icon",
                    icon: <DatabaseLinear size={18} color="currentColor" />,
                    color: "purple",
                    variant: "neutral",
                  }}
                  title="沉淀到工作记忆"
                  subtitle="允许从对话中提取偏好、规则、流程作为候选记忆。"
                  trailing={<Toggle checked={syncMemory} color="blue" onChange={setSyncMemory} />}
                />
                <SelectOption
                  label="历史保留周期"
                  color="blue"
                  width="100%"
                  value={retention}
                  options={[
                    { value: "30", label: "30 天" },
                    { value: "90", label: "90 天" },
                    { value: "365", label: "1 年" },
                  ]}
                  onChange={(value) => setRetention(value as Retention)}
                />
              </>
            }
          />
        </div>

        <aside className="flex min-w-0 flex-col gap-5">
          <ProgressCard
            title="配置完整度"
            value="82%"
            subtitle={status}
            theme="white"
            progress={82}
            progressColor="var(--fg-blue)"
            items={[
              { label: "接入状态可见", value: "完成", color: "var(--fg-green)" },
              { label: "体验设置可编辑", value: "完成", color: "var(--fg-green)" },
              { label: "保存接口", value: "待接入", color: "var(--fg-grey-400)" },
            ]}
            action={
              <Button type="button" color="blue" size="sm" onClick={() => setStatus("已更新草稿")}>
                保存草稿
              </Button>
            }
          />

          <ListGroup
            title="状态"
            subtitle="当前页面展示的健康检查仍为 mock 数据。"
            color="blue"
            badge={<StatusBadge label="Healthy" color="green" />}
            items={
              <>
                <ListItem title="最近响应" value="1.8s" subtitle="P95" />
                <ListItem title="错误率" value="0.2%" subtitle="最近 5 分钟" />
                <ListItem title="最近检查" value="刚刚" subtitle="本地触发" />
              </>
            }
          />

          <ListGroup
            title="危险区"
            subtitle="MVP 先展示操作入口，真实数据清除必须接入二次确认。"
            color="black"
            badge={<Label color="red" size="sm" variant="outline">谨慎操作</Label>}
            items={
              <>
                <DescriptionItem
                  lead={{
                    kind: "icon",
                    icon: <DangerTriangleBold size={18} color="currentColor" />,
                    color: "red",
                    variant: "neutral",
                  }}
                  label="清空 UI 侧历史"
                  content="清空当前 Agent 在 UI 侧的对话与候选记忆。"
                />
                <Button
                  type="button"
                  color="red"
                  variant="secondary"
                  onClick={() => setShowClearConfirm(true)}
                >
                  清空对话历史
                </Button>
              </>
            }
          />
        </aside>
      </div>

      {showClearConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-fg-black/40 px-4">
          <ConfirmationDialog
            color="red"
            title="清空当前 Agent 历史？"
            description="此操作会清空 UI 侧对话历史与候选记忆。当前版本不会影响 Agent 端数据。"
            confirmLabel="确认清空"
            cancelLabel="取消"
            icon={<TrashBinMinimalisticBold size={32} color="currentColor" />}
            layout="right"
            onCancel={() => setShowClearConfirm(false)}
            onConfirm={() => {
              setShowClearConfirm(false);
              setStatus("已确认清空操作，等待接入真实清除接口。");
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
