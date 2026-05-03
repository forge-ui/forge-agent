"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Button,
  StatusBadge,
  TabBar,
} from "@forge-ui/react";
import {
  AltArrowRightLinear,
  ArchiveCheckBoldDuotone,
  BoltBoldDuotone,
  CheckCircleBoldDuotone,
  ChecklistMinimalisticBoldDuotone,
  CloseCircleBoldDuotone,
  CommandBoldDuotone,
  DocumentTextBoldDuotone,
  EyeLinear,
  HistoryBoldDuotone,
  InfoCircleLinear,
  LayersBoldDuotone,
  LinkLinear,
  Pen2Linear,
  RefreshLinear,
  ShieldCheckBoldDuotone,
  StarShineBoldDuotone,
} from "solar-icon-set";
import { activeMemories, memoryCandidates } from "@/lib/memory/mock";
import type { MemoryAsset, MemoryAssetType } from "@/lib/memory/types";

type WorkbenchTab = "pending" | "settled" | "evidence";

const TYPE_META: Record<
  MemoryAssetType,
  {
    label: string;
    tone: "blue" | "purple" | "green" | "yellow" | "cyan" | "grey";
    icon: React.ReactNode;
  }
> = {
  preference: {
    label: "偏好",
    tone: "blue",
    icon: <StarShineBoldDuotone size={18} color="var(--fg-blue-500)" />,
  },
  fact: {
    label: "事实",
    tone: "grey",
    icon: <InfoCircleLinear size={18} color="var(--fg-grey-700)" />,
  },
  decision: {
    label: "决策",
    tone: "purple",
    icon: <ArchiveCheckBoldDuotone size={18} color="var(--fg-violet)" />,
  },
  skill: {
    label: "技能",
    tone: "green",
    icon: <BoltBoldDuotone size={18} color="var(--fg-green-500)" />,
  },
  rule: {
    label: "规则",
    tone: "yellow",
    icon: <ShieldCheckBoldDuotone size={18} color="var(--fg-yellow)" />,
  },
  workflow: {
    label: "流程",
    tone: "cyan",
    icon: <ChecklistMinimalisticBoldDuotone size={18} color="var(--fg-cyan-500)" />,
  },
  lesson: {
    label: "经验",
    tone: "purple",
    icon: <HistoryBoldDuotone size={18} color="var(--fg-violet)" />,
  },
};

const TONE_CLASS = {
  blue: "bg-fg-blue-50 text-fg-blue-500 border-fg-blue-100",
  purple: "bg-fg-violet-50 text-fg-violet border-fg-violet-100",
  green: "bg-fg-green-50 text-fg-green-500 border-fg-green-100",
  yellow: "bg-fg-yellow-50 text-fg-yellow-700 border-fg-yellow-100",
  cyan: "bg-fg-cyan-50 text-fg-cyan-700 border-fg-cyan-100",
  grey: "bg-fg-grey-50 text-fg-grey-700 border-fg-grey-200",
} as const;

export function MemoryWorkbench() {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>("pending");
  const [candidates, setCandidates] = useState(memoryCandidates);
  const [selected, setSelected] = useState<MemoryAsset | null>(null);

  const pendingCandidates = candidates.filter((item) => item.status === "candidate");
  const allActive = [...activeMemories, ...candidates.filter((item) => item.status === "active")];

  function updateStatus(asset: MemoryAsset, status: MemoryAsset["status"]) {
    setCandidates((items) =>
      items.map((item) => (item.id === asset.id ? { ...item, status } : item)),
    );
    setSelected((current) => (current?.id === asset.id ? { ...asset, status } : current));
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-0 flex-col overflow-hidden bg-fg-grey-50 px-4 pb-4 pt-1">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1360px] flex-col gap-5">
        <MemoryBanner />

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-lg border border-fg-grey-200 bg-fg-white p-4">
          <TabBar
            color="blue"
            surface="inline"
            tabs={[
              { label: "待确认", active: activeTab === "pending", badge: pendingCandidates.length },
              { label: "已沉淀", active: activeTab === "settled", badge: allActive.length },
              { label: "证据链", active: activeTab === "evidence" },
            ]}
            onChange={(index) => setActiveTab(["pending", "settled", "evidence"][index] as WorkbenchTab)}
          />

          <div className="flex flex-col gap-2 rounded-lg bg-fg-grey-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm leading-6 text-fg-grey-900">
              {activeTab === "pending"
                ? `今天从 1 段对话中沉淀 ${pendingCandidates.length} 条候选：偏好、决策、技能、规则。`
                : activeTab === "settled"
                  ? `${allActive.length} 条已沉淀资产正在影响后续 Agent：偏好、技能、规则。`
                  : "每条工作记忆都能回到原始对话、文件或人工确认记录。"}
            </p>
            <span className="text-xs font-medium text-fg-grey-700">
              {activeTab === "pending" ? "收下后才会生效" : "可随时修改、暂停或归档"}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {activeTab === "pending" ? (
              <TodayView
                candidates={pendingCandidates}
                selected={selected}
                onSelect={setSelected}
                onAccept={(asset) => updateStatus(asset, "active")}
                onIgnore={(asset) => updateStatus(asset, "ignored")}
              />
            ) : activeTab === "settled" ? (
              <AssetsView assets={allActive} onSelect={setSelected} />
            ) : (
              <EvidenceView assets={[...candidates, ...activeMemories]} onSelect={setSelected} />
            )}
          </div>
        </div>
      </div>

      {selected ? <MemoryDetailDrawer asset={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

function MemoryBanner() {
  return (
    <section className="relative min-h-[250px] overflow-hidden rounded-lg border border-fg-grey-200 bg-fg-white">
      <Image
        src="/images/memory-banner-bg.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="1200px"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--fg-white)_0%,var(--fg-white)_30%,rgba(255,255,255,0.86)_44%,rgba(255,255,255,0.32)_60%,rgba(255,255,255,0)_100%)]" />
      <div className="relative z-10 flex min-h-[250px] max-w-[620px] flex-col justify-center px-6 py-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fg-blue-500">
          <CommandBoldDuotone size={16} color="var(--fg-blue-500)" />
          Forge Memory
        </div>
        <h2 className="mt-3 font-display text-2xl font-bold tracking-fg text-fg-black">
          让每次协作沉淀成工作记忆
        </h2>
        <p className="mt-2 max-w-[520px] text-sm leading-6 text-fg-grey-700">
          从聊天中提炼偏好、技能和规则，让 Agent 按你的方式工作。
        </p>
        <button
          type="button"
          className="mt-4 flex w-fit items-center gap-1.5 text-sm font-semibold text-fg-blue-500 transition hover:text-fg-blue-700"
        >
          了解机制
          <AltArrowRightLinear size={14} color="currentColor" />
        </button>
      </div>
    </section>
  );
}

function TodayView({
  candidates,
  selected,
  onSelect,
  onAccept,
  onIgnore,
}: {
  candidates: MemoryAsset[];
  selected: MemoryAsset | null;
  onSelect: (asset: MemoryAsset) => void;
  onAccept: (asset: MemoryAsset) => void;
  onIgnore: (asset: MemoryAsset) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="overflow-hidden rounded-lg border border-fg-grey-200 bg-fg-white">
        {candidates.map((asset) => (
          <MemoryInboxRow
            key={asset.id}
            asset={asset}
            selected={selected?.id === asset.id}
            onSelect={() => onSelect(asset)}
            onAccept={() => onAccept(asset)}
            onIgnore={() => onIgnore(asset)}
          />
        ))}
      </div>
      <aside className="flex flex-col gap-4 rounded-lg border border-fg-grey-200 bg-fg-grey-50 p-4">
        <div>
          <h3 className="font-display text-base font-bold text-fg-black">下次聊天会发生什么</h3>
          <p className="mt-1 text-xs leading-5 text-fg-grey-700">
            已确认的工作记忆会按意图自动加载；技能和规则会改变执行方式。
          </p>
        </div>
        <div className="rounded-lg border border-fg-grey-200 bg-fg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fg-grey-700">
            <RefreshLinear size={14} color="var(--fg-grey-700)" />
            将应用
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <AppliedMemory label="中文输出偏好" />
            <AppliedMemory label="Forge UI 开发规则" />
            <AppliedMemory label="产品设计评估技能" muted />
          </div>
        </div>
      </aside>
    </div>
  );
}

function AssetsView({
  assets,
  onSelect,
}: {
  assets: MemoryAsset[];
  onSelect: (asset: MemoryAsset) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {(["preference", "skill", "rule"] as MemoryAssetType[]).map((type) => {
        const group = assets.filter((asset) => asset.type === type);
        const meta = TYPE_META[type];
        return (
          <section key={type} className="rounded-lg border border-fg-grey-200 bg-fg-grey-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {meta.icon}
                <h3 className="font-display text-base font-bold text-fg-black">{meta.label}</h3>
              </div>
              <span className="text-xs font-medium text-fg-grey-700">{group.length} 条</span>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {group.length > 0 ? (
                group.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => onSelect(asset)}
                    className="rounded-lg border border-fg-grey-200 bg-fg-white p-4 text-left transition hover:border-fg-blue-500"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold leading-5 text-fg-black">{asset.title}</h4>
                          <StatusBadge label="启用中" color="green" />
                        </div>
                      </div>
                      <AltArrowRightLinear size={14} color="var(--fg-grey-700)" />
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-fg-grey-700">
                      {asset.content}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-fg-grey-100 pt-3">
                      <span className="text-xs font-medium text-fg-blue-500">查看</span>
                      <span className="text-xs text-fg-grey-400">·</span>
                      <span className="text-xs font-medium text-fg-grey-700">修改</span>
                      <span className="text-xs text-fg-grey-400">·</span>
                      <span className="text-xs font-medium text-fg-grey-700">暂停</span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-fg-grey-200 bg-fg-white p-4 text-xs leading-5 text-fg-grey-700">
                  暂无已启用资产。
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function EvidenceView({
  assets,
  onSelect,
}: {
  assets: MemoryAsset[];
  onSelect: (asset: MemoryAsset) => void;
}) {
  return (
    <div className="grid gap-3">
      {assets.slice(0, 6).map((asset) => {
        const evidence = asset.evidence[0];
        const meta = TYPE_META[asset.type];
        return (
          <button
            key={asset.id}
            type="button"
            onClick={() => onSelect(asset)}
            className="grid gap-3 rounded-lg border border-fg-grey-200 bg-fg-white p-4 text-left transition hover:border-fg-blue-500 md:grid-cols-[160px_minmax(0,1fr)_160px]"
          >
            <div className="flex items-center gap-2">
              {meta.icon}
              <span className="text-sm font-semibold text-fg-black">{meta.label}</span>
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-fg-black">{asset.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-fg-grey-700">
                “{evidence?.quote ?? asset.content}”
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-fg-grey-700 md:justify-end">
              <span>{evidence?.time}</span>
              <EyeLinear size={15} color="var(--fg-grey-700)" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MemoryInboxRow({
  asset,
  selected,
  onSelect,
  onAccept,
  onIgnore,
}: {
  asset: MemoryAsset;
  selected: boolean;
  onSelect: () => void;
  onAccept: () => void;
  onIgnore: () => void;
}) {
  const meta = TYPE_META[asset.type];

  return (
    <div
      className={
        selected
          ? "grid gap-3 border-b border-fg-blue-100 bg-fg-blue-50/40 p-4 last:border-b-0 lg:grid-cols-[96px_minmax(0,1fr)_64px_188px]"
          : "grid gap-3 border-b border-fg-grey-100 bg-fg-white p-4 transition last:border-b-0 hover:bg-fg-grey-50 lg:grid-cols-[96px_minmax(0,1fr)_64px_188px]"
      }
    >
      <div className="flex items-start">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold ${
            TONE_CLASS[meta.tone]
          }`}
        >
          {meta.icon}
          {meta.label}
        </span>
      </div>
      <button type="button" onClick={onSelect} className="min-w-0 text-left">
        <h3 className="truncate text-sm font-semibold text-fg-black">{asset.title}</h3>
        <p className="mt-1 line-clamp-1 text-xs leading-5 text-fg-grey-700">{asset.content}</p>
      </button>
      <div className="flex items-start lg:justify-end">
        <span className="rounded-full bg-fg-blue-500 px-2 py-1 text-xs font-semibold text-fg-white">
          {Math.round(asset.confidence * 100)}%
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        <Button
          type="button"
          color="blue"
          variant="primary"
          size="sm"
          iconLeft={<CheckCircleBoldDuotone size={14} color="currentColor" />}
          onClick={onAccept}
        >
          收下
        </Button>
          <button
            type="button"
            onClick={onSelect}
          className="text-xs font-medium text-fg-blue-500 transition hover:text-fg-blue-700"
          >
            证据
          </button>
        <button
          type="button"
          onClick={onIgnore}
          className="text-xs font-medium text-fg-grey-700 transition hover:text-fg-grey-900"
        >
          忽略
        </button>
      </div>
    </div>
  );
}

function MemoryDetailDrawer({ asset, onClose }: { asset: MemoryAsset; onClose: () => void }) {
  const meta = TYPE_META[asset.type];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-fg-black/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[460px] flex-col bg-fg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-fg-grey-200 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fg-grey-700">
              {meta.icon}
              {meta.label}
            </div>
            <h2 className="mt-2 font-display text-lg font-bold leading-6 text-fg-black">{asset.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex size-8 shrink-0 items-center justify-center rounded text-fg-grey-700 transition hover:bg-fg-grey-100"
          >
            <CloseCircleBoldDuotone size={20} color="currentColor" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <section className="rounded-lg border border-fg-grey-200 bg-fg-grey-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <StatusBadge
                label={asset.status === "candidate" ? "待确认" : asset.status === "active" ? "已启用" : "已忽略"}
                color={asset.status === "active" ? "green" : asset.status === "ignored" ? "grey" : "yellow"}
              />
              <span className="text-xs font-medium text-fg-grey-700">
                置信度 {Math.round(asset.confidence * 100)}%
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-fg-black">{asset.content}</p>
          </section>

          {asset.type === "skill" ? <SkillDetails asset={asset} /> : null}
          {asset.type === "rule" ? <RuleDetails asset={asset} /> : null}

          <section className="mt-5">
            <h3 className="font-display text-base font-bold text-fg-black">为什么记住这个</h3>
            <div className="mt-3 flex flex-col gap-3">
              {asset.evidence.map((evidence) => (
                <div key={evidence.id} className="rounded-lg border border-fg-grey-200 bg-fg-white p-4">
                  <div className="flex items-center justify-between gap-3 text-xs text-fg-grey-700">
                    <span className="font-semibold text-fg-grey-900">{evidence.label}</span>
                    <span>{evidence.time}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-fg-black">“{evidence.quote}”</p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-fg-blue-500">
                    <LinkLinear size={12} color="currentColor" />
                    {evidence.source}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-fg-grey-200 px-5 py-4">
          <Button
            type="button"
            color="grey"
            variant="secondary"
            size="sm"
            iconLeft={<Pen2Linear size={14} color="currentColor" />}
          >
            修改
          </Button>
          <Button type="button" color="blue" variant="primary" size="sm" onClick={onClose}>
            完成
          </Button>
        </footer>
      </aside>
    </>
  );
}

function SkillDetails({ asset }: { asset: Extract<MemoryAsset, { type: "skill" }> }) {
  return (
    <section className="mt-5 rounded-lg border border-fg-green-100 bg-fg-green-50 p-4">
      <h3 className="flex items-center gap-2 font-display text-base font-bold text-fg-black">
        <BoltBoldDuotone size={18} color="var(--fg-green-500)" />
        技能执行方式
      </h3>
      <ol className="mt-3 flex flex-col gap-2">
        {asset.steps.map((step, index) => (
          <li key={step} className="flex gap-2 text-sm leading-6 text-fg-grey-900">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-fg-white text-xs font-semibold text-fg-green-500">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}

function RuleDetails({ asset }: { asset: Extract<MemoryAsset, { type: "rule" }> }) {
  return (
    <section className="mt-5 rounded-lg border border-fg-yellow-100 bg-fg-yellow-50 p-4">
      <h3 className="flex items-center gap-2 font-display text-base font-bold text-fg-black">
        <ShieldCheckBoldDuotone size={18} color="var(--fg-yellow)" />
        规则影响范围
      </h3>
      <div className="mt-3 grid gap-3">
        <RuleList title="必须检查" items={asset.requiredChecks} />
        <RuleList title="禁止动作" items={asset.blockedActions} />
      </div>
    </section>
  );
}

function RuleList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-fg-grey-700">{title}</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-5 text-fg-grey-900">
            <CheckCircleBoldDuotone size={15} color="var(--fg-yellow)" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AppliedMemory({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <div
      className={
        muted
          ? "flex items-center gap-2 rounded-lg border border-dashed border-fg-grey-200 px-3 py-2 text-xs font-medium text-fg-grey-500"
          : "flex items-center gap-2 rounded-lg border border-fg-blue-100 bg-fg-blue-50 px-3 py-2 text-xs font-medium text-fg-blue-500"
      }
    >
      {muted ? (
        <LayersBoldDuotone size={14} color="var(--fg-grey-500)" />
      ) : (
        <DocumentTextBoldDuotone size={14} color="var(--fg-blue-500)" />
      )}
      {label}
    </div>
  );
}
