import { AppShell } from "@/app/_components/app-shell";
import { SettingsWorkbench } from "@/app/_components/settings/settings-workbench";

export default function SettingsPage() {
  return (
    <AppShell pageTitle="设置" searchPlaceholder="搜索设置项">
      <SettingsWorkbench />
    </AppShell>
  );
}
