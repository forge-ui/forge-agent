export type MemoryAssetType =
  | "preference"
  | "fact"
  | "decision"
  | "skill"
  | "rule"
  | "workflow"
  | "lesson";

export type MemoryAssetStatus =
  | "candidate"
  | "active"
  | "ignored"
  | "stale"
  | "conflicted"
  | "archived";

export type MemoryScope = "user" | "app" | "team" | "global";

export type MemoryEvidence = {
  id: string;
  label: string;
  quote: string;
  source: string;
  time: string;
};

export type MemoryBaseAsset = {
  id: string;
  appId: string;
  type: MemoryAssetType;
  title: string;
  content: string;
  status: MemoryAssetStatus;
  confidence: number;
  scope: MemoryScope;
  tags: string[];
  sourceConversationTitle: string;
  evidence: MemoryEvidence[];
  createdAt: string;
  updatedAt: string;
};

export type SkillMemoryAsset = MemoryBaseAsset & {
  type: "skill";
  triggers: string[];
  inputs: string[];
  steps: string[];
  outputFormat: string;
  guardrails: string[];
};

export type RuleMemoryAsset = MemoryBaseAsset & {
  type: "rule";
  appliesTo: string[];
  requiredChecks: string[];
  blockedActions: string[];
  severity: "info" | "warn" | "block";
};

export type WorkflowMemoryAsset = MemoryBaseAsset & {
  type: "workflow";
  stages: {
    name: string;
    goal: string;
    checks: string[];
  }[];
};

export type StandardMemoryAsset = MemoryBaseAsset & {
  type: Exclude<MemoryAssetType, "skill" | "rule" | "workflow">;
};

export type MemoryAsset =
  | StandardMemoryAsset
  | SkillMemoryAsset
  | RuleMemoryAsset
  | WorkflowMemoryAsset;
