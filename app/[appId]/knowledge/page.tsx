import { AppShell } from "@/app/_components/app-shell";
import { MemoryWorkbench } from "@/app/_components/memory/memory-workbench";

export default function KnowledgePage() {
  return (
    <AppShell
      pageTitle="工作记忆"
      primaryAction={{ label: "整理最近对话" }}
      secondaryAction={{ label: "导入规范" }}
      searchPlaceholder="搜索偏好、技能、规则..."
    >
      <MemoryWorkbench />
    </AppShell>
  );
}
