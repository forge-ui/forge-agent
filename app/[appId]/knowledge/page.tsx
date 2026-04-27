import { AppShell } from "@/app/_components/app-shell";
import { PagePlaceholder } from "@/app/_components/page-placeholder";

export default function KnowledgePage() {
  return (
    <AppShell pageTitle="知识库" primaryAction={{ label: "上传文件" }}>
      <PagePlaceholder pageLabel="知识库" description="这里放当前 App 能读到的文件。" />
    </AppShell>
  );
}
