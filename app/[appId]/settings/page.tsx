import { AppShell } from "@/app/_components/app-shell";
import { PagePlaceholder } from "@/app/_components/page-placeholder";

export default function SettingsPage() {
  return (
    <AppShell pageTitle="设置">
      <PagePlaceholder pageLabel="设置" description="这里放当前 App 的配置和长期记忆。" />
    </AppShell>
  );
}
